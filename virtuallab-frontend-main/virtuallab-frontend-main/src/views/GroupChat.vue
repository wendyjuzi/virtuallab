<template>
  <div class="page-container">
    <!-- 背景装饰 -->
    <div class="background-design">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
      <div class="animated-lines">
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
      <div class="glow-lines">
        <div class="glow-line glow-line-1"></div>
        <div class="glow-line glow-line-2"></div>
        <div class="glow-line glow-line-3"></div>
        <div class="glow-line glow-line-4"></div>
      </div>
    </div>

    <div class="chat-container">
      <!-- 左侧聊天室列表 -->
      <div class="chat-room-list">
        <div class="list-header">
          <h3>我的聊天室</h3>
        </div>

        <div
          v-for="teamId in validTeamList"
          :key="teamId"
          class="chat-card"
          :class="{ active: teamId === currentTeamId }"
          @click="selectChatRoom(teamId)"
        >
          <div class="card-content">
            <div class="team-avatar"><span>{{ teamId }}</span></div>
            <div class="team-info">
              <div class="team-name">队伍 {{ teamId }}</div>
              <div class="team-desc">点击进入聊天室</div>
            </div>
          </div>
        </div>

        <div v-if="validTeamList.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <p>暂无可用的聊天室</p>
        </div>
      </div>

      <!-- 右侧聊天界面 -->
      <div class="chat-main">
        <div class="chat-header">
          <div class="header-left">
            <button class="back-button" @click="goBack">
              <i class="back-icon">←</i>
              返回
            </button>
            <h2>聊天室 <span class="team-badge">队伍 ID：{{ currentTeamId }}</span></h2>
          </div>
        </div>

        <div class="messages" ref="messagesContainer">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="message-item"
            :class="{ 'own-message': msg.studentId === userStore.user.id }"
          >
            <div class="avatar-container">
              <img :src="getAvatarUrl(msg.studentId)" alt="头像" class="avatar" />
              <span class="user-name">用户 {{ msg.studentId }}</span>
            </div>
            <div class="message-content">
              <div class="text" v-html="formatMessage(msg.content)"></div>
              <div class="message-time" v-if="msg.createdAt">{{ formatTime(msg.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div class="message-input">
          <input v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" />
          <button @click="sendMessage" :disabled="!newMessage.trim()">
            <i class="send-icon">➤</i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const teamList = ref<number[]>([])
const currentTeamId = ref<number | null>(null)
const loading = ref(false)
const newMessage = ref('')
const messages = ref<{ studentId: number; content: string; createdAt?: string }[]>([])
const messagesContainer = ref<HTMLElement | null>(null)

let stompClient: Client

const validTeamList = computed(() =>
  Array.isArray(teamList.value) ? teamList.value.filter(id => id !== null && id !== undefined) : []
)

const getAvatarUrl = (studentId: number) => {
  const avatars = [
    'https://i.pravatar.cc/40?img=1',
    'https://i.pravatar.cc/40?img=2',
    'https://i.pravatar.cc/40?img=3',
    'https://i.pravatar.cc/40?img=4',
    'https://i.pravatar.cc/40?img=5'
  ]
  return avatars[studentId % avatars.length]
}

const formatMessage = (content: string) => content?.replace(/\n/g, '<br />')
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const fetchTeams = async () => {
  loading.value = true
  try {
    const token = userStore.token
    if (!token) return router.push('/login')
    const res = await axios.get('/api/experiment/project/chat/teams', {
      headers: { Authorization: `Bearer ${token}` },
      params: { userId: userStore.user?.id || null }
    })
    teamList.value = res.data || []
    if (teamList.value.length > 0) {
      selectChatRoom(teamList.value[0])
    }
  } catch (err) {
    console.error('获取聊天室失败', err)
  } finally {
    loading.value = false
  }
}

const fetchHistory = async (teamId: number) => {
  try {
    const res = await axios.get(`/api/history`, { params: { teamId } })
    messages.value = res.data || []
    scrollToBottom()
  } catch (err) {
    console.error('加载历史消息失败', err)
  }
}

const setupStompClient = (teamId: number) => {
  stompClient?.deactivate()
  stompClient = new Client({
    brokerURL: undefined,
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      stompClient.subscribe(`/topic/team/${teamId}`, (message) => {
        const msgBody = JSON.parse(message.body)
        messages.value.push(msgBody)
        scrollToBottom()
      })
    },
    onStompError: (frame) => {
      console.error('STOMP 错误', frame)
    },
  })
  stompClient.activate()
}

const selectChatRoom = (teamId: number) => {
  currentTeamId.value = teamId
  fetchHistory(teamId)
  setupStompClient(teamId)
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !currentTeamId.value) return
  const now = new Date().toISOString()
  stompClient.publish({
    destination: '/app/chat',
    body: JSON.stringify({
      studentId: userStore.user.id,
      teamId: currentTeamId.value,
      content: newMessage.value,
      createdAt: now
    })
  })
  newMessage.value = ''
}

const goBack = () => router.back()

onMounted(() => {
  fetchTeams()
})

onUnmounted(() => {
  stompClient?.deactivate()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 50%, #fcfaff 100%);
}

.background-design {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}

.bg-circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #d8b4fe 0%, #e9d5ff 100%);
  top: -200px;
  left: -100px;
  filter: blur(60px);
}

.bg-circle-2 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #c084fc 0%, #ddd6fe 100%);
  bottom: -300px;
  right: -200px;
  filter: blur(80px);
}

