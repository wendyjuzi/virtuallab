<template>
  <div class="like-favorite-management">
    <!-- 背景装饰 -->
    <div class="background-design">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
      <div class="dot-pattern"></div>
    </div>

    <!-- 返回按钮 -->
    <div class="back-button-container">
      <button class="back-button" @click="goBack">
        <i class="back-icon">←</i>
        返回
      </button>
    </div>

    <div class="page-header">
      <h1>我的点赞收藏</h1>
      <p>管理您点赞和收藏的实验项目</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon like-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ likeStats.total }}</div>
            <div class="stat-label">总点赞数</div>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon favorite-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ favoriteStats.total }}</div>
            <div class="stat-label">总收藏数</div>
          </div>
        </div>
      </div>
      
      <!-- 刷新按钮 -->
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-icon refresh-icon">
            <el-icon><Search /></el-icon>
          </div>
          <div class="stat-info">
            <el-button 
              class="refresh-button"
              @click="refreshAllData"
              :loading="likeLoading || favoriteLoading"
            >
              刷新数据
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="content-tabs">
      <div class="tab-header">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'likes' }"
          @click="activeTab = 'likes'"
        >
          我的点赞
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'favorites' }"
          @click="activeTab = 'favorites'"
        >
          我的收藏
        </div>
      </div>

      <!-- 我的点赞 -->
      <div class="tab-content" v-if="activeTab === 'likes'">
        <div class="toolbar">
          <div class="search-box">
            <el-input
              v-model="likeSearch"
              placeholder="搜索点赞的实验..."
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-button class="refresh-btn" @click="refreshLikes">刷新</el-button>
        </div>

        <div class="experiments-grid" v-loading="likeLoading">
          <div 
            v-for="experiment in filteredLikes" 
            :key="experiment.id" 
            class="experiment-card"
            @click="viewExperiment(experiment)"
          >
            <div class="experiment-image">
              <img :src="experiment.imageUrl || '/images/experiments/experiment1.png'" :alt="experiment.name">
              <div class="experiment-overlay">
                <el-icon class="view-icon"><View /></el-icon>
              </div>
            </div>
            <div class="experiment-info">
              <h3 class="experiment-title">{{ experiment.name }}</h3>
              <p class="experiment-desc">{{ experiment.description }}</p>
              <div class="experiment-meta">
                <span class="category">{{ experiment.category }}</span>
                <span class="level">{{ experiment.level }}</span>
              </div>
              <div class="experiment-actions">
                <LikeFavoriteButton 
                  :experiment-id="experiment.id"
                  :initial-like-count="experiment.likeCount"
                  :initial-favorite-count="experiment.favoriteCount"
                  :initial-is-liked="true"
                  :initial-is-favorited="experiment.isFavorited"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="likePagination.page"
          v-model:page-size="likePagination.size"
          :page-sizes="[12, 24, 48]"
          :total="likePagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleLikeSizeChange"
          @current-change="handleLikeCurrentChange"
          class="pagination"
        />
      </div>

      <!-- 我的收藏 -->
      <div class="tab-content" v-if="activeTab === 'favorites'">
        <div class="toolbar">
          <div class="search-box">
            <el-input
              v-model="favoriteSearch"
              placeholder="搜索收藏的实验..."
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <el-button class="refresh-btn" @click="refreshFavorites">刷新</el-button>
        </div>

        <div class="experiments-grid" v-loading="favoriteLoading">
          <div 
            v-for="experiment in filteredFavorites" 
            :key="experiment.id" 
            class="experiment-card"
            @click="viewExperiment(experiment)"
          >
            <div class="experiment-image">
              <img :src="experiment.imageUrl || '/images/experiments/experiment1.png'" :alt="experiment.name">
              <div class="experiment-overlay">
                <el-icon class="view-icon"><View /></el-icon>
              </div>
            </div>
            <div class="experiment-info">
              <h3 class="experiment-title">{{ experiment.name }}</h3>
              <p class="experiment-desc">{{ experiment.description }}</p>
              <div class="experiment-meta">
                <span class="category">{{ experiment.category }}</span>
                <span class="level">{{ experiment.level }}</span>
              </div>
              <div class="experiment-actions">
                <LikeFavoriteButton 
                  :experiment-id="experiment.id"
                  :initial-like-count="experiment.likeCount"
                  :initial-favorite-count="experiment.favoriteCount"
                  :initial-is-liked="experiment.isLiked"
                  :initial-is-favorited="true"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="favoriteCurrentPage"
          v-model:page-size="favoritePagination.size"
          :page-sizes="[12, 24, 48]"
          :total="favoritePagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleFavoriteSizeChange"
          @current-change="handleFavoriteCurrentChange"
          class="pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, Search, View } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useLikeFavoriteStore } from '@/store/likeFavorite'
