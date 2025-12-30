<template>
  <div class="system-logs-bg">
    <div class="frosted-wrapper">
      <h2>操作日志管理</h2>
      <el-table :data="logs" v-loading="loading" border class="frosted-table" style="margin-top: 18px">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="operation" label="操作类型" />
        <el-table-column prop="module" label="模块" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" :formatter="statusFormat" />
        <el-table-column prop="createTime" label="时间" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const logs = ref<any[]>([])
const loading = ref(false)

function getLogs() {
  loading.value = true
  axios.get('/log/list').then(res => {
    console.log('日志接口返回：', res.data)
    logs.value = Array.isArray(res.data) ? res.data : []
  }).catch(err => {
    console.error('日志接口请求失败', err)
    logs.value = []
  }).finally(() => {
    loading.value = false
  })
}

function statusFormat(row: any) {
  return row.status === 1 ? '成功' : '失败'
}

onMounted(getLogs)
</script>

<style scoped>
.system-logs-bg {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
.frosted-wrapper {
  background: rgba(236, 236, 255, 0.96);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 32px;
  max-width: 1100px;
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
.frosted-table {
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 4px 16px #a18fff22, 0 2px 8px #7c3aed11;
  backdrop-filter: blur(8px);
}
.el-table th {
  background: linear-gradient(90deg, #ececff 0%, #a18fff 100%);
  color: #7C3AED;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
}
.el-table tr {
  transition: background 0.2s;
}
.el-table tr:hover {
  background: #f3f0ff !important;
}
@media (max-width: 900px) {
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