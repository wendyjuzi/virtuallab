<template>
  <div class="score-bg">
    <div class="score-page">
      <div class="page-header">
        <el-button class="back-btn" type="text" @click="goBack">
          <i class="iconfont icon-back" style="margin-right:4px;"></i> 返回
        </el-button>
        <h2 class="page-title">实验报告评分系统</h2>
        <div class="page-subtitle">智能AI评分与教师人工评分相结合</div>
      </div>

      <div class="score-container">
        <!-- AI 自动评分卡片 -->
        <div class="score-card ai-card">
          <div class="card-header">
            <div class="icon-wrapper">
              <i class="iconfont icon-robot"></i>
            </div>
            <h3>AI 自动评分</h3>
          </div>

          <div class="card-content">
            <el-upload
              class="upload-area"
              drag
              action=""
              :auto-upload="false"
              :show-file-list="false"
              accept=".pdf"
              :on-change="handleFileChange"
            >
              <div class="upload-inner">
                <i class="iconfont icon-upload"></i>
                <div class="upload-text">
                  <p>点击或将实验报告拖拽到此处</p>
                  <p class="upload-hint">支持PDF格式文件</p>
                </div>
              </div>
            </el-upload>

            <div class="file-info" v-if="selectedFile">
              <i class="iconfont icon-file-pdf"></i>
              <span>{{ selectedFile.name }}</span>
            </div>

            <el-button
              type="primary"
              class="score-btn"
              :disabled="!selectedFile"
              @click="startScoring"
              :loading="aiLoading"
            >
              <i class="iconfont icon-start"></i> 开始AI评分
            </el-button>

            <div v-if="aiLoading" class="ai-loading-tip">
              <i class="el-icon-loading" style="margin-right:8px;font-size:20px;"></i>
              AI正在批改，请稍候...
            </div>

            <div class="result-title" v-if="scoreResult">AI评分结果</div>
            <div class="result-box" :class="{ 'has-result': scoreResult }">
              <el-input
                type="textarea"
                :rows="8"
                v-model="scoreResult"
                placeholder="AI评分结果将显示在此处..."
                readonly
              />
            </div>
          </div>
        </div>

        <!-- 教师人工评分卡片 -->
        <div class="score-card teacher-card">
          <div class="card-header">
            <div class="icon-wrapper">
              <i class="iconfont icon-teacher"></i>
            </div>
            <h3>教师人工评分</h3>
          </div>

          <div class="card-content">
            <el-form :model="manualScore" label-width="90px" label-position="top">
              <el-form-item label="教师评语">
                <el-input
                  type="textarea"
                  v-model="manualScore.comment"
                  placeholder="请输入详细评语..."
                  :rows="6"
                  resize="none"
                />
              </el-form-item>

              <el-form-item label="评分（0~100分）">
                <div class="score-input-wrapper">
                  <el-input-number 
                    v-model="manualScore.score" 
                    :min="0" 
                    :max="100"
                    controls-position="right"
                    class="score-input"
                  />
                  <span class="score-unit">分</span>
                </div>
              </el-form-item>

              <el-button 
                type="primary" 
                class="submit-btn"
                @click="submitManualScore"
              >
                <i class="iconfont icon-submit"></i> 提交评分
              </el-button>
            </el-form>
          </div>
        </div>
      </div>

      <!-- 评分记录卡片单独一行 -->
      <div class="result-container" v-if="ratingRecord">
        <div class="score-card result-card">
          <div class="result-bar"></div>
          <div class="card-header">
            <div class="icon-wrapper">
              <i class="iconfont icon-record"></i>
            </div>
            <h3>当前评分记录</h3>
            <el-button size="small" @click="revokeScore" type="danger" class="revoke-btn">
              <i class="iconfont icon-delete"></i> 撤回
            </el-button>
          </div>
          <div class="card-content">
            <div class="score-row">
              <span class="score-label">评分：</span>
              <span class="score-value">{{ ratingRecord.score }}</span>
              <span class="score-unit">分</span>
            </div>
            <div class="comment-box">
              <span class="quote-mark">"</span>
              <span class="comment-content">{{ ratingRecord.comment }}</span>
              <span class="quote-mark">"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const sessionId = route.params.sessionId

GlobalWorkerOptions.workerSrc = workerSrc

