<template>
  <div class="like-favorite-container">
    <!-- 点赞按钮 -->
    <div class="action-button like-btn" @click="handleLike" :class="{ active: isLiked }">
      <el-icon class="action-icon" :class="{ 'liked': isLiked }">
        <StarFilled v-if="isLiked" />
        <Star v-else />
      </el-icon>
      <span class="action-text number-text">{{ likeCount }}</span>
    </div>

    <!-- 收藏按钮 -->
    <div class="action-button favorite-btn" @click="handleFavorite" :class="{ active: isFavorited }">
      <el-icon class="action-icon" :class="{ 'favorited': isFavorited }">
        <CollectionTag v-if="isFavorited" />
        <Collection v-else />
      </el-icon>
      <span class="action-text number-text">{{ favoriteCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Collection, CollectionTag, Star, StarFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useLikeFavoriteStore } from '@/store/likeFavorite'

interface Props {
  experimentId: number
  initialLikeCount?: number
  initialFavoriteCount?: number
  initialIsLiked?: boolean
  initialIsFavorited?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialLikeCount: 0,
  initialFavoriteCount: 0,
  initialIsLiked: false,
  initialIsFavorited: false
})

const userStore = useUserStore()
const likeFavoriteStore = useLikeFavoriteStore()

// 从store获取状态
const experimentState = computed(() => likeFavoriteStore.getExperimentState(props.experimentId))
const isLoading = computed(() => likeFavoriteStore.isLoading(props.experimentId))

// 响应式数据
const likeCount = computed(() => experimentState.value.likeCount)
const favoriteCount = computed(() => experimentState.value.favoriteCount)
const isLiked = computed(() => experimentState.value.liked)
const isFavorited = computed(() => experimentState.value.favorited)

// 处理点赞
const handleLike = async () => {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (isLoading.value) {
    ElMessage.warning('操作进行中，请稍后重试')
    return
  }
  
  try {
    const newLikedState = await likeFavoriteStore.toggleLike(props.experimentId)
    ElMessage.success(newLikedState ? '点赞成功' : '已取消点赞')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败，请稍后重试')
  }
}

// 处理收藏
const handleFavorite = async () => {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (isLoading.value) {
    ElMessage.warning('操作进行中，请稍后重试')
    return
  }
  
  try {
    const newFavoritedState = await likeFavoriteStore.toggleFavorite(props.experimentId)
    ElMessage.success(newFavoritedState ? '收藏成功' : '已取消收藏')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败，请稍后重试')
  }
}

// 监听用户登录状态变化
watch(() => userStore.user?.id, (newUserId) => {
  if (newUserId) {
    // 用户登录时获取状态
    likeFavoriteStore.fetchExperimentState(props.experimentId)
  }
})

// 组件挂载时获取状态
onMounted(() => {
  if (userStore.user?.id) {
    likeFavoriteStore.fetchExperimentState(props.experimentId)
  }
})
</script>

<style scoped>
.like-favorite-container {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  min-width: 60px;
  justify-content: center;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.action-button:hover::before {
  left: 100%;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.action-button.active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.like-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  border-color: #ff4757;
}

.favorite-btn.active {
  background: linear-gradient(135deg, #ffd93d 0%, #ffb347 100%);
  border-color: #ffa726;
}

.action-icon {
  font-size: 20px;
  transition: color 0.2s;
}

.liked {
  color: #ff4757;
}

.favorited {
  color: #ffb347;
}

.action-text {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
  z-index: 1;
  transition: color 0.3s ease;
}

.like-btn.active .action-text,
.favorite-btn.active .action-text {
  color: #ffffff;
}

.number-text {
  font-size: 15px;
  font-weight: 600;
  color: #22223b;
  margin-left: 2px;
  min-width: 18px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .like-favorite-container {
    gap: 6px;
  }

  .action-button {
    padding: 5px 10px;
    gap: 3px;
    min-width: 50px;
  }

  .action-icon {
    font-size: 14px;
  }

  .action-text {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .action-button {
    padding: 4px 8px;
    min-width: 45px;
  }

  .action-icon {
    font-size: 13px;
  }

  .action-text {
    font-size: 10px;
  }
}
</style> 