<template>
  <div v-if="visible" class="success-message-overlay" @click="close">
    <div class="success-message" @click.stop>
      <div class="success-lottie" ref="successLottieRef"></div>
      <h3 class="success-title">{{ title }}</h3>
      <p class="success-content">{{ content }}</p>
      <div class="success-actions">
        <el-button type="primary" @click="confirm">确定</el-button>
        <el-button @click="close">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import lottie from 'lottie-web'
import successLottie from '@/assets/lotties/success.json'

interface Props {
  visible: boolean
  title?: string
  content?: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '操作成功',
  content: '您的操作已成功完成'
})

const emit = defineEmits<Emits>()

const successLottieRef = ref<HTMLElement>()

const close = () => {
  emit('update:visible', false)
}

const confirm = () => {
  emit('confirm')
  close()
}

// 监听visible变化，加载动画
watch(() => props.visible, (newVal) => {
  if (newVal && successLottieRef.value) {
    // 重新加载动画
    lottie.loadAnimation({
      container: successLottieRef.value,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: successLottie,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    })
  }
})

onMounted(() => {
  if (props.visible && successLottieRef.value) {
    lottie.loadAnimation({
      container: successLottieRef.value,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: successLottie,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    })
  }
})
</script>

<style scoped>
.success-message-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.success-message {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

.success-lottie {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.success-content {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.success-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style> 