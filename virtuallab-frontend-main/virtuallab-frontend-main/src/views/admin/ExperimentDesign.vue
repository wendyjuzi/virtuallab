<template>
  <div class="experiment-design-admin">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h2>超级仿真实验设计平台</h2>
        <el-select v-model="subject" placeholder="选择学科" style="width: 120px; margin-left: 20px">
          <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-input v-model="experimentName" placeholder="实验名称" style="width: 200px; margin-left: 10px" />
        <el-button type="success" @click="exportAndSaveSceneJson" style="margin-left: 10px">
          完成设计并发布
        </el-button>
      </div>
      
    </div>

    <div class="main-content">
      <!-- 中间：3D仿真编辑区 -->
      <div class="center-panel">
        <div class="design-area">
          <ThreeEditor
            ref="threeEditorRef"
            :experimentName="experimentName"
            :subject="subject"
            :experimentParams="experimentParams"
            :experimentDesc="experimentDesc"
            :experimentDifficulty="experimentDifficulty"
            :experimentTags="experimentTags"
            @scene-export="handleSceneExport"
            @scene-change="handleSceneChange"
            @model-import="handleModelImport"
          />
        </div>
      </div>

      <!-- 右侧：参数与属性面板（可收放） -->
      <div class="right-panel" :class="{ collapsed: !showSettings }">
        <div class="panel-header">
          <h3>实验设置</h3>
          <el-button @click="showSettings = !showSettings" size="small" icon="Fold" v-if="showSettings" />
          <el-button @click="showSettings = !showSettings" size="small" icon="Expand" v-else />
        </div>
        <div class="experiment-settings" v-show="showSettings">
          <div class="setting-section">
            <h4>实验参数</h4>
            <el-input-number v-model="experimentParams.gravity" :min="0" :max="20" :step="0.1" size="small" label="重力加速度" />
            <el-input-number v-model="experimentParams.friction" :min="0" :max="1" :step="0.01" size="small" label="摩擦系数" />
            <el-input-number v-model="experimentParams.elasticity" :min="0" :max="1" :step="0.01" size="small" label="弹性系数" />
            <el-slider v-model="experimentParams.simulationSpeed" :min="0.1" :max="3" :step="0.1" label="仿真速度" />
          </div>
          <div class="setting-section">
            <h4>实验描述</h4>
            <el-input v-model="experimentDesc" type="textarea" :rows="4" placeholder="请输入实验描述、操作说明、学习目标等..." />
          </div>
          <div class="setting-section">
            <h4>实验难度</h4>
            <el-radio-group v-model="experimentDifficulty">
              <el-radio label="easy">初级</el-radio>
              <el-radio label="medium">中级</el-radio>
              <el-radio label="hard">高级</el-radio>
            </el-radio-group>
          </div>
          <div class="setting-section">
            <h4>实验标签</h4>
            <el-input v-model="experimentTags" placeholder="请输入标签，用逗号分隔" />
          </div>
        </div>
      </div>
    </div>

    <!-- 发布对话框 -->
    <el-dialog v-model="publishDialogVisible" title="发布实验" width="600px">
      <div class="publish-form">
        <el-form :model="publishForm" label-width="100px">
          <el-form-item label="实验名称" required>
            <el-input v-model="publishForm.name" />
          </el-form-item>
          <el-form-item label="学科分类" required>
            <el-select v-model="publishForm.subject" style="width: 100%">
              <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="实验描述" required>
            <el-input v-model="publishForm.description" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="实验难度" required>
            <el-radio-group v-model="publishForm.difficulty">
              <el-radio label="easy">初级</el-radio>
              <el-radio label="medium">中级</el-radio>
              <el-radio label="hard">高级</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="实验标签">
            <el-input v-model="publishForm.tags" placeholder="用逗号分隔多个标签" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="publishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmPublish" :loading="publishing">确认发布</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Fold, Expand } from '@element-plus/icons-vue'
import ThreeEditor from '@/components/ThreeEditor.vue'
import { useRouter } from 'vue-router'

// 学科、年级配置
const subjectOptions = [
  { label: '物理', value: 'physics' },
  { label: '化学', value: 'chemistry' },
  { label: '数学', value: 'math' },
  { label: '生物', value: 'biology' }
]


// 响应式数据
const subject = ref('physics')
const experimentName = ref('')
const experimentDesc = ref('')
const experimentDifficulty = ref('medium')
const experimentTags = ref('')
const publishDialogVisible = ref(false)
const publishing = ref(false)
const experimentParams = ref({
  gravity: 9.8,
  friction: 0.3,
  elasticity: 0.8,
  simulationSpeed: 1.0
})
const publishForm = ref({
  name: '',
  subject: 'physics',
  description: '',
  difficulty: 'medium',
  tags: ''
})
const threeEditorRef = ref(null)
const showSettings = ref(true)
const router = useRouter()

// 3D编辑器事件回调
function handleSceneExport(data: any) {
  ElMessage.success('场景导出成功')
}
function handleSceneChange(data: any) {
  // 可做自动保存、AI分析等
}
function handleModelImport(data: any) {
  ElMessage.success('模型导入成功')
}

