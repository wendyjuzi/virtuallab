<template>
  <div class="student">
    <div class="header">
      <h1>学生实验平台</h1>
      <div class="user-info" v-if="studentInfo">
        <span>欢迎，{{ studentInfo.realName }}（{{ studentInfo.username }}）</span>
        <span>学号：{{ studentInfo.studentId }}</span>
        <span>院系：{{ studentInfo.department }}</span>
        <span>专业：{{ studentInfo.major }}</span>
        <span class="role">{{ userStore.userRole }}</span>
        <el-button @click="goToProfile" type="primary" style="margin-top: 8px;">查看个人信息</el-button>
      </div>
    </div>

    <div class="content">
      <!-- 左上：统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>我的实验</h3>
          <div class="stat-number">{{ stats.myExperiments }}</div>
          <div class="stat-label">进行中实验</div>
        </div>
        <div class="stat-card">
          <h3>完成实验</h3>
          <div class="stat-number">{{ stats.completedExperiments }}</div>
          <div class="stat-label">已完成实验</div>
        </div>
        <div class="stat-card">
          <h3>平均成绩</h3>
          <div class="stat-number">{{ stats.averageScore }}</div>
          <div class="stat-label">实验成绩</div>
        </div>
        <div class="stat-card">
          <h3>学习时长</h3>
          <div class="stat-number">25h</div>
          <div class="stat-label">本周学习</div>
        </div>
      </div>

      <!-- 左下：进度展示 -->
      <div class="progress-section">
        <div class="particles">
          <div class="particle" v-for="n in 10" :key="n" :style="{
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 2 + 's'
          }"></div>
        </div>
        <h2>Learning Progress</h2>
        <div class="progress-circle">
          <svg width="120" height="120">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff" />
                <stop offset="100%" stop-color="#f0f0f0" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="50" stroke="#e5e7eb" stroke-width="12" fill="none" />
            <circle cx="60" cy="60" r="50" stroke="url(#progressGradient)" stroke-width="12" fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="circumference - circumference * progressPercentage / 100"
              stroke-linecap="round"
              style="transition: stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)"
              :style="{ '--progress': progressPercentage + '%' }"/>
            <text x="60" y="68" text-anchor="middle" font-size="28" class = "progress-percentage" >{{ progressPercentage }}%</text>
          </svg>
        </div>
        <div class="progress-stats">
          <div class="stat-item">
            <div class="stat-value">{{ stats.completedExperiments }}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.myExperiments }}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">25h</div>
            <div class="stat-label">Study Time</div>
          </div>
        </div>
        <!-- <div class="next-milestone">
          <div class="milestone-icon">🎯</div>
          <div class="milestone-info">
            <div class="milestone-label">Next Milestone</div>
            <div class="milestone-value">{{ nextMilestone }}</div>
          </div>
        </div> -->
      </div>

      <!-- 中上：实验管理 -->
      <div class="main-section">
        <h2>Experiment Management</h2>
        <div class="experiment-grid">
          <div class="experiment-card" @click="navigateTo('/student/experiments')">
            <div class="card-icon">🧪</div>
            <div class="card-content">
              <h3>我的实验</h3>
              <p>查看和管理我的实验项目</p>
            </div>
          </div>
          <div class="experiment-card" @click="navigateTo(`/experiment/students/${studentId}/reports`)">
            <div class="card-icon">📝</div>
            <div class="card-content">
              <h3>实验报告</h3>
              <p>提交和查看实验报告</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 中下：快捷操作 -->
      <div class="quick-actions">
        <h2>QUICK</h2>
        <div class="action-buttons">
          <button class="action-btn" @click="enterLab">实验室预约</button>
          <button class="action-btn" @click="goToChatRooms">我的聊天室</button>
          <button class="action-btn" @click="goToLikeFavorite">点赞收藏</button>
        </div>
      </div>

      <!-- 右侧：AI助教 -->
      <div class="ai-assistant-section">
        <div class="phone-status-bar">
          <div class="status-left">
            <!-- 移除时间显示 -->
          </div>
          <div class="status-right">
            <div class="signal-icon"></div>
            <div class="wifi-icon"></div>
            <div class="battery-icon"></div>
          </div>
        </div>
        <h2>AI 智能助教</h2>
        <div class="ai-assistant-content">
          <AiAssistant />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { useUserStore } from '@/store/user'
import AiAssistant from '@/components/AiAssistant.vue'
import {storeToRefs} from "pinia";
import { getStudentExperiments } from '@/api/request';

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)


