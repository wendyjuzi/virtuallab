<template>
  <div class="notification-center">
    <div class="header">
      <h1><el-icon><Bell /></el-icon> 通知中心</h1>
      <div class="actions">
        <el-button type="primary" @click="fetchNotifications">
          刷新通知
        </el-button>
        <el-button type="success" @click="markAllAsRead" :disabled="unreadCount === 0">
          全部标记为已读
        </el-button>
      </div>
    </div>

    <div class="filters">
      <el-select v-model="filterStatus" placeholder="状态" style="width: 120px;">
        <el-option label="全部" value="all" />
        <el-option label="未读" value="unread" />
        <el-option label="已读" value="read" />
      </el-select>

<!--      <el-select v-model="filterType" placeholder="类型" style="width: 120px;">-->
<!--        <el-option label="全部" value="all" />-->
<!--        <el-option label="审核" value="audit" />-->
<!--        <el-option label="发布" value="publish" />-->
<!--        <el-option label="系统" value="system" />-->
<!--      </el-select>-->
    </div>

    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      加载中...
    </div>

    <div v-else>
      <div v-if="filteredNotifications.length === 0" class="empty">
        <el-empty description="暂无通知" />
      </div>

      <div v-else class="notification-list">
        <div
            v-for="notification in filteredNotifications"
            :key="notification.id + (notification._type || '')"
            class="notification-item"
            :class="{ 'unread': !notification.isRead }"
        >
          <div class="notification-icon">{{ getIcon(notification.type === 'share' || notification._type === 'share' ? 'share' : notification.type) }}</div>
          <div class="notification-content">
            <div class="notification-header">
              <h4>{{ notification.title }}</h4>
              <el-tag type="info" v-if="!notification.isRead" size="small">未读</el-tag>
              <el-tag v-if="notification._type === 'share'" type="success" size="small">分享</el-tag>
            </div>
            <p class="message">{{ notification.content }}</p>
            <div class="notification-footer">
              <span>{{ formatTime(notification.createdAt) }}</span>
              <div class="actions">
                <el-button
                    size="small"
                    @click="markAsRead(notification.id, notification._type)"
                    v-if="!notification.isRead"
                >
                  标记为已读
                </el-button>
                <el-button
                    type="danger"
                    size="small"
                    @click="deleteNotification(notification.id, notification._type)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="totalNotifications"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Loading } from '@element-plus/icons-vue'
import {
  getAllNotifications,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  getNotificationDetail,
  deleteNotification as apiDeleteNotification
} from '@/api/notification'
import {
  getShareNotifications,
  markShareNotificationRead,
  markAllShareNotificationsRead,
  deleteShare
} from '@/api/resourceShare'
import type { Notification } from '@/store/types'
import type { ShareNotification } from '@/api/resourceShare'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()
// 类型扩展，合并通知类型
interface NotificationWithType extends Notification { _type: 'system' }
interface ShareNotificationWithType extends ShareNotification { _type: 'share' }
const notifications = ref<(NotificationWithType | ShareNotificationWithType)[]>([])
const loading = ref(false)
const unreadCount = ref(0)
const filterStatus = ref('all')
const filterType = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

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

const formatTime = (time: string) => {
  return new Date(time).toLocaleString()
}

// 获取所有通知（系统+分享）
const fetchNotifications = async () => {
  try {
    loading.value = true
    const userId = userStore.user?.id || 0
    const username = userStore.user?.username || ''
    // 系统通知
    const res = await getAllNotifications(userId)
    // 分享通知
    const shareRes = await getShareNotifications()
    // 标记类型，合并
    const sysList: NotificationWithType[] = (res.data || []).map(n => ({ ...n, _type: 'system' as const }))
    const shareList: ShareNotificationWithType[] = (shareRes.data || []).map(n => ({ ...n, _type: 'share' as const }))
    notifications.value = [...sysList, ...shareList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    unreadCount.value = notifications.value.filter(n => !n.isRead).length
  } catch (error) {
    console.error('获取通知失败', error)
    ElMessage.error('获取通知失败')
  } finally {
    loading.value = false
  }
}

// 过滤、分页
const filteredNotifications = computed(() => {
  let result = [...notifications.value]
  if (filterStatus.value === 'unread') {
    result = result.filter(n => !n.isRead)
  } else if (filterStatus.value === 'read') {
    result = result.filter(n => n.isRead)
  }
  if (filterType.value !== 'all') {
    result = result.filter(n => n.type === filterType.value)
  }
  const start = (currentPage.value - 1) * pageSize.value
  return result.slice(start, start + pageSize.value)
})
const totalNotifications = computed(() => notifications.value.length)

// 标记单条为已读
const markAsRead = async (notificationId: number, type: string) => {
  try {
    if (type === 'share') {
      await markShareNotificationRead(notificationId, userStore.user!.username)
    } else {
      await apiMarkAsRead(notificationId)
    }
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      unreadCount.value--
    }
    ElMessage.success('已标记为已读')
  } catch (error) {
    console.error('标记已读失败', error)
    ElMessage.error('操作失败')
  }
}
// 全部标记为已读
const markAllAsRead = async () => {
  try {
    const userId = userStore.user?.id || 0
    await apiMarkAllAsRead(userId)
    await markAllShareNotificationsRead(userStore.user!.username)
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
    ElMessage.success('所有通知已标记为已读')
  } catch (error) {
    console.error('批量标记失败', error)
    ElMessage.error('操作失败')
  }
}
// 删除通知
const deleteNotification = async (notificationId: number, type: string) => {
  try {
    if (type === 'share') {
      await deleteShare(notificationId)
    } else {
      await apiDeleteNotification(notificationId)
    }
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
    ElMessage.success('通知已删除')
  } catch (error) {
    console.error('删除通知失败', error)
    ElMessage.error('删除失败')
  }
}
const handlePageChange = (page: number) => {
  currentPage.value = page
}
onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notification-center {
  max-width: 95%;  /* 改为百分比宽度，更灵活适应不同屏幕 */
  margin: 0 auto;
  padding: 30px;   /* 增加内边距 */
  background-color: #f8fafc;
  border-radius: 14px;  /* 增加圆角 */
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1); /* 加深阴影 */
  min-height: 80vh; /* 增加最小高度，占据更多垂直空间 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.header h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.7rem;  /* 增加标题字体大小 */
  font-weight: 650;
  color: #1e293b;
  margin: 0;
}

