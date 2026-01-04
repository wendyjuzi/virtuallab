<template>
  <div class="experiment-card" @click="handleView">
    <div class="card-badge">{{ categoryName }}</div>
    <div class="experiment-image">
      <img :src="experiment.imageUrl || experiment.image || '/images/experiments/experiment1.png'" :alt="experiment.title || experiment.name">
      <div class="experiment-overlay">
        <button class="view-btn" @click.stop="handleView">
          <el-icon><View /></el-icon> 查看详情
        </button>
      </div>
    </div>
    <div class="experiment-info">
      <div class="experiment-title">{{ experiment.title || experiment.name }}</div>
      <div class="experiment-desc" v-if="experiment.description">{{ experiment.description }}</div>
      <div class="experiment-stats">
        <div class="stat"><el-icon><View /></el-icon> {{ experiment.views || 0 }}</div>
        <div class="stat"><el-icon><Star /></el-icon> {{ experiment.likes || 0 }}</div>
        <div class="stat"><el-icon><Collection /></el-icon> {{ experiment.favorites || 0 }}</div>
      </div>
      <div class="experiment-actions" @click.stop>
        <LikeFavoriteButton
            :experiment-id="experiment.id"
            :initial-like-count="experiment.likes || 0"
            :initial-favorite-count="experiment.favorites || 0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { View, Star, Collection } from '@element-plus/icons-vue'
import LikeFavoriteButton from './LikeFavoriteButton.vue'

const props = defineProps<{
  experiment: any
}>()

const router = useRouter()
const handleView = () => {
  router.push(`/experiment/${props.experiment.id}`)
}
const categoryName = computed(() => {
  const map: Record<string, string> = {
    'all': '全部',
    'teaching': '教学实训',
    'research': '科学研究',
    'interaction': '展示互动'
  }
  return map[props.experiment.category] || '其他'
})
</script>

<style scoped>
.experiment-card {
  background: linear-gradient(135deg, #f8f0ff 0%, #f0e6ff 100%);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(138,43,226,0.10), 0 1.5px 6px rgba(90,24,154,0.06);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s, transform 0.3s;
  min-height: 420px;
}
.experiment-card:hover {
  box-shadow: 0 12px 40px rgba(138,43,226,0.18), 0 2px 8px rgba(90,24,154,0.10);
  transform: translateY(-6px) scale(1.02);
}
.card-badge {
  position: absolute;
  top: 18px;
  left: 18px;
  background: linear-gradient(90deg, #8a2be2 60%, #b57edc 100%);
  color: #fff;
  padding: 4px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(138,43,226,0.10);
}
.experiment-image {
  height: 180px;
  position: relative;
  overflow: hidden;
}
.experiment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.experiment-card:hover .experiment-image img {
  transform: scale(1.06);
}
.experiment-overlay {
  position: absolute;
  left: 0; right: 0; bottom: 0; top: 0;
  background: linear-gradient(180deg,rgba(90,24,154,0.10) 0%,rgba(90,24,154,0.22) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 18px;
  opacity: 0;
  transition: opacity 0.3s;
}
.experiment-card:hover .experiment-overlay {
  opacity: 1;
}
.view-btn {
  background: linear-gradient(90deg, #8a2be2 60%, #b57edc 100%);
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 8px 22px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(138,43,226,0.10);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s, box-shadow 0.2s;
}
.view-btn:hover {
  background: linear-gradient(90deg, #b57edc 0%, #8a2be2 100%);
  box-shadow: 0 4px 16px rgba(138,43,226,0.18);
}
.experiment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 22px 20px 18px 20px;
}
.experiment-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.2;
}
.experiment-desc {
  color: #7f8c8d;
  font-size: 15px;
  margin-bottom: 14px;
  min-height: 36px;
  line-height: 1.5;
}
.experiment-stats {
  display: flex;
  gap: 18px;
  margin-bottom: 10px;
  color: #8a2be2;
  font-size: 14px;
  align-items: center;
}
.stat {
  display: flex;
  align-items: center;
  gap: 5px;
}
.experiment-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}
</style> 