// 获取studentId
const userId = computed(() => user.value?.id)
const studentId = computed(() => user.value?.studentId)
console.log("当前用户id:", userId.value)
console.log("当前studentId:", studentId.value)

const studentInfo = ref<any>(null)

const stats = ref({
  myExperiments: 0,
  completedExperiments: 0,
  averageScore: 0
})

const quickList = ref<any[]>([])
const notices = ref<any[]>([])
const circumference = 2 * Math.PI * 500


const fetchStudentInfo = async () => {
  const res = await fetch(`/user/profile/${userId.value}`)
  console.log("res值为:",res)
  console.log("API响应状态:",res.status)
  const data = await res.json()
  console.log("完整API响应",data)
  if (data.code === 200) {
    studentInfo.value = data.data
    console.log("获取到的学生信息:",studentInfo.value)
  }else{
    console.error("API返回错误:",data.message)
  }
}

const goToChatRooms = () => {
  router.push('/student/chat-room')
}

const progressPercentage = computed(() => {
  if (stats.value.myExperiments === 0) return 0; // 避免除以0
  return Math.round((stats.value.completedExperiments / stats.value.myExperiments) * 100);
});

// 获取实验数据并更新统计信息
const fetchExperiments = async () => {
  try {
    const res = await getStudentExperiments({
      userId: userId.value,
      pageNum: 1,
      pageSize: 1000
    })

    if (res.code === 200 && res.data) {
      // 更新统计数据
      stats.value = {
        myExperiments: res.data.totalExperiments,
        completedExperiments: res.data.completedExperiments,
        averageScore: res.data.averageScore || 0
      };

      console.log("实验统计数据:", {
        总数: stats.value.myExperiments,
        已完成: stats.value.completedExperiments,
        平均分: stats.value.averageScore
      });

      // 如果需要使用分页数据
      const experiments = res.data.pageData.records;
      console.log("实验列表数据:", experiments);
      }
  } catch (error) {
    console.error('获取实验数据失败:', error);
  }
};
const enterLab = () => {
  router.push('/student/LabReservation')
}
const goToLikeFavorite = () => {
  router.push('/student/like-favorite')
}
const progressColor = computed(() => {
  if (progressPercentage.value < 30) return '#ef4444'; // 红色
  if (progressPercentage.value < 70) return '#f59e0b'; // 黄色
  return '#10b981'; // 绿色
});

const fetchQuickList = () => {
  quickList.value = [
    { icon: '🧪', title: '我的实验', desc: '查看和管理我的实验项目', action: () => router.push('/student/experiments') },
    { icon: '📝', title: '实验报告', desc: '提交和查看实验报告', action: () => router.push(`/experiment/students/${studentId.value}/reports`) },
    { icon: '📊', title: '成绩查询', desc: '查看实验成绩和评价', action: () => router.push('/student/scores') },
    { icon: '❤️', title: '点赞收藏', desc: '管理我的点赞和收藏', action: () => router.push('/student/like-favorite') }
  ]
}

