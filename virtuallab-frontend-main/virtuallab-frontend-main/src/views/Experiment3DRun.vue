<template>
  <div style="height: 100vh; width: 100vw;">
    <SceneEditor ref="sceneRef" style="height: 100%; width: 100%;" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import SceneEditor from '@/three/editor/scene.vue'

const route = useRoute()
const sceneRef = ref<any>(null)
const sceneJsonPath = ref('')

onMounted(async () => {
  let path = route.query.sceneJsonPath
  if (Array.isArray(path)) path = path[0]
  sceneJsonPath.value = path || localStorage.getItem('publishSceneJsonPath') || ''
  if (!sceneJsonPath.value) {
    alert('未找到 3D 场景 JSON 路径！')
    return
  }
  try {
    const res = await fetch(sceneJsonPath.value)
    if (!res.ok) throw new Error('文件加载失败')
    const json = await res.json()
    await nextTick()
    if (sceneRef.value && typeof sceneRef.value.createScene === 'function') {
      sceneRef.value.createScene(json)
    } else {
      alert('3D编辑器未正确加载。')
    }
  } catch (e: any) {
    alert('加载实验场景失败: ' + (e?.message || e))
  }
})
</script>

<style scoped>
.experiment-3d-run {
  min-height: 100vh;
  background: linear-gradient(120deg, #f5f7fa 0%, #e3e0f7 100%);
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px 12px 40px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(107, 79, 255, 0.08);
}
.editor-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: stretch;
  background: #1a1a1a;
  padding: 0;
}
.loading, .error {
  text-align: center;
  color: #6b4fff;
  font-size: 20px;
  margin-top: 80px;
}
.error {
  color: #ff4d4f;
}
</style> 