.bg-circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
  top: 40%;
  right: 15%;
  filter: blur(40px);
}

/* 动态线条特效 */
.animated-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  opacity: 0.7;
}

.line {
  position: absolute;
  height: 3px;
  background: linear-gradient(90deg, transparent, #c084fc, #d8b4fe, #c084fc, transparent);
  box-shadow: 
    0 0 8px #d8b4fe,
    0 0 12px #c084fc;
  animation: moveLine 15s infinite linear;
  opacity: 0;
  border-radius: 3px;
}

.line:nth-child(1) {
  width: 40%;
  top: 15%;
  left: -40%;
  animation-delay: 0s;
  animation-duration: 20s;
  transform: rotate(25deg) translateY(5px);
  height: 4px;
}

.line:nth-child(2) {
  width: 50%;
  top: 35%;
  left: -50%;
  animation-delay: 2s;
  animation-duration: 23s;
  transform: rotate(-15deg) translateY(-8px);
  height: 2px;
}

.line:nth-child(3) {
  width: 35%;
  top: 55%;
  left: -35%;
  animation-delay: 5s;
  animation-duration: 18s;
  transform: rotate(10deg) translateY(10px);
  height: 5px;
}

.line:nth-child(4) {
  width: 45%;
  top: 75%;
  left: -45%;
  animation-delay: 7s;
  animation-duration: 25s;
  transform: rotate(-20deg) translateY(-5px);
  height: 3px;
}

.line:nth-child(5) {
  width: 55%;
  top: 20%;
  right: -55%;
  animation-delay: 3s;
  animation-duration: 22s;
  transform: rotate(-30deg) translateY(8px);
  height: 4px;
}

.line:nth-child(6) {
  width: 40%;
  top: 40%;
  right: -40%;
  animation-delay: 6s;
  animation-duration: 19s;
  transform: rotate(15deg) translateY(-10px);
  height: 2px;
}

.line:nth-child(7) {
  width: 50%;
  top: 60%;
  right: -50%;
  animation-delay: 9s;
  animation-duration: 24s;
  transform: rotate(-5deg) translateY(5px);
  height: 5px;
}

.line:nth-child(8) {
  width: 35%;
  top: 80%;
  right: -35%;
  animation-delay: 11s;
  animation-duration: 21s;
  transform: rotate(25deg) translateY(-8px);
  height: 3px;
}

/* 不规则发光线条 */
.glow-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.glow-line {
  position: absolute;
  background-repeat: no-repeat;
  background-size: contain;
  filter: drop-shadow(0 0 8px #c084fc);
  opacity: 0.8;
  animation: pulsate 4s infinite ease-in-out;
}

.glow-line-1 {
  width: 400px;
  height: 200px;
  top: 10%;
  left: 5%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' width='400' height='200'%3E%3Cpath d='M20,100 Q60,20 120,120 T220,80 T320,140' stroke='%23c084fc' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  animation-delay: 0s;
  display: none; /* 隐藏左侧不动只变色的曲线 */
}

.glow-line-2 {
  width: 350px;
  height: 180px;
  bottom: 15%;
  right: 10%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 350 180' width='350' height='180'%3E%3Cpath d='M20,90 C50,20 100,160 150,60 S250,140 330,70' stroke='%23d8b4fe' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  animation-delay: 1s;
}

.glow-line-3 {
  width: 450px;
  height: 250px;
  top: 40%;
  right: 20%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 450 250' width='450' height='250'%3E%3Cpath d='M20,125 Q100,50 200,150 T400,100' stroke='%23a855f7' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  animation-delay: 2s;
}

.glow-line-4 {
  width: 300px;
  height: 200px;
  top: 60%;
  left: 15%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='300' height='200'%3E%3Cpath d='M20,100 C40,50 80,150 120,70 S180,130 220,50 S260,120 280,80' stroke='%23c084fc' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  animation-delay: 1.5s;
}

@keyframes moveLine {
  0% {
    left: -100%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes pulsate {
  0%, 100% {
    opacity: 0.6;
    filter: drop-shadow(0 0 8px #c084fc);
  }
  50% {
    opacity: 1;
    filter: drop-shadow(0 0 15px #a855f7);
  }
}

/* 移除画笔特效，替换为发光线条 */
.brush-strokes {
  display: none;
}

.chat-container {
  display: flex;
  height: 90vh;
  width: 98%;
  max-width: 1600px;
  max-height: 900px;
  margin: 0 auto;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 20px 40px rgba(192, 132, 252, 0.12),
    0 0 0 1px rgba(216, 180, 254, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.85);
  font-family: 'Inter', 'Segoe UI', sans-serif;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

/* 左侧聊天室列表 */
.chat-room-list {
  width: 320px;
  display: flex;
  flex-direction: column;
  background: rgba(250, 250, 252, 0.9);
  border-right: 1px solid rgba(233, 213, 255, 0.4);
  overflow: hidden;
}

.list-header {
  background: linear-gradient(135deg, #c084fc 0%, #d8b4fe 100%);
  color: white;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(192, 132, 252, 0.1);
  position: relative;
  overflow: hidden;
}

.list-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.list-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chat-card {
  padding: 18px;
  border-bottom: 1px solid rgba(233, 213, 255, 0.3);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.chat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #d8b4fe 0%, transparent 100%);
  opacity: 0.1;
  transition: width 0.3s ease;
}

.chat-card:hover {
  background-color: rgba(233, 213, 255, 0.15);
}

.chat-card:hover::before {
  width: 5px;
}

.chat-card.active {
  background-color: rgba(233, 213, 255, 0.25);
}

.chat-card.active::before {
  width: 5px;
  opacity: 1;
}

.card-content {
  display: flex;
  align-items: center;
}

.team-avatar {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 14px;
  box-shadow: 
    0 3px 8px rgba(192, 132, 252, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chat-card:hover .team-avatar {
  transform: scale(1.05);
  box-shadow: 
    0 4px 12px rgba(192, 132, 252, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.team-info {
  flex: 1;
  overflow: hidden;
}

.team-name {
  font-weight: 600;
  color: #8b5cf6;
  margin-bottom: 6px;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-desc {
  font-size: 0.9rem;
  color: #a78bfa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #a78bfa;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.7;
}

.empty-state p {
  font-size: 1rem;
  text-align: center;
}

/* 右侧聊天界面 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止flex子项溢出 */
  background: rgba(255, 255, 255, 0.7);
}

.chat-header {
  background: linear-gradient(135deg, #c084fc 0%, #d8b4fe 100%);
  color: white;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(192, 132, 252, 0.1);
  position: relative;
  overflow: hidden;
}

.chat-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 14px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 18px;
  box-shadow: 
    0 2px 5px rgba(0, 0, 0, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-3px);
}

.back-icon {
  margin-right: 6px;
  font-style: normal;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.team-badge {
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 12px;
  border-radius: 14px;
  margin-left: 12px;
  font-weight: normal;
  backdrop-filter: blur(5px);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
  background: rgba(250, 245, 255, 0.5);
  scroll-behavior: smooth;
  background-image: 
    radial-gradient(circle at 25px 25px, rgba(192, 132, 252, 0.02) 2px, transparent 0),
    radial-gradient(circle at 75px 75px, rgba(192, 132, 252, 0.02) 2px, transparent 0);
  background-size: 100px 100px;
}

.message-item {
  display: flex;
  margin-bottom: 28px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  min-width: 60px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 
    0 3px 10px rgba(192, 132, 252, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.user-name {
  font-size: 0.8rem;
  margin-top: 8px;
  color: #a78bfa;
  text-align: center;
}

.message-content {
  background: white;
  padding: 18px 22px;
  border-radius: 18px;
  box-shadow: 
    0 2px 6px rgba(192, 132, 252, 0.05),
    0 0 0 1px rgba(192, 132, 252, 0.05);
  max-width: 70%;
  position: relative;
  transition: transform 0.2s ease;
}

.message-content:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(192, 132, 252, 0.08),
    0 0 0 1px rgba(192, 132, 252, 0.08);
}

.text {
  white-space: pre-wrap;
  font-size: 1.05em;
  line-height: 1.5;
  color: #8b5cf6;
  word-break: break-word;
}

.message-time {
  font-size: 0.8rem;
  color: #a78bfa;
  text-align: right;
  margin-top: 8px;
}

.own-message {
  flex-direction: row-reverse;
}

.own-message .avatar-container {
  margin-right: 0;
  margin-left: 16px;
}

.own-message .message-content {
  background: linear-gradient(135deg, #c084fc 0%, #d8b4fe 100%);
  color: white;
  box-shadow: 
    0 2px 6px rgba(192, 132, 252, 0.1),
    0 0 0 1px rgba(192, 132, 252, 0.05);
}

.own-message .text {
  color: white;
}

.own-message .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message-input {
  display: flex;
  padding: 22px 28px;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(233, 213, 255, 0.4);
}

.message-input input {
  flex: 1;
  padding: 16px 22px;
  font-size: 1.05em;
  border: 1px solid #e9d5ff;
  border-radius: 18px;
  outline: none;
  transition: all 0.3s;
  background: #fcfaff;
  box-shadow: 
    inset 0 1px 2px rgba(192, 132, 252, 0.05),
    0 0 0 1px rgba(192, 132, 252, 0.02);
}

.message-input input:focus {
  border-color: #d8b4fe;
  background: white;
  box-shadow: 
    0 0 0 3px rgba(192, 132, 252, 0.1),
    inset 0 1px 2px rgba(192, 132, 252, 0.05);
}

.message-input button {
  width: 56px;
  height: 56px;
  margin-left: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #c084fc 0%, #d8b4fe 100%);
  border: none;
  color: white;
  font-size: 1.3em;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 3px 8px rgba(192, 132, 252, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.message-input button:hover {
  transform: scale(1.05);
  box-shadow: 
    0 4px 12px rgba(192, 132, 252, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.message-input button:disabled {
  background: #e9d5ff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 滚动条样式 */
.messages::-webkit-scrollbar,
.chat-room-list::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track,
.chat-room-list::-webkit-scrollbar-track {
  background: rgba(233, 213, 255, 0.3);
}

.messages::-webkit-scrollbar-thumb,
.chat-room-list::-webkit-scrollbar-thumb {
  background: #d8b4fe;
  border-radius: 10px;
}

.messages::-webkit-scrollbar-thumb:hover,
.chat-room-list::-webkit-scrollbar-thumb:hover {
  background: #c084fc;
}

@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }
  
  .chat-container {
    height: calc(100vh - 20px);
    width: 100%;
    border-radius: 12px;
    max-height: none;
    flex-direction: column;
  }
  
  .chat-room-list {
    width: 100%;
    height: 35%;
    min-height: 180px;
    border-right: none;
    border-bottom: 1px solid rgba(233, 213, 255, 0.8);
    overflow-y: auto;
  }
  
  .chat-main {
    height: 65%;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .bg-circle-1, .bg-circle-2, .bg-circle-3 {
    opacity: 0.2; /* 降低背景圆圈在移动设备上的不透明度 */
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .back-button {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .chat-header h2 {
    font-size: 1.2rem;
  }
  
  .message-input {
    padding: 12px 16px;
  }
  
  .message-input input {
    padding: 10px 16px;
  }
  
  .message-input button {
    width: 44px;
    height: 44px;
  }
}
</style>