const fetchNotices = async () => {
  const res = await fetch('/notice/list')
  const data = await res.json()
  if (data.code === 200) {
    notices.value = data.data
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

const startNewExperiment = () => {
  console.log('开始新实验')
}

const viewSchedule = () => {
  console.log('查看课表')
}

const submitReport = () => {
  console.log('提交报告')
}

const viewProgress = () => {
  console.log('查看进度')
}

const goToProfile = () => {
  router.push('/profile')
}

onMounted(() => {
  if (!userStore.user?.roles?.includes('STUDENT')) {
    router.push('/unauthorized')
  }
  fetchStudentInfo()
  fetchExperiments()
  fetchQuickList()
  fetchNotices()
})

</script>

<style scoped>
.student {
  min-height: 100vh;
  background: linear-gradient(120deg, #f5f7fa 0%, #f3e8ff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
  margin-top:-26px;
  margin-left:-24px;
  margin-right:-24px;
  margin-bottom:-26px;
}

.student::before, .student::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  z-index: 0;
  pointer-events: none;
}

.student::before {
  width: 380px;
  height: 380px;
  left: -120px;
  top: -120px;
  background: radial-gradient(circle at 30% 30%, #d8b4fe 0%, #a855f7 80%, transparent 100%);
}

.student::after {
  width: 320px;
  height: 320px;
  right: -100px;
  bottom: -100px;
  background: radial-gradient(circle at 70% 70%, #e9d5ff 0%, #c084fc 80%, transparent 100%);
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr 380px;
  grid-template-rows: minmax(320px, auto) minmax(320px, auto);
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(216, 180, 254, 0.2);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.1);
}

.header h1 {
  color: #7c3aed;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.user-info {
  text-align: right;
  color: #6b7280;
}

.user-info span {
  display: block;
  margin: 4px 0;
}

.role {
  color: #9333ea !important;
  font-weight: 600;
}

/* 左上区域：统计卡片 */
.stats-grid {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(216, 180, 254, 0.2);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.1);
  max-height: calc((100vh - 100px) / 2);
  overflow-y: auto;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
  border: 1px solid rgba(216, 180, 254, 0.2);
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card h3 {
  color: #7c3aed;
  font-size: 17px;
  margin: 0 0 10px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: #9333ea;
  margin: 10px 0;
}

.stat-label {
  color: #6b7280;
  font-size: 15px;
}

.progress-section {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  padding: 28px;
  background: linear-gradient(135deg, rgba(192, 132, 252, 0.9), rgba(216, 180, 254, 0.9)),
              url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPGRlZnM+CiAgICA8cGF0dGVybiBpZD0icGF0dGVybiIgeD0iMCIgeT0iMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHBhdGggZD0iTTAgMGw2MCA2MG0wLTYwTC02MCA2MCIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz4KPC9zdmc+');
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(192, 132, 252, 0.2);
  max-height: calc((100vh - 100px) / 2);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.progress-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
  border-radius: 16px;
}

.progress-section h2 {
  font-size: 24px;
  margin: 0 0 24px 0;
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  position: relative;
}

.progress-circle {
  position: relative;
  transform: scale(1.2);
  margin-top: 20px;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2));
}

.progress-circle::before,
.progress-circle::after {
  content: '';
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, rgba(255, 255, 255, 0.2) var(--progress), transparent 0);
  animation: rotate 3s linear infinite;
  z-index: -1;
}

.progress-circle::after {
  animation: rotate 3s linear infinite reverse;
  filter: blur(15px);
}

.progress-circle svg {
  position: relative;
  transform: rotate(-90deg);
}

.progress-circle circle {
  transition: stroke-dashoffset 1s cubic-bezier(.4,0,.2,1);
}

.progress-circle circle:first-child {
  opacity: 0.2;
  stroke: rgba(255, 255, 255, 0.2);
}

.progress-circle circle:last-child {
  stroke: white;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
  stroke-linecap: round;
  animation: strokePulse 2s ease-in-out infinite;
}

.progress-circle text {
  transform: rotate(90deg);
  transform-origin: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  fill: white;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 16px;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: particleFloat 3s ease-in-out infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes strokePulse {
  0% {
    stroke-width: 12px;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
  }
  50% {
    stroke-width: 14px;
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.7));
  }
  100% {
    stroke-width: 12px;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
  }
}

@keyframes pulse {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.3;
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0;
  }
}

/* 中上区域：实验管理 */
.main-section {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  padding: 28px;
  background: linear-gradient(135deg, rgba(233, 213, 255, 0.9), rgba(243, 232, 255, 0.9)),
              url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPGRlZnM+CiAgICA8cGF0dGVybiBpZD0icGF0dGVybiIgeD0iMCIgeT0iMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHBhdGggZD0iTTAgMGw2MCA2MG0wLTYwTC02MCA2MCIgc3Ryb2tlPSJyZ2JhKDIxNiwgMTgwLCAyNTQsIDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz4KPC9zdmc+');
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(233, 213, 255, 0.5);
  box-shadow: 0 4px 20px rgba(233, 213, 255, 0.3);
  max-height: calc((100vh - 100px) / 2);
  overflow-y: auto;
}

.main-section h2 {
  font-size: 28px;
  margin: 0;
  color: #9333ea;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(233, 213, 255, 0.8);
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-lr;
  text-orientation: mixed;
  text-transform: uppercase;
}

.experiment-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  padding-right: 80px;
}

.experiment-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 28px;
  border-radius: 12px;
  transition: transform 0.2s, background-color 0.3s;
  border: 1px solid rgba(233, 213, 255, 0.5);
  backdrop-filter: blur(5px);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 20px;
}

.experiment-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(233, 213, 255, 0.8);
  box-shadow: 0 4px 12px rgba(233, 213, 255, 0.4);
}

.card-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 8px rgba(233, 213, 255, 0.8));
  margin: 0;
}

.card-content {
  flex: 1;
}

.experiment-card h3 {
  color: #9333ea;
  font-size: 18px;
  margin: 0 0 8px 0;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
}

.experiment-card p {
  color: #7c3aed;
  font-size: 15px;
  margin: 0;
  line-height: 1.6;
  opacity: 0.7;
}

