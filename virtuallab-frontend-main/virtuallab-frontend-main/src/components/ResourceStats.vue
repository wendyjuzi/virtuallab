<template>
  <div class="resource-stats">
    <el-card class="stats-card">
      <template #header>
        <div class="stats-header">
          <span>资源统计</span>
          <el-button size="small" @click="refreshStats">刷新</el-button>
        </div>
      </template>
      
      <div class="stats-grid">
        <!-- 基础统计 -->
        <div class="stat-item">
          <div class="stat-icon views">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.views }}</div>
            <div class="stat-label">总浏览量</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon downloads">
            <el-icon><Download /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.downloads }}</div>
            <div class="stat-label">下载次数</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon likes">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.likes }}</div>
            <div class="stat-label">点赞数</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon favorites">
            <el-icon><StarFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.favorites }}</div>
            <div class="stat-label">收藏数</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon comments">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.comments }}</div>
            <div class="stat-label">评论数</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon rating">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.averageRating.toFixed(1) }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
      </div>

      <!-- 评分分布 -->
      <div class="rating-distribution">
        <h4>评分分布</h4>
        <div class="rating-bars">
          <div v-for="i in 5" :key="i" class="rating-bar">
            <span class="rating-label">{{ 6 - i }}星</span>
            <div class="rating-progress">
              <div 
                class="rating-fill" 
                :style="{ width: getRatingPercentage(6 - i) + '%' }"
              ></div>
            </div>
            <span class="rating-count">{{ stats.ratingDistribution[6 - i] || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="recent-activity">
        <h4>最近活动</h4>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <el-icon>
                <component :is="getActivityIcon(activity.type)" />
              </el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.description }}</div>
              <div class="activity-time">{{ formatTime(activity.createTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  View, Download, Star, StarFilled, ChatDotRound,
  User, Clock, Share, CopyDocument
} from '@element-plus/icons-vue'
import * as resourceApi from '@/api/resource'

interface Props {
  resourceId: number
}

const props = defineProps<Props>()

// 统计数据
const stats = ref({
  views: 0,
  downloads: 0,
  likes: 0,
  favorites: 0,
  comments: 0,
  averageRating: 0,
  ratingDistribution: {} as Record<number, number>
})

// 最近活动
const recentActivities = ref<any[]>([])

// 获取评分百分比
const getRatingPercentage = (rating: number) => {
  const total = Object.values(stats.value.ratingDistribution).reduce((sum, count) => sum + count, 0)
  if (total === 0) return 0
  return Math.round((stats.value.ratingDistribution[rating] || 0) / total * 100)
}

// 获取活动图标
const getActivityIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'VIEW': View,
    'DOWNLOAD': Download,
    'LIKE': Star,
    'FAVORITE': StarFilled,
    'COMMENT': ChatDotRound,
    'SHARE': Share,
    'COPY': CopyDocument
  }
  return iconMap[type] || User
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    // 更新统计数据
    stats.value = {
      views: 0, // Placeholder, actual data fetching removed
      downloads: 0, // Placeholder, actual data fetching removed
      likes: 0, // Placeholder, actual data fetching removed
      favorites: 0, // Placeholder, actual data fetching removed
      comments: 0, // Placeholder, actual data fetching removed
      averageRating: 0, // Placeholder, actual data fetching removed
      ratingDistribution: {} // Placeholder, actual data fetching removed
    }

    // 更新最近活动
    recentActivities.value = [] // Placeholder, actual data fetching removed
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 刷新统计
const refreshStats = () => {
  fetchStats()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.resource-stats {
  margin-top: 20px;
}

.stats-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.views {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.downloads {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.likes {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.favorites {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.comments {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.rating {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

.rating-distribution {
  margin-bottom: 24px;
}

.rating-distribution h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-label {
  width: 40px;
  font-size: 14px;
  color: #7f8c8d;
}

.rating-progress {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.rating-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);
  transition: width 0.3s ease;
}

.rating-count {
  width: 40px;
  font-size: 14px;
  color: #7f8c8d;
  text-align: right;
}

.recent-activity {
  border-top: 1px solid #ecf0f1;
  padding-top: 16px;
}

.recent-activity h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #95a5a6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}
</style> 