import * as likeFavoriteApi from '@/api/likeFavorite'
import * as experimentApi from '@/api/experiment'
import LikeFavoriteButton from '@/components/LikeFavoriteButton.vue'

const router = useRouter()
const userStore = useUserStore()
const likeFavoriteStore = useLikeFavoriteStore()

// 返回上一页
const goBack = () => {
  router.back()
}

// 响应式数据
const activeTab = ref('likes')
const likeLoading = ref(false)
const favoriteLoading = ref(false)
const likeSearch = ref('')
const favoriteSearch = ref('')

// 统计数据
const likeStats = ref({ total: 0 })
const favoriteStats = ref({ total: 0 })

// 分页数据
const likePagination = ref({
  page: 1,
  size: 12,
  total: 0
})

const favoritePagination = ref({
  offset: 0,
  size: 12,
  total: 0
})

// 实验数据
const likeExperiments = ref<any[]>([])
const favoriteExperiments = ref<any[]>([])

// 计算属性 - 过滤后的数据
const filteredLikes = computed(() => {
  if (!likeSearch.value) return likeExperiments.value
  return likeExperiments.value.filter(exp => 
    exp.name?.toLowerCase().includes(likeSearch.value.toLowerCase()) ||
    exp.description?.toLowerCase().includes(likeSearch.value.toLowerCase())
  )
})

const filteredFavorites = computed(() => {
  if (!favoriteSearch.value) return favoriteExperiments.value
  return favoriteExperiments.value.filter(exp => 
    exp.name?.toLowerCase().includes(favoriteSearch.value.toLowerCase()) ||
    exp.description?.toLowerCase().includes(favoriteSearch.value.toLowerCase())
  )
})

// 计算属性 - 分页
const favoriteCurrentPage = computed({
  get: () => Math.floor(favoritePagination.value.offset / favoritePagination.value.size) + 1,
  set: (page: number) => {
    favoritePagination.value.offset = (page - 1) * favoritePagination.value.size
  }
})

// 获取实验详情信息
const fetchExperimentDetails = async (experimentId: number) => {
  try {
    // 使用实验API获取实验详情
    const response = await experimentApi.getAdminExperimentDetail(experimentId)
    const data = response.data?.data || response.data
    return data
  } catch (error) {
    console.error('获取实验详情失败:', error)
    // 返回模拟数据
    return {
      id: experimentId,
      name: `实验项目${experimentId}`,
      description: `这是实验项目${experimentId}的详细描述，包含了实验的目的、原理和操作步骤。`,
      category: ['物理实验', '化学实验', '生物实验'][experimentId % 3],
      level: ['初级', '中级', '高级'][experimentId % 3],
      imageUrl: `/images/experiments/experiment${(experimentId % 3) + 1}.png`
    }
  }
}