/* 中下区域：快捷操作 */
.quick-actions {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  padding: 32px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(216, 180, 254, 0.2);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.1);
  max-height: calc((100vh - 100px) / 2);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

.quick-actions h2 {
  font-size: 48px;
  line-height: 1;
  margin: 40px 0 0 0;
  color: #9333ea;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(233, 213, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.quick-actions h2::after {
  content: 'ACTIONS';
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  gap: 24px;
  justify-content: center;
  width: 100%;
  padding: 0;
  margin-top: auto;
  margin-bottom: 60px;
}

.action-btn {
  flex: 1;
  max-width: 200px;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #c084fc;
  color: white;
  box-shadow: 0 0 20px rgba(192, 132, 252, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg,
    rgba(192, 132, 252, 0.5),
    rgba(216, 180, 254, 0.5)
  );
  filter: blur(15px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  background: #d8b4fe;
  box-shadow: 0 0 30px rgba(192, 132, 252, 0.5),
              inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.action-btn:hover::before {
  opacity: 1;
}

/* 右侧区域：AI助教 */
.ai-assistant-section {
  grid-column: 3 / 4;
  grid-row: 1 / -1;
  padding: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 36px;
  border: 12px solid #4a3a5a;
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.1);
  max-height: calc(100vh - 90px);
  overflow: hidden;
  position: relative;
}

.ai-assistant-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 24px;
  background: #4a3a5a;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 2;
}

.ai-assistant-section::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: #4a3a5a;
  border-radius: 4px;
}

.ai-assistant-section h2 {
  font-size: 20px;
  margin: 0;
  padding: 16px 24px;
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: white;
  position: relative;
}

.ai-assistant-section h2::before {
  content: '';
  position: absolute;
  top: 12px;
  right: 24px;
  width: 100px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.ai-assistant-content {
  padding: 24px;
  height: calc(100% - 60px);
  overflow-y: auto;
  background: #f8f9fa;
}

/* 添加信号、WiFi、电池等图标的样式 */
.phone-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 24px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 12px;
  z-index: 3;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.signal-icon, .wifi-icon, .battery-icon {
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
}

/* 滚动条美化 */
.stats-grid::-webkit-scrollbar,
.progress-section::-webkit-scrollbar,
.main-section::-webkit-scrollbar,
.quick-actions::-webkit-scrollbar,
.ai-assistant-section::-webkit-scrollbar {
  width: 8px;
}

.stats-grid::-webkit-scrollbar-thumb,
.progress-section::-webkit-scrollbar-thumb,
.main-section::-webkit-scrollbar-thumb,
.quick-actions::-webkit-scrollbar-thumb,
.ai-assistant-section::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.2);
  border-radius: 8px;
}

@media (max-width: 1200px) {
  .content {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    gap: 28px;
  }

  .stats-grid,
  .progress-section,
  .main-section,
  .quick-actions,
  .ai-assistant-section {
    max-height: none;
  }

  .ai-assistant-section {
    grid-column: 1 / -1;
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .content {
    grid-template-columns: 1fr;
  }

  .stats-grid,
  .progress-section,
  .main-section,
  .quick-actions,
  .ai-assistant-section {
    grid-column: 1 / -1;
  }
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 24px;
  padding: 0 16px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 20px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  font-family: 'Montserrat', sans-serif;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.next-milestone {
  display: flex;
  align-items: center;
  margin-top: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: calc(100% - 32px);
  transition: transform 0.3s ease;
}

.next-milestone:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
}

.milestone-icon {
  font-size: 24px;
  margin-right: 16px;
}

.milestone-info {
  flex: 1;
}

.milestone-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.milestone-value {
  font-size: 16px;
  color: white;
  font-weight: 500;
}

.progress-percentage {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  fill: white;
  text-shadow:
      0 0 8px rgba(255, 255, 255, 0.8),
      0 0 15px rgba(192, 132, 252, 0.6);
  animation: percentagePulse 2s ease-in-out infinite;
}

@keyframes percentagePulse {
  0% {
    opacity: 0.9;
    text-shadow:
        0 0 8px rgba(255, 255, 255, 0.8),
        0 0 15px rgba(192, 132, 252, 0.6);
  }
  50% {
    opacity: 1;
    text-shadow:
        0 0 12px rgba(255, 255, 255, 1),
        0 0 20px rgba(192, 132, 252, 0.8);
  }
  100% {
    opacity: 0.9;
    text-shadow:
        0 0 8px rgba(255, 255, 255, 0.8),
        0 0 15px rgba(192, 132, 252, 0.6);
  }
}
</style>