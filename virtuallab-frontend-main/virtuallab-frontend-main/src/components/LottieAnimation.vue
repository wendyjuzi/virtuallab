<template>
  <div 
    ref="lottieContainer" 
    class="lottie-container"
    :style="{ width: width, height: height }"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import lottie from 'lottie-web'

interface Props {
  animationData: any
  width?: string
  height?: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '100%',
  loop: true,
  autoplay: true,
  speed: 1
})

const lottieContainer = ref<HTMLElement>()
let animationInstance: any = null

const initAnimation = () => {
  if (lottieContainer.value && props.animationData) {
    animationInstance = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: props.loop,
      autoplay: props.autoplay,
      animationData: props.animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    })
    
    if (props.speed !== 1) {
      animationInstance.setSpeed(props.speed)
    }
  }
}

const play = () => {
  if (animationInstance) {
    animationInstance.play()
  }
}

const pause = () => {
  if (animationInstance) {
    animationInstance.pause()
  }
}

const stop = () => {
  if (animationInstance) {
    animationInstance.stop()
  }
}

const goToAndPlay = (value: number) => {
  if (animationInstance) {
    animationInstance.goToAndPlay(value)
  }
}

// 暴露方法给父组件
defineExpose({
  play,
  pause,
  stop,
  goToAndPlay
})

// 监听动画数据变化
watch(() => props.animationData, () => {
  if (animationInstance) {
    animationInstance.destroy()
  }
  initAnimation()
})

onMounted(() => {
  initAnimation()
})

onUnmounted(() => {
  if (animationInstance) {
    animationInstance.destroy()
  }
})
</script>

<style scoped>
.lottie-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 