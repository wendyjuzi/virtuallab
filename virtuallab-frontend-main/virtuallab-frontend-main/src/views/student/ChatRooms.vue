<template>
  <div class="chat-room-container">
    <div class="header">
      <button class="back-button" @click="goBack">
        <i class="back-icon">←</i>
        返回
      </button>
      <h2>我的聊天室</h2>
    </div>
    
    <div class="chat-room-list">
      <div 
        v-for="teamId in validTeamList"
        :key="teamId"
        class="chat-card"
        @click="enterChatRoom(teamId)"
      >
        <div class="card-content">
          <div class="team-avatar">
            <span>{{ teamId }}</span>
          </div>
          <div class="team-info">
            <div class="team-name">队伍 {{ teamId }}</div>
            <div class="team-desc">点击进入聊天室</div>
          </div>
          <div class="enter-button">
            <i class="enter-icon">→</i>
          </div>
        </div>
      </div>
      
      <div v-if="validTeamList.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>暂无可用的聊天室</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const teamList = ref<number[]>([])
const loading = ref(false)

const validTeamList = computed(() => {
  return Array.isArray(teamList.value)
    ? teamList.value.filter(teamId => teamId !== null && teamId !== undefined)
    : []
})

const fetchTeams = async () => {
  try {
    loading.value = true
    const token = userStore.token
    if (!token) {
      router.push('/login')
      return
    }

    const res = await axios.get('/api/experiment/project/chat/teams', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        userId: userStore.user?.id || null
      }
    })
    teamList.value = res.data
  } catch (error) {
    console.error('获取聊天室列表失败', error)
  } finally {
    loading.value = false
  }
}

const enterChatRoom = (teamId: number) => {
  router.push(`/student/chat-room/${teamId}`)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchTeams()
})
</script>

<style scoped>
.chat-room-container {
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  background: linear-gradient(135deg, #e6f2ff 0%, #f8faff 100%);
  min-height: calc(100vh - 40px);
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(25, 118, 210, 0.1);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.back-button {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.back-button:hover {
  transform: translateX(-3px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.back-icon {
  margin-right: 6px;
  font-style: normal;
}

.header h2 {
  font-size: 1.6rem;
  color: #1976d2;
  margin: 0;
  font-weight: 600;
  flex: 1;
  text-align: center;
  margin-right: 76px; /* 平衡返回按钮的宽度 */
}

.chat-room-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.chat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(25, 118, 210, 0.2);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.team-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 4px;
}

.team-desc {
  font-size: 0.9rem;
  color: #78909c;
}

.enter-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.chat-card:hover .enter-button {
  background: #1976d2;
  color: white;
}

.enter-icon {
  font-style: normal;
  font-size: 1.2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #78909c;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .chat-room-container {
    padding: 16px;
    border-radius: 0;
    box-shadow: none;
  }
  
  .header h2 {
    font-size: 1.4rem;
    margin-right: 0;
  }
  
  .back-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
</style>