.header .el-icon {
  font-size: 1.6em;
  color: #3b82f6;
}

.actions {
  display: flex;
  gap: 14px;
}

.filters {
  display: flex;
  gap: 18px;  /* 增加筛选器间距 */
  margin-bottom: 28px;
}

.notification-list {
  margin-bottom: 35px;
}

.notification-item {
  display: flex;
  padding: 22px;  /* 增加内边距 */
  margin-bottom: 18px;
  border-radius: 12px;  /* 增加圆角 */
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06); /* 加深阴影 */
  border-left: 5px solid transparent;  /* 增加左侧边框宽度 */
  transition: all 0.25s ease;
}

.notification-item:hover {
  transform: translateY(-3px);  /* 增加悬停上浮效果 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  border-left: 5px solid #3b82f6;  /* 增加左侧边框宽度 */
  background: linear-gradient(to right, #f0f9ff 0%, #ffffff 5%);
}

.notification-icon {
  font-size: 32px;  /* 增加图标大小 */
  margin-right: 20px;
  flex-shrink: 0;
  width: 46px;  /* 增加容器大小 */
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;  /* 增加圆角 */
  background: #eff6ff;
}

.notification-content {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;  /* 增加下边距 */
}

.notification-header h4 {
  font-size: 1.15rem;  /* 增加标题字体大小 */
  font-weight: 620;
  color: #1e293b;
  margin: 0 12px 0 0;
  white-space: nowrap;  /* 防止标题换行 */
  overflow: hidden;
  text-overflow: ellipsis;  /* 超出显示省略号 */
}

.message {
  color: #475569;
  margin-bottom: 14px;
  line-height: 1.65;  /* 增加行高 */
  font-size: 1rem;  /* 增加字体大小 */
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  font-size: 0.9rem;  /* 增加字体大小 */
}

.actions {
  display: flex;
  gap: 10px;  /* 增加按钮间距 */
}

.el-button {
  border-radius: 8px;  /* 增加按钮圆角 */
  font-weight: 520;
  padding: 8px 16px;  /* 增加按钮内边距 */
  transition: all 0.2s;
}

.el-button--small {
  padding: 7px 14px;
}

.loading {
  padding: 70px;  /* 增加内边距 */
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  font-size: 1.1rem;  /* 增加字体大小 */
}

.el-icon.is-loading {
  font-size: 3rem;  /* 增加加载图标大小 */
  color: #3b82f6;
  animation: rotating 1.5s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty {
  padding: 70px;  /* 增加内边距 */
  text-align: center;
  background: white;
  border-radius: 12px;  /* 增加圆角 */
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06); /* 加深阴影 */
  font-size: 1.1rem;  /* 增加字体大小 */
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;  /* 增加上边距 */
  padding: 16px;  /* 增加内边距 */
  background: white;
  border-radius: 10px;  /* 增加圆角 */
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06); /* 加深阴影 */
}

.el-tag {
  border-radius: 6px;  /* 增加圆角 */
  font-weight: 520;
  padding: 0 10px;  /* 增加内边距 */
  height: 26px;  /* 增加高度 */
  line-height: 26px;
  font-size: 0.9rem;  /* 增加字体大小 */
}

/* 响应式调整 */
@media (min-width: 1200px) {
  .notification-center {
    max-width: 1100px;  /* 大屏幕上增加最大宽度 */
  }

  .notification-item {
    padding: 24px;
  }
}

@media (min-width: 1600px) {
  .notification-center {
    max-width: 1200px;  /* 超大屏幕上进一步增加宽度 */
  }
}
</style>