const selectedFile = ref<File | null>(null)
const scoreResult = ref('')
const manualScore = ref({
  comment: '',
  score: 0
})
const ratingRecord = ref<null | {
  score: number,
  comment: string,
}>(null)
const aiLoading = ref(false)

const handleFileChange = (uploadFile: any) => {
  selectedFile.value = uploadFile.raw
}

const startScoring = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择一个 PDF 文件')
    return
  }
  aiLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await axios.post('/api/pdf/score', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    scoreResult.value = response.data.scoreFeedback || '未返回评分结果'
    ElMessage.success('评分完成')
  } catch (error) {
    console.error('评分错误详情:', error)
    ElMessage.error('评分失败')
  } finally {
    aiLoading.value = false
  }
}

const submitManualScore = async () => {
  if (!manualScore.value.comment || manualScore.value.score === null) {
    ElMessage.warning('请填写完整的评语和分数')
    return
  }

  try {
    await axios.post('/api/experiment/manual-score', {
      sessionId: sessionId,
      score: manualScore.value.score,
      comment: manualScore.value.comment
    })
    ElMessage.success('人工评分提交成功')
    await loadRatingRecord()
  } catch (err) {
    console.error('提交评分失败:', err)
    ElMessage.error('提交评分失败')
  }
}

// const editScore = () => {
//   if (ratingRecord.value) {
//     manualScore.value.score = ratingRecord.value.score
//     manualScore.value.comment = ratingRecord.value.comment
//     ElMessage.info('已填入评分信息，可重新修改并提交')
//   }
// }


const revokeScore = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要撤回评分吗？此操作不可恢复。',
      '撤回确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    // 用户点击了确认
    await axios.delete('/api/experiment/manual-score/delete', {
      params: { sessionId }
    })
    ratingRecord.value = null
    ElMessage.success('评分已撤回')
  } catch (err) {
    if (err !== 'cancel' && err !== 'close') {
      // 不是取消或关闭导致的错误，才报错
      console.error('撤回失败', err)
      ElMessage.error('撤回评分失败')
    }
    // 用户取消或关闭弹窗，不做操作
  }
}


const loadRatingRecord = async () => {
  try {
    const res = await axios.get('/api/experiment/manual-score/show', {
      params: { sessionId }
    })
    if (res.data) {
      ratingRecord.value = {
        score: res.data.score,
        comment: res.data.comment,
      }
    }
  } catch (err) {
    console.warn('无评分记录')
  }
}

const goBack = () => {
  router.back()
}

onMounted(loadRatingRecord)
</script>



