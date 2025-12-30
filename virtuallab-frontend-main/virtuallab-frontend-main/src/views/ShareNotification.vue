<template>
  <el-table :data="notifications">
    <el-table-column prop="message" label="内容" />
    <el-table-column prop="createdAt" label="时间" />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button v-if="!scope.row.read" @click="markRead(scope.row.id)">标为已读</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-button @click="markAllRead">全部标为已读</el-button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const notifications = ref([])
const username = '' // 从登录信息获取

async function fetchNotifications() {
  notifications.value = (await axios.get('/resource/share/notifications', { params: { username } })).data
}
async function markRead(id) {
  await axios.post(`/resource/share/notifications/${id}/read`)
  fetchNotifications()
}
async function markAllRead() {
  await axios.post('/resource/share/notifications/read-all', { username })
  fetchNotifications()
}
onMounted(fetchNotifications)
</script> 