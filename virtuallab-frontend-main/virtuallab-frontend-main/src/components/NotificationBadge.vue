<template>
  <div class="notification-badge">
    <button @click="togglePanel" class="notification-button">
      <el-icon class="bell-icon"><Bell /></el-icon>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <div v-if="showPanel" class="notification-panel">
      <div class="panel-header">
        <h3>通知</h3>
        <button @click="markAllRead" class="mark-read-btn">全部标为已读</button>
      </div>

      <div v-if="loading" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>

      <div v-else>
        <div v-if="notifications.length === 0 && shareNotifications.length === 0" class="empty">暂无新通知</div>

        <!-- 系统通知 -->
        <div
            v-for="item in notifications"
            :key="`sys-${item.id}`"
            :class="['notification-item', { unread: !item.isRead }]"
            @click="openNotification(item)"
        >
          <div class="notification-icon">{{ getIcon(item.type) }}</div>
          <div class="notification-content">
            <div class="title">{{ item.title }}</div>
            <div class="message">{{ item.content }}</div>
            <div class="time">{{ formatTime(item.createdAt) }}</div>
          </div>
        </div>

        <!-- 分享通知 -->
        <div
            v-for="item in shareNotifications"
            :key="`share-${item.id}`"
            :class="['notification-item', { unread: !item.isRead }]"
            @click="openNotification(item)"
        >
          <div class="notification-icon">{{ getIcon('share') }}</div>
          <div class="notification-content">
            <div class="title">{{ item.title }}</div>
            <div class="message">{{ item.content }}</div>
            <div class="time">{{ formatTime(item.createdAt) }}</div>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        <router-link to="/notifications">查看所有通知</router-link>
        <router-link :to="{ name: 'ShareManagement' }" style="margin-left:16px;">被分享给我的资源</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getUnreadNotifications, markAllAsRead, markAsRead } from '@/api/notification'
import { getUnreadShareNotifications, markAllShareNotificationsRead, markShareNotificationRead } from '@/api/resourceShare'
import { useUserStore } from '@/store/user'
import { Bell, Loading } from '@element-plus/icons-vue'
import type { Notification } from '@/store/types'
import type { ShareNotification } from '@/api/resourceShare'

const userStore = useUserStore()
const showPanel = ref(false)
const notifications = ref<Notification[]>([])
const shareNotifications = ref<ShareNotification[]>([])
const loading = ref(true)
const unreadCount = ref(0)
const refreshInterval = ref<number | null>(null)

const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    audit: '📋',
    publish: '🚀',
    system: '🔔',
    warning: '⚠️',
    share: '📤',
    resource: '📁'
  }
  return icons[type] || '🔔'
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

const fetchNotifications = async () => {
  try {
    loading.value = true

    // 获取系统通知
    const userId = userStore.user?.id || 0
    const systemRes = await getUnreadNotifications(userId)
    notifications.value = systemRes.data || []

    // 获取分享通知
    const shareRes = await getUnreadShareNotifications(userStore.user!.username)
    shareNotifications.value = shareRes.data || []

    // 计算总未读数
    const systemUnread = notifications.value.filter(n => !n.isRead).length
    const shareUnread = shareNotifications.value.filter(n => !n.isRead).length
    unreadCount.value = systemUnread + shareUnread
  } catch (error) {
    console.error('获取通知失败', error)
  } finally {
    loading.value = false
  }
}

const togglePanel = () => {
  showPanel.value = !showPanel.value
  if (showPanel.value) fetchNotifications()
}

const markAllRead = async () => {
  try {
    // 标记系统通知为已读
    const userId = userStore.user?.id || 0
    await markAllAsRead(userId)
    notifications.value.forEach(n => n.isRead = true)

    // 标记分享通知为已读
    await markAllShareNotificationsRead(userStore.user!.username)
    shareNotifications.value.forEach(n => n.isRead = true)

    unreadCount.value = 0
  } catch (error) {
    console.error('标记已读失败', error)
  }
}

const openNotification = async (item: Notification | ShareNotification) => {
  try {
    // 标记为已读
    if ('resourceId' in item) {
      // 分享通知
      await markShareNotificationRead(item.id, userStore.user!.username)
    } else {
      // 系统通知
      await markAsRead(item.id)
    }
    
    item.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    showPanel.value = false

    // 根据通知类型跳转到不同页面
    if ('resourceId' in item) {
      // 分享通知 - 跳转到资源详情页
      window.open(`/experiment/${item.resourceId}`, '_blank')
    } else {
      // 系统通知
      if (item.type === 'audit') {
        // 跳转到审核详情页
      } else if (item.type === 'publish') {
        // 跳转到项目页面
      }
    }
  } catch (error) {
    console.error('处理通知失败', error)
  }
}

onMounted(() => {
  // 初始加载通知
  fetchNotifications()

  // 每5分钟自动刷新通知
  refreshInterval.value = window.setInterval(fetchNotifications, 5 * 60 * 1000)
})

onUnmounted(() => {
  // 清理定时器
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.notification-badge {
  position: relative;
  display: flex;
  align-items: center;
}

.notification-button {
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.notification-button:hover {
  background-color: #f3f4f6;
}

.bell-icon {
  font-size: 20px;
  color: #6b7280;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: bold;
}

.notification-panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.mark-read-btn:hover {
  background-color: #f0f4ff;
}

.notification-item {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item.unread {
  background-color: #f9f9ff;
  position: relative;
}

.notification-item.unread::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #6366f1;
}

.notification-item:hover {
  background-color: #f0f4ff;
}

.notification-icon {
  font-size: 24px;
  margin-right: 15px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  overflow: hidden;
}

.title {
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.time {
  font-size: 12px;
  color: #888;
}

.panel-footer {
  padding: 12px;
  text-align: center;
  border-top: 1px solid #eee;
}

.panel-footer a {
  color: #6366f1;
  text-decoration: none;
  font-size: 13px;
}

.panel-footer a:hover {
  text-decoration: underline;
}

.loading, .empty {
  padding: 30px;
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

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>