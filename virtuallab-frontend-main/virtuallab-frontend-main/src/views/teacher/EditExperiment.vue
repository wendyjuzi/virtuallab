<template>
  <div class="experiment-bg">
    <button class="back-btn" @click="goBack">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 17L9 12L14 7" stroke="#1890ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      返回
    </button>
    <div class="experiment-create-2col">
      <!-- 左侧实验信息 -->
      <div class="exp-card left">
        <div class="card-header"><span class="card-dot"></span><span class="card-title">实验基本信息</span></div>
        <el-form :model="form" label-width="110px" class="form-card">
          <el-form-item label="实验名称">
            <el-input v-model="form.name" placeholder="请输入实验名称" />
          </el-form-item>
          <el-form-item label="实验描述">
            <el-input type="textarea" v-model="form.description" placeholder="请输入实验描述" :rows="4" />
          </el-form-item>
          <el-form-item label="实验原理">
            <el-input type="textarea" v-model="form.principle" placeholder="请输入实验原理" :rows="3" />
          </el-form-item>
          <el-form-item label="实验目的">
            <el-input type="textarea" v-model="form.purpose" placeholder="请输入实验目的" :rows="3" />
          </el-form-item>
          <el-form-item label="实验方法">
            <el-input type="textarea" v-model="form.method" placeholder="请输入实验方法" :rows="3" />
          </el-form-item>
          <el-form-item label="实验步骤">
            <el-input type="textarea" v-model="form.steps" placeholder="请输入实验步骤" :rows="4" />
          </el-form-item>
        </el-form>
      </div>

      <div class="card-divider"></div>

      <!-- 右侧发布设置 -->
      <div class="exp-card right">
        <div class="card-header"><span class="card-dot green"></span><span class="card-title">实验发布设置</span></div>
        <el-form :model="form" label-width="110px" class="form-card">
          <el-form-item label="实验类型">
            <el-select v-model="form.category" placeholder="选择类型">
              <el-option label="物理" value="物理" />
              <el-option label="化学" value="化学" />
              <el-option label="生物" value="生物" />
            </el-select>
          </el-form-item>

          <el-form-item label="实验难度">
            <el-select v-model="form.level" placeholder="选择难度">
              <el-option label="初级" value="初级" />
              <el-option label="中级" value="中级" />
              <el-option label="高级" value="高级" />
            </el-select>
          </el-form-item>

          <el-form-item label="项目类型">
            <el-radio-group v-model="form.projectType">
              <el-radio label="individual">个人项目</el-radio>
              <el-radio label="team">小组项目</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="封面图片">
            <div v-if="!form.imageUrl">
              <el-upload
                class="upload-demo"
                action="/api/experiment/project/upload/image"
                :limit="1"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                name="file"
              >
                <el-button type="primary">上传图片</el-button>
              </el-upload>
            </div>
            <div v-else class="uploaded-file">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ getFileName(form.imageUrl) }}</span>
              <el-button type="text" @click="removeFile">重新上传</el-button>
            </div>
          </el-form-item>

          <el-form-item label="视频链接">
            <el-input v-model="form.videoUrl" placeholder="请输入实验视频链接" />
          </el-form-item>

          <!-- <el-form-item label="发布班级">
            <el-select v-model="form.classIds" multiple placeholder="选择要发布的班级">
              <el-option v-for="cls in mockClasses" :key="cls.id" :label="cls.name" :value="cls.id" />
            </el-select>
          </el-form-item> -->

          <el-form-item>
            <el-button type="primary" @click="submit">提交修改</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const projectId = Number(route.query.projectId)

const form = ref({
  id: projectId,
  name: '',
  description: '',
  principle: '',
  purpose: '',
  method: '',
  steps: '',
  category: '',
  level: '',
  imageUrl: '',
  videoUrl: '',
  classIds: [] as number[],
  projectType: 'individual',
})


onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`/api/experiment/project/editdetail`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { projectId }
    })
    console.log('项目详情接口返回：', res.data)
    form.value = res.data

  } catch (error) {
    console.error('获取实验失败', error)
  }
})

const submit = async () => {
  try {
    const token = localStorage.getItem('token')

    // 浅拷贝form.value，防止直接修改响应式数据
    const submitData = { ...form.value }

    // 删除 auditStatus 字段
    delete submitData.auditStatus
    delete submitData.publishStatus

    const res = await axios.put('/api/experiment/project/editupdate', submitData, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.status === 200) {
      ElMessage.success('修改成功')
      router.push('/teacher')
    } else {
      ElMessage.error('修改失败')
    }
  } catch (error) {
    console.error('提交失败', error)
    ElMessage.error('提交失败，请稍后重试')
  }
}


const handleUploadSuccess = (res: any) => {
  form.value.imageUrl = res.url
  ElMessage.success('图片上传成功')
}

const handleUploadError = () => {
  ElMessage.error('图片上传失败')
}

const removeFile = () => {
  form.value.imageUrl = ''
}

const getFileName = (url: string) => {
  return url.split('/').pop() || '未知文件'
}

const goBack = () => {
  window.history.length > 1 ? window.history.back() : router.push('/teacher')
}
</script>

<style scoped>
.experiment-bg {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(120deg, #f5f7fa 0%, #f3eaf8 100%);
  position: relative;
  overflow-x: hidden;
}
.experiment-bg::before {
  content: '';
  position: absolute;
  left: -120px;
  top: 10vh;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, #9575cd 0%, #f3eaf8 80%, transparent 100%);
  opacity: 0.18;
  z-index: 0;
  filter: blur(2px);
}
.experiment-bg::after {
  content: '';
  position: absolute;
  right: -100px;
  bottom: 5vh;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, #b39ddb 0%, #f3eaf8 80%, transparent 100%);
  opacity: 0.15;
  z-index: 0;
  filter: blur(2px);
}
.experiment-create-2col {
  display: flex;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 48px;
  margin-bottom: 48px;
  min-height: 85vh;
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 8px 32px rgba(171, 71, 188, 0.1),
    0 4px 16px rgba(171, 71, 188, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  padding: 32px;
  animation: fadeIn 0.6s ease-out;
  overflow: hidden;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.experiment-create-2col::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
}

.experiment-create-2col::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(171, 71, 188, 0.2),
    transparent
  );
}

.exp-card {
  flex: 1 1 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 
    0 4px 12px rgba(171, 71, 188, 0.08),
    0 2px 4px rgba(171, 71, 188, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-top: 20px;
}

.exp-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ce93d8, #9575cd);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.exp-card:hover {
  box-shadow: 
    0 12px 28px rgba(171, 71, 188, 0.12),
    0 4px 8px rgba(171, 71, 188, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.exp-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  gap: 12px;
  position: relative;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(171, 71, 188, 0.1),
    rgba(171, 71, 188, 0.2),
    rgba(171, 71, 188, 0.1)
  );
}

.card-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9575cd 0%, #ce93d8 100%);
  box-shadow: 
    0 2px 8px rgba(171, 71, 188, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  display: inline-block;
  position: relative;
}

.card-dot::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-dot:hover::after {
  opacity: 1;
}

.card-title {
  font-size: 20px;
  font-weight: 800;
  color: #9575cd;
  letter-spacing: 1px;
  text-align: left;
  background: none;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
}

.card-divider {
  width: 2px;
  background: repeating-linear-gradient(
    180deg,
    #f3eaf8 0 12px,
    #e1bee7 12px 16px
  );
  margin: 32px 0;
  border-radius: 2px;
  align-self: stretch;
  z-index: 2;
  flex-shrink: 0;
}

.form-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.el-form-item {
  margin-bottom: 24px;
  position: relative;
}

.el-form-item__label {
  color: #9575cd !important;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 1px;
}