// 保存、加载、导出场景
function saveScene() {
  if (!threeEditorRef.value) return ElMessage.warning('请先创建场景')
  const sceneData = (threeEditorRef.value as any).exportFile()
  localStorage.setItem('savedScene', JSON.stringify(sceneData))
  ElMessage.success('场景保存成功')
}
function loadScene() {
  const savedScene = localStorage.getItem('savedScene')
  if (savedScene && threeEditorRef.value) {
    (threeEditorRef.value as any).createScene(JSON.parse(savedScene))
    ElMessage.success('场景加载成功')
  } else {
    ElMessage.warning('没有找到保存的场景')
  }
}
function exportScene() {
  if (!threeEditorRef.value) return ElMessage.warning('请先创建场景')
  const sceneData = (threeEditorRef.value as any).exportFile()
  const dataStr = JSON.stringify(sceneData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${experimentName.value || 'experiment'}.json`
  link.click()
  ElMessage.success('场景导出成功')
}

// 发布实验
function publishExperiment() {
  if (!experimentName.value) return ElMessage.error('请填写实验名称')
  if (!threeEditorRef.value) return ElMessage.error('请先设计实验场景')
  publishForm.value.name = experimentName.value
  publishForm.value.subject = subject.value
  publishForm.value.description = experimentDesc.value
  publishForm.value.difficulty = experimentDifficulty.value
  publishForm.value.tags = experimentTags.value
  publishDialogVisible.value = true
}
async function confirmPublish() {
  if (!publishForm.value.name || !publishForm.value.description) {
    ElMessage.error('请填写完整的实验信息')
    return
  }
  publishing.value = true
  try {
    if (!threeEditorRef.value) throw new Error('3D编辑区未初始化')
    const sceneData = (threeEditorRef.value as any).exportFile()
    const screenshot = (threeEditorRef.value as any).getScreenshot?.() // 获取截图
    const publishData = {
      ...publishForm.value,
      sceneData,
      experimentParams: experimentParams.value,
      screenshot, // 新增：实验截图
      createTime: new Date().toISOString(),
      status: 'published'
    }
    // 模拟后端发布逻辑
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    ElMessage.success('实验发布成功！')
    publishDialogVisible.value = false
    experimentName.value = ''
    experimentDesc.value = ''
    experimentTags.value = ''
  } catch (error: any) {
    ElMessage.error('发布失败，请重试：' + (error && error.message ? error.message : error))
  } finally {
    publishing.value = false
  }
}

// 新增：自动上传 JSON 文件到 /upload/scene-json-to-frontend
async function exportAndSaveSceneJson() {
  if (!threeEditorRef.value) {
    ElMessage.error('请先完成场景设计')
    return
  }
  const sceneData = (threeEditorRef.value as any).exportFile()
  if (!sceneData || typeof sceneData !== 'object' || !Array.isArray(sceneData.objects) || sceneData.objects.length === 0) {
    ElMessage.error('导出失败，3D场景数据为空，请检查设计内容！')
    return
  }
  const fileName = `${experimentName.value || 'experiment'}_${Date.now()}.json`
  const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' })
  const formData = new FormData()
  formData.append('file', blob, fileName)
  try {
    const res = await fetch('/upload/scene-json-to-frontend', {
      method: 'POST',
      body: formData
    })
    const result = await res.json()
    if (result.path) {
      ElMessage.success('JSON已自动上传并写入public/static/json/目录！')
      const sceneJsonPath = result.path
      localStorage.setItem('publishSceneJsonPath', sceneJsonPath)
      localStorage.setItem('publishExperimentName', experimentName.value)
      localStorage.setItem('publishExperimentDesc', experimentDesc.value)
      localStorage.setItem('publishExperimentDifficulty', experimentDifficulty.value)
      localStorage.setItem('publishExperimentTags', experimentTags.value)
      localStorage.setItem('publishExperimentSubject', subject.value)
      localStorage.setItem('publishExperimentParams', JSON.stringify(experimentParams.value))
      router.push('/admin/experiment/publish')
    } else {
      throw new Error(result.error || '未知错误')
    }
  } catch (e) {
    ElMessage.error('自动上传失败，请检查接口服务是否正常！')
  }
}
</script>

<style lang="less" scoped>
.experiment-design-admin {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.toolbar {
  background: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  .toolbar-left {
    display: flex;
    align-items: center;
    
    h2 {
      margin: 0;
      color: #303133;
      font-size: 18px;
    }
  }
  
  .toolbar-right {
    display: flex;
    gap: 10px;
  }
}

.main-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.center-panel {
  flex: 1;
  background: #1a1a1a;
  
  .design-area {
    height: 100%;
  }
}

.right-panel {
  width: 350px;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  &.collapsed {
    width: 40px;
    min-width: 40px;
    .panel-header {
      justify-content: flex-end;
    }
    .experiment-settings {
      display: none;
    }
  }
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    h3 {
      margin: 0;
      color: #303133;
      font-size: 16px;
    }
  }
  .experiment-settings {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    .setting-section {
      margin-bottom: 24px;
      h4 {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }
      .parameter-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        label {
          width: 120px;
          font-size: 13px;
          color: #606266;
        }
        .el-input-number {
          flex: 1;
        }
        .el-slider {
          flex: 1;
          margin-left: 10px;
        }
      }
      .el-radio-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
}

.publish-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style> 