import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as likeFavoriteApi from '@/api/likeFavorite'
import { useUserStore } from './user'

// 点赞收藏状态接口
export interface LikeFavoriteState {
  liked: boolean
  favorited: boolean
  likeCount: number
  favoriteCount: number
}

// 实验项目的点赞收藏状态
interface ExperimentLikeFavorite {
  [experimentId: number]: LikeFavoriteState
}

export const useLikeFavoriteStore = defineStore('likeFavorite', () => {
  const userStore = useUserStore()
  
  // 存储所有实验的点赞收藏状态
  const experimentStates = ref<ExperimentLikeFavorite>({})
  
  // 加载状态
  const loadingStates = ref<{ [experimentId: number]: boolean }>({})
  
  // 获取指定实验的状态
  const getExperimentState = computed(() => {
    return (experimentId: number): LikeFavoriteState => {
      return experimentStates.value[experimentId] || {
        liked: false,
        favorited: false,
        likeCount: 0,
        favoriteCount: 0
      }
    }
  })
  
  // 检查是否正在加载
  const isLoading = computed(() => {
    return (experimentId: number): boolean => {
      return loadingStates.value[experimentId] || false
    }
  })
  
  // 获取实验的点赞收藏状态
  const fetchExperimentState = async (experimentId: number) => {
    if (!userStore.user?.id) return
    
    loadingStates.value[experimentId] = true
    
    try {
      // 获取用户点赞收藏状态
      const statusResponse = await likeFavoriteApi.getLikeFavoriteStatus(experimentId, userStore.user.id)
      const statusData = statusResponse.data?.data || statusResponse.data
      
      // 获取点赞和收藏数量
      const likeCountResponse = await likeFavoriteApi.getResourceLikeCount(experimentId)
      const favoriteCountResponse = await likeFavoriteApi.getResourceFavoriteCount(experimentId)
      
      const likeCount = Number(likeCountResponse.data?.data || likeCountResponse.data) || 0
      const favoriteCount = Number(favoriteCountResponse.data?.data || favoriteCountResponse.data) || 0
      
      // 更新状态
      experimentStates.value[experimentId] = {
        liked: !!statusData?.liked,
        favorited: !!statusData?.favorited,
        likeCount,
        favoriteCount
      }
    } catch (error) {
      console.error('获取点赞收藏状态失败:', error)
      // 设置默认状态
      experimentStates.value[experimentId] = {
        liked: false,
        favorited: false,
        likeCount: 0,
        favoriteCount: 0
      }
    } finally {
      loadingStates.value[experimentId] = false
    }
  }
  
  // 处理点赞操作
  const toggleLike = async (experimentId: number) => {
    if (!userStore.user?.id) {
      throw new Error('请先登录')
    }
    
    if (loadingStates.value[experimentId]) {
      throw new Error('操作进行中，请稍后重试')
    }
    
    loadingStates.value[experimentId] = true
    
    try {
      const currentState = experimentStates.value[experimentId]
      const isCurrentlyLiked = currentState?.liked || false
      
      if (isCurrentlyLiked) {
        // 取消点赞
        await likeFavoriteApi.unlikeResource(experimentId, userStore.user.id)
        
        // 更新状态
        if (experimentStates.value[experimentId]) {
          experimentStates.value[experimentId].liked = false
          experimentStates.value[experimentId].likeCount = Math.max(0, experimentStates.value[experimentId].likeCount - 1)
        }
      } else {
        // 添加点赞
        await likeFavoriteApi.likeResource(experimentId, userStore.user.id)
        
        // 更新状态
        if (experimentStates.value[experimentId]) {
          experimentStates.value[experimentId].liked = true
          experimentStates.value[experimentId].likeCount += 1
        }
      }
      
      return !isCurrentlyLiked
    } catch (error) {
      console.error('点赞操作失败:', error)
      throw error
    } finally {
      loadingStates.value[experimentId] = false
    }
  }
  
  // 处理收藏操作
  const toggleFavorite = async (experimentId: number) => {
    if (!userStore.user?.id) {
      throw new Error('请先登录')
    }
    
    if (loadingStates.value[experimentId]) {
      throw new Error('操作进行中，请稍后重试')
    }
    
    loadingStates.value[experimentId] = true
    
    try {
      const currentState = experimentStates.value[experimentId]
      const isCurrentlyFavorited = currentState?.favorited || false
      
      if (isCurrentlyFavorited) {
        // 取消收藏
        const favoriteRecord = await likeFavoriteApi.getUserResourceFavorite(userStore.user.id, experimentId)
        const recordData = favoriteRecord.data?.data || favoriteRecord.data
        if (recordData) {
          await likeFavoriteApi.removeFavorite(recordData.id)
        }
        
        // 更新状态
        if (experimentStates.value[experimentId]) {
          experimentStates.value[experimentId].favorited = false
          experimentStates.value[experimentId].favoriteCount = Math.max(0, experimentStates.value[experimentId].favoriteCount - 1)
        }
      } else {
        // 添加收藏
        await likeFavoriteApi.addFavorite({
          userId: userStore.user.id,
          resourceId: experimentId
        })
        
        // 更新状态
        if (experimentStates.value[experimentId]) {
          experimentStates.value[experimentId].favorited = true
          experimentStates.value[experimentId].favoriteCount += 1
        }
      }
      
      return !isCurrentlyFavorited
    } catch (error) {
      console.error('收藏操作失败:', error)
      throw error
    } finally {
      loadingStates.value[experimentId] = false
    }
  }
  
  // 批量获取多个实验的状态
  const fetchMultipleExperimentStates = async (experimentIds: number[]) => {
    if (!userStore.user?.id) return
    
    const promises = experimentIds.map(id => fetchExperimentState(id))
    await Promise.allSettled(promises)
  }
  
  // 清除指定实验的状态
  const clearExperimentState = (experimentId: number) => {
    delete experimentStates.value[experimentId]
    delete loadingStates.value[experimentId]
  }
  
  // 清除所有状态
  const clearAllStates = () => {
    experimentStates.value = {}
    loadingStates.value = {}
  }
  
  // 监听用户登录状态变化
  const handleUserChange = () => {
    if (!userStore.user?.id) {
      // 用户登出时清除所有状态
      clearAllStates()
    }
  }
  
  return {
    // 状态
    experimentStates,
    loadingStates,
    
    // 计算属性
    getExperimentState,
    isLoading,
    
    // 方法
    fetchExperimentState,
    toggleLike,
    toggleFavorite,
    fetchMultipleExperimentStates,
    clearExperimentState,
    clearAllStates,
    handleUserChange
  }
})