.el-input, .el-textarea, .el-select, .el-radio-group {
  border-radius: 14px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1.5px solid rgba(206, 147, 216, 0.4) !important;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  font-size: 15px;
}

.el-input__inner, .el-textarea__inner {
  border-radius: 14px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1.5px solid rgba(206, 147, 216, 0.4) !important;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  box-shadow: 
    0 2px 6px rgba(171, 71, 188, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.el-input__inner:focus, .el-textarea__inner:focus {
  border: 1.5px solid rgba(149, 117, 205, 0.8) !important;
  box-shadow: 
    0 4px 12px rgba(171, 71, 188, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.el-select .el-input__inner {
  border-radius: 14px !important;
}

.el-radio-group {
  gap: 18px;
}

.el-radio {
  border-radius: 8px;
  padding: 2px 10px;
  background: #fafdff;
  color: #9575cd;
  font-weight: 500;
}

.el-radio.is-checked {
  background: linear-gradient(90deg, #9575cd 0%, #ce93d8 100%);
  color: #fff;
}

.upload-demo {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 
    0 4px 12px rgba(171, 71, 188, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.upload-demo:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 6px 16px rgba(171, 71, 188, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.uploaded-file {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fafdff;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 6px rgba(171, 71, 188, 0.06);
}

.file-name {
  font-weight: 500;
  color: #9575cd;
}

.el-button[type="primary"], .el-button.el-button--primary {
  background: linear-gradient(135deg, #9575cd 0%, #ce93d8 100%) !important;
  color: #fff !important;
  border-radius: 14px !important;
  border: none !important;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 28px;
  box-shadow: 
    0 4px 12px rgba(171, 71, 188, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.el-button[type="primary"]::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.el-button[type="primary"]:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(171, 71, 188, 0.25),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.el-button[type="primary"]:hover::before {
  opacity: 1;
}

.el-button[type="text"] {
  color: #9575cd !important;
  font-weight: 600;
  border-radius: 8px;
}

.el-button[type="text"]:hover {
  color: #ce93d8 !important;
  background: #f3eaf8;
}

.back-btn {
  position: absolute;
  top: 32px;
  left: 32px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(120deg, #f3eaf8 0%, #e1bee7 100%);
  color: #9575cd;
  border: none;
  border-radius: 18px;
  padding: 8px 18px 8px 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(171, 71, 188, 0.10);
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s, color 0.18s;
}

.back-btn:hover {
  background: linear-gradient(120deg, #e1bee7 0%, #f3eaf8 100%);
  color: #ce93d8;
  box-shadow: 0 4px 18px rgba(171, 71, 188, 0.18);
}

.back-btn svg path {
  stroke: #9575cd;
}

.back-btn:hover svg path {
  stroke: #ce93d8;
}

@media (max-width: 1100px) {
  .experiment-create-2col {
    flex-direction: column;
    gap: 24px;
    min-height: unset;
  }
  .exp-card {
    padding: 20px 6px 16px 6px;
    border-radius: 14px;
  }
  .card-divider {
    display: none;
  }
  .exp-card.right, .exp-card.right .form-card {
    justify-content: flex-start;
  }
}

@media (max-width: 900px) {
  .experiment-create {
    margin: 0 4px;
    padding: 16px 2px 16px 2px;
    border-radius: 12px;
    margin-top: 16px;
    margin-bottom: 16px;
  }
  .experiment-bg::before, .experiment-bg::after {
    display: none;
  }
  .back-btn {
    top: 12px;
    left: 8px;
    padding: 6px 12px 6px 8px;
    font-size: 15px;
  }
}

@media (max-width: 600px) {
  .experiment-create {
    padding: 10px 2px 10px 2px;
    border-radius: 10px;
  }
  .form {
    padding: 8px 2px 8px 2px;
    border-radius: 8px;
  }
  h2 {
    font-size: 20px;
    padding: 10px 0;
    border-radius: 10px;
  }
}
</style>