<style scoped lang="scss">
.score-bg {
  inset: 0;
  z-index: 0;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f2ff 0%, #f3e8ff 100%);
  overflow: hidden;
}
.score-bg::before, .score-bg::after {
  content: '';
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  pointer-events: none;
}
.score-bg::before {
  width: 420px;
  height: 420px;
  left: -140px;
  top: -140px;
  background: radial-gradient(circle at 30% 30%, #7ed6ff 0%, #409EFF 80%, transparent 100%);
}
.score-bg::after {
  width: 320px;
  height: 320px;
  right: -100px;
  bottom: -100px;
  background: radial-gradient(circle at 70% 70%, #e9d5ff 0%, #c084fc 80%, transparent 100%);
}

.score-page {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  min-height: 100vh;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 8px 32px rgba(64,158,255,0.08);
  border-radius: 24px;
  backdrop-filter: blur(2px);
}

.result-card .action-buttons {
  margin-top: 10px;
  display: flex;
  gap: 12px;
}
.score-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 32px;
  
  .back-btn {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 15px;
    color: #409EFF;
    padding: 0 12px;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: color 0.2s;
    z-index: 2;
    
    &:hover {
      color: #c084fc;
      background: rgba(192,132,252,0.08);
      border-radius: 6px;
    }
  }
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .page-subtitle {
    font-size: 16px;
    color: #909399;
  }
}

.score-container {
  display: flex;
  gap: 24px;
  justify-content: space-between;
}

.result-container {
  margin-top: 32px;
}
.result-card {
  position: relative;
  overflow: visible;
  box-shadow: 0 6px 24px rgba(64, 158, 255, 0.10);
  border-top: none;
  margin-bottom: 0;
  .result-bar {
    height: 6px;
    background: linear-gradient(90deg, #409EFF 0%, #c084fc 100%);
    border-radius: 8px 8px 0 0;
    margin-bottom: -6px;
  }
  .card-header {
    background: none;
    border-bottom: 1px solid #F0F2F5;
    padding-bottom: 10px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .icon-wrapper {
      background: linear-gradient(135deg, #409EFF22 0%, #c084fc22 100%);
      .iconfont {
        color: #409EFF;
      }
    }
    h3 {
      flex: 1;
      margin: 0 12px;
      font-size: 18px;
      color: #409EFF;
      font-weight: 600;
    }
    .revoke-btn {
      margin-left: auto;
    }
  }
  .card-content {
    padding: 24px 32px 28px 32px;
    .score-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 18px;
      .score-label {
        font-size: 16px;
        color: #909399;
        margin-right: 8px;
      }
      .score-value {
        font-size: 36px;
        font-weight: bold;
        color: #409EFF;
        background: #F0F9FF;
        border-radius: 8px;
        padding: 2px 18px;
        margin-right: 8px;
        box-shadow: 0 2px 8px #409EFF11;
      }
      .score-unit {
        font-size: 16px;
        color: #909399;
      }
    }
    .comment-box {
      background: #F5F7FA;
      border-radius: 8px;
      padding: 18px 22px;
      font-size: 16px;
      color: #606266;
      position: relative;
      display: flex;
      align-items: flex-start;
      .quote-mark {
        font-size: 28px;
        color: #C0C4CC;
        font-family: serif;
        margin: 0 6px;
        line-height: 1;
      }
      .comment-content {
        flex: 1;
        font-size: 16px;
        color: #606266;
        word-break: break-all;
      }
    }
  }
}
.score-card {
  flex: 1;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
  
  &.ai-card {
    border-top: 4px solid #409EFF;
  }
  
  &.teacher-card {
    border-top: 4px solid #c084fc;
  }
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
  
  .teacher-card & {
    background: linear-gradient(90deg, rgba(192, 132, 252, 0.1) 0%, rgba(192, 132, 252, 0.05) 100%);
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(64, 158, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    
    .teacher-card & {
      background: rgba(192, 132, 252, 0.2);
    }
    
    .iconfont {
      font-size: 20px;
      color: #409EFF;
      
      .teacher-card & {
        color: #c084fc;
      }
    }
  }
  
  h3 {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin: 0;
  }
}

.card-content {
  padding: 20px 24px;
}

.upload-area {
  margin-bottom: 16px;
  
  :deep(.el-upload) {
    width: 100%;
  }
  
  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 24px;
    border-radius: 8px;
    border: 1px dashed #DCDFE6;
    background-color: #FAFAFA;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409EFF;
      background-color: rgba(64, 158, 255, 0.05);
    }
  }
}

.upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .iconfont {
    font-size: 48px;
    color: #C0C4CC;
    margin-bottom: 12px;
  }
  
  .upload-text {
    text-align: center;
    
    p {
      margin: 0;
      color: #606266;
    }
    
    .upload-hint {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

.file-info {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #F5F7FA;
  border-radius: 4px;
  margin-bottom: 16px;
  
  .iconfont {
    color: #F56C6C;
    margin-right: 8px;
  }
  
  span {
    font-size: 14px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.score-btn, .submit-btn {
  width: 100%;
  height: 40px;
  font-size: 14px;
  
  .iconfont {
    margin-right: 6px;
  }
}

.result-title {
  font-size: 14px;
  color: #606266;
  margin: 20px 0 8px;
  font-weight: 500;
}

.result-box {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #EBEEF5;
  
  &.has-result {
    border-color: #409EFF;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
  }
  
  :deep(.el-textarea__inner) {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    line-height: 1.6;
    color: #303133;
    background-color: #FAFAFA;
  }
}

.score-input-wrapper {
  display: flex;
  align-items: center;
  
  .score-input {
    width: 120px;
    
    :deep(.el-input__inner) {
      text-align: center;
    }
  }
  
  .score-unit {
    margin-left: 8px;
    color: #606266;
  }
}

.ai-loading-tip {
  display: flex;
  align-items: center;
  color: #409EFF;
  font-size: 15px;
  margin: 16px 0 8px 0;
  .el-icon-loading {
    font-size: 20px;
  }
}

@media (max-width: 992px) {
  .score-container {
    flex-direction: column;
  }
  
  .score-card {
    width: 100%;
  }
}
</style>