// 获取点赞列表
const fetchLikes = async () => {
  if (!userStore.user?.id) return
  
  likeLoading.value = true
  try {
    // 获取用户点赞记录
    const response = await likeFavoriteApi.getUserLikes(
      userStore.user.id,
      likePagination.value.page,
      likePagination.value.size
    )
    
    const likeRecords = response.data?.data || response.data
    if (likeRecords && Array.isArray(likeRecords)) {
      // 获取每个点赞记录对应的实验详情
      const experimentsWithDetails = await Promise.all(
        likeRecords.map(async (record: any) => {
          const experimentDetails = await fetchExperimentDetails(record.resourceId)
          return {
            ...experimentDetails,
            likeCount: 0, // 这些值会从store中获取
            favoriteCount: 0,
            isLiked: true, // 在点赞列表中，肯定是已点赞的
            isFavorited: false // 需要检查是否已收藏
          }
        })
      )
      
      likeExperiments.value = experimentsWithDetails
      likePagination.value.total = likeRecords.length
      likeStats.value.total = likeRecords.length
      
      // 批量获取这些实验的点赞收藏状态
      const experimentIds = experimentsWithDetails.map(exp => exp.id)
      await likeFavoriteStore.fetchMultipleExperimentStates(experimentIds)
      
      // 更新实验数据中的点赞收藏数量
      likeExperiments.value = experimentsWithDetails.map(exp => {
        const state = likeFavoriteStore.getExperimentState(exp.id)
        return {
          ...exp,
          likeCount: state.likeCount,
          favoriteCount: state.favoriteCount,
          isLiked: state.liked,
          isFavorited: state.favorited
        }
      })
    }
  } catch (error) {
    console.error('获取点赞列表失败:', error)
    ElMessage.warning('使用模拟数据')
    
    // 使用模拟数据
    const mockLikeRecords = [
      { resourceId: 1 },
      { resourceId: 2 },
      { resourceId: 3 },
      { resourceId: 4 },
      { resourceId: 5 }
    ]
    
    const experimentsWithDetails = await Promise.all(
      mockLikeRecords.map(async (record: any) => {
        const experimentDetails = await fetchExperimentDetails(record.resourceId)
        return {
          ...experimentDetails,
          likeCount: Math.floor(Math.random() * 50) + 10,
          favoriteCount: Math.floor(Math.random() * 30) + 5,
          isLiked: true,
          isFavorited: Math.random() > 0.5
        }
      })
    )
    
    likeExperiments.value = experimentsWithDetails
    likePagination.value.total = experimentsWithDetails.length
    likeStats.value.total = experimentsWithDetails.length
  } finally {
    likeLoading.value = false
  }
}

