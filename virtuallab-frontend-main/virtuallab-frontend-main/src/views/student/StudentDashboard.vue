<template>
  <div class="student-dashboard">
    <header class="apitable-navbar">
      <div class="logo">VirtualLab</div>
      <div class="nav-actions">
        <slot name="actions"></slot>
      </div>

      <!-- 添加通知组件和用户操作 -->
      <div class="user-actions">
        <NotificationBadge />  <!-- 新增的通知组件 -->
        <el-button @click="goToProfile">查看个人信息</el-button>
        <el-button type="primary" @click="goToChatRooms" style="margin-left: 10px;">我的聊天室</el-button>

      </div>
    </header>
    <main class="dashboard-main">
      <section class="welcome-section">
        <h1>欢迎回来，张三同学！</h1>
        <p>虚拟实验室助你高效学习与实验</p>
      </section>
      <section class="stats-row">
        <div class="stat-card" v-for="stat in statsList" :key="stat.title">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-value">
            <span v-text="stat.value"></span>
            <span class="stat-unit" v-if="stat.unit">{{ stat.unit }}</span>
          </div>
        </div>
      </section>
      <section class="experiment-quick">
        <div class="quick-card" v-for="item in quickList" :key="item.title" @click="item.action">
          <div class="quick-icon">{{ item.icon }}</div>
          <div class="quick-title">{{ item.title }}</div>
          <div class="quick-desc">{{ item.desc }}</div>
        </div>
      </section>
      <section class="progress-section">
        <div class="progress-title">学习进度</div>
        <div class="progress-circle">
          <svg width="120" height="120">
            <circle cx="60" cy="60" r="50" stroke="#e5e7eb" stroke-width="12" fill="none" />
            <circle cx="60" cy="60" r="50" :stroke="progressColor" stroke-width="12" fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="circumference - circumference * progress / 100"
              stroke-linecap="round"
              style="transition: stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)"/>
            <text x="60" y="68" text-anchor="middle" font-size="28" fill="#6366f1">{{ progress }}%</text>
          </svg>
        </div>
      </section>
      <section class="notice-section">
        <div class="notice-title">最新通知</div>
        <div v-if="loadingNotices" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          加载中...
        </div>
        <ul v-else class="notice-list">
          <li v-for="notice in notices" :key="notice.id">
            <span class="notice-icon">{{ getNoticeIcon(notice.type) }}</span>
            <div class="notice-content-wrapper">
              <div class="notice-title-text">{{ notice.title }}</div>
              <div class="notice-content-text">{{ notice.content }}</div>
            </div>
            <span class="notice-time">{{ formatTime(notice.createdAt) }}</span>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import {getCurrentUser} from "@/api/request"
import NotificationBadge from '@/components/NotificationBadge.vue' // 根据实际路径调整
import { getAllNotifications } from '@/api/notification' // 导入新添加的API方法
import type { Notification } from '@/store/types'
import { useUserStore } from '@/store/user'

const router = useRouter()
// 添加状态变量
const loadingNotices = ref(true)
const notices = ref<Notification[]>([]) // 使用真实的通知类型
const userStore = useUserStore()
const studentId = ref('')

// 获取当前用户信息
const fetchCurrentUser = async () => {
  try {
    const response = await getCurrentUser()
    console.log('完整响应数据:', response) // 打印整个响应对象
    console.log('response.data:', response.data) // 打印 data 部分
    studentId.value = response.data.user.studentId
    console.log('获取到的studentId为:', studentId.value)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchCurrentUser()
})

const goToProfile = () => {
  router.push('/profile')
}
const goToChatRooms = () => {
  router.push('/student/chat-rooms')
}
const notifications = ref<Notification[]>([])

// 获取通知图标
const getNoticeIcon = (type: string) => {
  const typeMap: Record<string, string> = {
    'project_submitted': '📋',
    'PROJECT_APPROVED': '✅',
    'PROJECT_REJECTED': '❌',
    'PROJECT_PUBLISHED': '🚀',
    'SYSTEM': '🔔'
  }
  return typeMap[type] || '🔔'
}
const formatTime = (time: string | null | undefined) => {
  if (!time) return '未设置时间'
  try {
    const date = new Date(time)
    return isNaN(date.getTime())
        ? '无效日期'
        : date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
  } catch (e) {
    console.error('日期格式化错误:', e)
    return '无效日期'
  }
}
const statsList = [
  { title: '我的实验', value: 3, unit: '项' },
  { title: '已完成', value: 12, unit: '项' },
  { title: '平均分', value: 85, unit: '分' },
  { title: '学习时长', value: 24, unit: '小时' }
]

