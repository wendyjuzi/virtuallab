<template>
  <div class="data-backup-bg">
    <div class="frosted-wrapper">
      <h2>系统数据备份</h2>
      <el-button type="primary" @click="handleBackup" :loading="loading">立即备份</el-button>
      <el-button type="success" @click="downloadDatabaseBackup" :loading="dbLoading" style="margin-left: 12px;">下载数据库备份</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { startBackup } from '@/api/request'
import axios from 'axios'

const loading = ref(false)
const dbLoading = ref(false)

const handleBackup = async () => {
  loading.value = true
  const res = await startBackup()
  if (res.code === 200) {
    ElMessage.success('备份成功')
  } else {
    ElMessage.error(res.message || '备份失败')
  }
  loading.value = false
}

// 数据库备份下载（axios + Blob 实现）
async function downloadDatabaseBackup() {
  dbLoading.value = true
  try {
    const res = await axios.get('/admin/backup/database', { responseType: 'blob' })
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    // 可根据后端响应头动态获取文件名，这里写死
    link.download = 'database_backup.zip'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    ElMessage.error('下载失败')
  } finally {
    dbLoading.value = false
  }
}
</script>
<style scoped>
.data-backup-bg {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
.frosted-wrapper {
  background: rgba(236, 236, 255, 0.82);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 32px;
  max-width: 600px;
  width: 96vw;
  margin: 56px auto 0 auto;
  padding: 40px 32px 32px 32px;
  backdrop-filter: blur(12px);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
h2 {
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
  text-align: center;
}
.el-button[type="primary"] {
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px #a18fff44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-button[type="primary"]:hover {
  background: linear-gradient(90deg, #a18fff 0%, #7C3AED 100%);
  box-shadow: 0 6px 24px #7c3aed55;
  transform: scale(1.04);
}
.el-button[type="success"] {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px #43e97b44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-button[type="success"]:hover {
  background: linear-gradient(90deg, #38f9d7 0%, #43e97b 100%);
  box-shadow: 0 6px 24px #43e97b55;
  transform: scale(1.04);
}
@media (max-width: 600px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  h2 {
    font-size: 20px;
  }
}
</style> 