// 获取收藏列表
const fetchFavorites = async () => {
  if (!userStore.user?.id) return
  
  favoriteLoading.value = true
  try {
    // 获取用户收藏记录
    const response = await likeFavoriteApi.getUserFavorites(
      userStore.user.id,
      favoritePagination.value.offset || 0,
      favoritePagination.value.size
    )
    
    const favoriteRecords = response.data?.data || response.data
    if (favoriteRecords && Array.isArray(favoriteRecords)) {
      // 获取每个收藏记录对应的实验详情
      const experimentsWithDetails = await Promise.all(
        favoriteRecords.map(async (record: any) => {
          const experimentDetails = await fetchExperimentDetails(record.resourceId)
          return {
            ...experimentDetails,
            likeCount: 0, // 这些值会从store中获取
            favoriteCount: 0,
            isLiked: false, // 需要检查是否已点赞
            isFavorited: true // 在收藏列表中，肯定是已收藏的
          }
        })
      )
      
      favoriteExperiments.value = experimentsWithDetails
      favoritePagination.value.total = favoriteRecords.length
      favoriteStats.value.total = favoriteRecords.length
      
      // 批量获取这些实验的点赞收藏状态
      const experimentIds = experimentsWithDetails.map(exp => exp.id)
      await likeFavoriteStore.fetchMultipleExperimentStates(experimentIds)
      
      // 更新实验数据中的点赞收藏数量
      favoriteExperiments.value = experimentsWithDetails.map(exp => {
        const state = likeFavoriteStore.getExperimentState(exp.id)
        return {
          ...exp,
          likeCount: state.likeCount,
          favoriteCount: state.favoriteCount,
          isLiked: state.liked,
          isFavorited: state.favorited
        }
      })
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.warning('使用模拟数据')
    
    // 使用模拟数据
    const mockFavoriteRecords = [
      { resourceId: 6 },
      { resourceId: 7 },
      { resourceId: 8 }
    ]
    
    const experimentsWithDetails = await Promise.all(
      mockFavoriteRecords.map(async (record: any) => {
        const experimentDetails = await fetchExperimentDetails(record.resourceId)
        return {
          ...experimentDetails,
          likeCount: Math.floor(Math.random() * 50) + 10,
          favoriteCount: Math.floor(Math.random() * 30) + 5,
          isLiked: Math.random() > 0.5,
          isFavorited: true
        }
      })
    )
    
    favoriteExperiments.value = experimentsWithDetails
    favoritePagination.value.total = experimentsWithDetails.length
    favoriteStats.value.total = experimentsWithDetails.length
  } finally {
    favoriteLoading.value = false
  }
}

// 获取用户统计数据
const fetchUserStats = async () => {
  if (!userStore.user?.id) return
  
  try {
    // 获取用户点赞数量
    const likeCountResponse = await likeFavoriteApi.getUserLikesCount(userStore.user.id)
    const likeCount = Number(likeCountResponse.data?.data || likeCountResponse.data) || 0
    
    // 获取用户收藏数量
    const favoriteCountResponse = await likeFavoriteApi.getUserFavoritesCount(userStore.user.id)
    const favoriteCount = Number(favoriteCountResponse.data?.data || favoriteCountResponse.data) || 0
    
    likeStats.value.total = likeCount
    favoriteStats.value.total = favoriteCount
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
    // 使用模拟数据
    likeStats.value.total = 5
    favoriteStats.value.total = 3
  }
}

// 刷新数据
const refreshLikes = () => {
  fetchLikes()
}

const refreshFavorites = () => {
  fetchFavorites()
}

// 刷新统计数据
const refreshStats = () => {
  fetchUserStats()
}

// 刷新所有数据
const refreshAllData = async () => {
  await Promise.all([
    fetchUserStats(),
    fetchLikes(),
    fetchFavorites()
  ])
}

// 分页处理
const handleLikeSizeChange = (size: number) => {
  likePagination.value.size = size
  likePagination.value.page = 1
  fetchLikes()
}

const handleLikeCurrentChange = (page: number) => {
  likePagination.value.page = page
  fetchLikes()
}

const handleFavoriteSizeChange = (size: number) => {
  favoritePagination.value.size = size
  favoritePagination.value.offset = 0
  fetchFavorites()
}

const handleFavoriteCurrentChange = (page: number) => {
  favoritePagination.value.offset = (page - 1) * favoritePagination.value.size
  fetchFavorites()
}

// 查看实验详情
const viewExperiment = (experiment: any) => {
  router.push(`/experiment/${experiment.id}`)
}

// 监听用户登录状态变化
watch(() => userStore.user?.id, (newUserId) => {
  if (newUserId) {
    fetchUserStats()
    fetchLikes()
    fetchFavorites()
  } else {
    // 用户登出时清空数据
    likeExperiments.value = []
    favoriteExperiments.value = []
    likeStats.value.total = 0
    favoriteStats.value.total = 0
  }
})

// 组件挂载时加载数据
onMounted(() => {
  if (userStore.user?.id) {
    fetchUserStats()
    fetchLikes()
    fetchFavorites()
  }
})
</script>

<style scoped>
.like-favorite-management {
  min-height: 100vh;
  padding: 24px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 50%, #fcfaff 100%);
  margin: -24px;
}

/* 背景装饰 */
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

/* 点阵图案 */
.dot-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25px 25px, rgba(192, 132, 252, 0.1) 2px, transparent 0),
    radial-gradient(circle at 75px 75px, rgba(192, 132, 252, 0.1) 2px, transparent 0);
  background-size: 100px 100px;
  opacity: 0.5;
}