const quickList = [
  { icon: '🧪', title: '我的实验', desc: '查看和管理我的实验项目', action: () => {} },
  { icon: '📚', title: '可选实验', desc: '浏览可参与的实验项目', action: () => {} },
  { icon: '📝', title: '实验报告', desc: '提交和查看实验报告', action: () => router.push(`/experiment/students/${studentId.value}/reports`)},
  { icon: '📊', title: '成绩查询', desc: '查看实验成绩和评价', action: () => {} },
  { icon: '❤️', title: '点赞收藏', desc: '管理我的点赞和收藏', action: () => router.push('/student/like-favorite') }
]

const progress = ref(72)
const progressColor = computed(() => progress.value > 80 ? '#10b981' : '#6366f1')
const circumference = 2 * Math.PI * 50

// const notices = [
//   { id: 1, icon: '📢', content: '新实验"物理光学实验"已开放报名', time: '10分钟前' },
//   { id: 2, icon: '📝', content: '实验报告提交截止时间为本周五', time: '1小时前' },
//   { id: 3, icon: '🎉', content: '恭喜你获得上周实验满分！', time: '昨天' }
// ]
// 加载通知
const fetchNotifications = async () => {
  try {
    loadingNotices.value = true
    const userId = userStore.user?.id || 0
    const res = await getAllNotifications(userId)
    notices.value = res.data.slice(0, 3) // 只显示最新3条
  } catch (error) {
    console.error('获取通知失败', error)
  } finally {
    loadingNotices.value = false
  }
}
onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.student-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%);
}
.apitable-navbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  font-size: 20px;
  font-weight: bold;
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(60,60,120,0.04);
  z-index: 10;
}
.logo {
  letter-spacing: 2px;
}
.dashboard-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 16px 48px 16px;
}
.welcome-section {
  text-align: center;
  margin-bottom: 32px;
}
.welcome-section h1 {
  font-size: 32px;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 8px;
  letter-spacing: 1px;
  animation: fadeInDown 0.8s;
}
.welcome-section p {
  color: #888;
  font-size: 18px;
  animation: fadeIn 1.2s;
}
.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  justify-content: center;
}
.stat-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(60,60,120,0.06);
  padding: 32px 24px;
  min-width: 160px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  animation: fadeInUp 0.8s;
}
.stat-card:hover {
  transform: translateY(-6px) scale(1.04);
  box-shadow: 0 8px 32px rgba(60,60,120,0.10);
}
.stat-title {
  color: #888;
  font-size: 16px;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #6366f1;
}
.stat-unit {
  font-size: 14px;
  color: #aaa;
  margin-left: 2px;
}
.experiment-quick {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  justify-content: center;
}
.quick-card {
  background: linear-gradient(120deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(60,60,120,0.08);
  padding: 28px 20px;
  min-width: 180px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: fadeInUp 1s;
}
.quick-card:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 8px 32px rgba(60,60,120,0.12);
}
.quick-icon {
  font-size: 32px;
  margin-bottom: 10px;
}
.quick-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}
.quick-desc {
  font-size: 14px;
  opacity: 0.92;
}
.progress-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}
.progress-title {
  font-size: 18px;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 12px;
}
.progress-circle {
  width: 120px;
  height: 120px;
  margin: 0 auto;
}
.notice-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(60,60,120,0.06);
  padding: 24px 32px;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 1.2s;
}
.notice-title {
  font-size: 18px;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 12px;
}
.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.notice-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f1f6;
  font-size: 15px;
  color: #444;
}
.notice-list li:last-child {
  border-bottom: none;
}
.notice-icon {
  font-size: 18px;
}

/* 新增用户操作区样式 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 16px; /* 控制通知图标和按钮间距 */
}

/* 调整通知按钮位置 */
.notification-badge {
  margin-right: 8px; /* 与个人信息按钮的间距 */
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.loading {
  padding: 20px;
  text-align: center;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loading .el-icon {
  font-size: 24px;
  animation: rotating 2s linear infinite;
}

.notice-list li {
  display: flex;
  align-items: flex-start; /* 顶部对齐 */
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f1f6;
  font-size: 15px;
  color: #444;
}

.notice-content-wrapper {
  flex: 1;
  overflow: hidden;
}

.notice-title-text {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-content-text {
  font-size: 13px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-time {
  color: #aaa;
  font-size: 13px;
  min-width: 70px;
  text-align: right;
  align-self: flex-start;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>