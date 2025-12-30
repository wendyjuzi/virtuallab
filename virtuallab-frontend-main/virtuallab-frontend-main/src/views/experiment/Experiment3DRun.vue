<template>
  <div>这是3D实验运行页</div>
  <div style="height: 100vh; width: 100vw; overflow: hidden;">
    <SceneEditor ref="sceneRef" style="height: 100%; width: 100%; display: block;" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import SceneEditor from '@/three/editor/scene.vue'

const route = useRoute()
const sceneRef = ref()
const sceneJsonPath = route.query.sceneJsonPath as string

onMounted(() => {
  console.log('[3DRun] 路由参数 sceneJsonPath:', sceneJsonPath)
  if (!sceneJsonPath) {
    alert('未指定场景JSON路径，无法加载3D场景！')
    return
  }
  fetch(sceneJsonPath)
    .then(res => {
      if (!res.ok) throw new Error('文件加载失败: ' + sceneJsonPath)
      return res.json()
    })
    .then(data => {
      console.log('[3DRun] 加载到的场景数据:', data)
      nextTick(() => {
        console.log('[3DRun] sceneRef.value:', sceneRef.value)
        if (sceneRef.value && typeof sceneRef.value.createScene === 'function') {
          console.log('[3DRun] 调用 createScene 渲染3D场景')
          sceneRef.value.createScene(data)
        } else {
          alert('3D场景组件未就绪，无法渲染！')
          console.error('[3DRun] sceneRef.value 未就绪或未暴露 createScene')
        }
      })
    })
    .catch(err => {
      alert('加载实验场景失败: ' + err.message)
      console.error('[3DRun] 加载3D场景JSON失败', err)
    })
})
</script> 