/* 返回按钮 */
.back-button-container {
  position: relative;
  z-index: 10;
  margin-bottom: 16px;
  padding-top: 16px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.back-button {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(168, 85, 247, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.back-button:hover {
  transform: translateX(-5px);
  box-shadow: 
    0 6px 16px rgba(168, 85, 247, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.back-icon {
  margin-right: 8px;
  font-style: normal;
  font-size: 18px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #7c3aed;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(124, 58, 237, 0.1);
  letter-spacing: 0.5px;
}

.page-header p {
  color: #8b5cf6;
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.stat-card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 24px rgba(192, 132, 252, 0.15),
    0 0 0 1px rgba(216, 180, 254, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 30px rgba(192, 132, 252, 0.2),
    0 0 0 1px rgba(216, 180, 254, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 24px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  font-size: 28px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.like-icon {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
}

.favorite-icon {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
}

.refresh-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #7c3aed;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: #8b5cf6;
  font-weight: 500;
}

.refresh-button {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.refresh-button:hover {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
}

.content-tabs {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 
    0 8px 24px rgba(192, 132, 252, 0.15),
    0 0 0 1px rgba(216, 180, 254, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid rgba(216, 180, 254, 0.3);
  background: rgba(250, 245, 255, 0.7);
}

.tab-item {
  padding: 18px 32px;
  font-size: 18px;
  font-weight: 600;
  color: #8b5cf6;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item:hover {
  color: #7c3aed;
  background: rgba(216, 180, 254, 0.1);
}

.tab-item.active {
  color: #7c3aed;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #c084fc, #a855f7);
  border-radius: 3px 3px 0 0;
}

.tab-content {
  padding: 28px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding: 16px;
  background: rgba(250, 245, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(216, 180, 254, 0.2);
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__inner) {
  border-radius: 12px;
  border: 1px solid rgba(216, 180, 254, 0.3);
  background: rgba(255, 255, 255, 0.8);
  padding: 12px 16px;
  color: #7c3aed;
}

.search-input :deep(.el-input__inner):focus {
  border-color: #a855f7;
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
}

.refresh-btn {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.3);
}

.experiments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
  margin-bottom: 28px;
}

.experiment-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 8px 16px rgba(192, 132, 252, 0.1),
    0 0 0 1px rgba(216, 180, 254, 0.1);
}

.experiment-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 12px 30px rgba(192, 132, 252, 0.2),
    0 0 0 1px rgba(216, 180, 254, 0.2);
}

.experiment-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.experiment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.experiment-card:hover .experiment-image img {
  transform: scale(1.05);
}

.experiment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(124, 58, 237, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(3px);
}

.experiment-card:hover .experiment-overlay {
  opacity: 1;
}

.view-icon {
  font-size: 32px;
  color: white;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}

.experiment-info {
  padding: 20px;
}

.experiment-title {
  font-size: 20px;
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 10px;
  line-height: 1.4;
}

.experiment-desc {
  color: #8b5cf6;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.8;
}

.experiment-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.category, .level {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.category {
  background: rgba(216, 180, 254, 0.2);
  color: #7c3aed;
}

.level {
  background: rgba(192, 132, 252, 0.2);
  color: #8b5cf6;
}

.experiment-actions {
  display: flex;
  justify-content: flex-end;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.pagination :deep(.el-pagination__total),
.pagination :deep(.el-pagination__sizes),
.pagination :deep(.el-pagination__jump),
.pagination :deep(.el-pager li) {
  background-color: transparent;
  color: #7c3aed;
  font-weight: 500;
}

.pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  color: white;
  font-weight: 600;
}

.pagination :deep(.el-pagination__sizes .el-select .el-input .el-input__inner) {
  border-color: rgba(216, 180, 254, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .like-favorite-management {
    padding: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .experiments-grid {
    grid-template-columns: 1fr;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }

  .search-box {
    max-width: 100%;
  }

  .tab-item {
    padding: 16px 20px;
    font-size: 16px;
  }
}
</style> 