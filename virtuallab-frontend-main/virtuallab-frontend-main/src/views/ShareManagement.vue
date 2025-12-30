<template>
  <el-card>
    <h2>被分享给我的资源</h2>
    <div class="toolbar">
      <el-input v-model="search" placeholder="搜索标题或分享人" clearable style="width: 260px; margin-bottom: 18px;" />
    </div>
    <el-table
      :data="filteredShares"
      v-loading="loading"
      highlight-current-row
      style="margin-bottom: 8px;"
      :empty-text="loading ? '加载中...' : '暂无被分享资源'"
    >
      <el-table-column prop="shareTitle" label="标题" min-width="180" />
      <el-table-column prop="sharedBy" label="分享人" min-width="120" />
      <el-table-column prop="createdAt" label="分享时间" min-width="160">
        <template #default="scope">
          {{ formatTime(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="permission" label="权限" min-width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.permission === 'read'">仅查看</el-tag>
          <el-tag v-else-if="scope.row.permission === 'write'" type="warning">可编辑</el-tag>
          <el-tag v-else-if="scope.row.permission === 'admin'" type="danger">管理员</el-tag>
          <el-tag v-else>{{ scope.row.permission }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="100">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewResource(scope.row.resourceId)">查看资源</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-alert v-if="error" type="error" :closable="false" style="margin-top: 16px;">{{ error }}</el-alert>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { getSharesWithMe } from '@/api/resourceShare'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const sharedWithMe = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')

const fetchSharesWithMe = async () => {
  loading.value = true
  error.value = ''
  try {
    const username = userStore.user?.username
    if (!username) throw new Error('未获取到当前用户信息')
    const res = await getSharesWithMe(username)
    sharedWithMe.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e: any) {
    error.value = e?.message || '获取被分享资源失败'
    sharedWithMe.value = []
  } finally {
    loading.value = false
  }
}

const viewResource = (resourceId: number) => {
  window.open(`/experiment/${resourceId}`, '_blank')
}

const formatTime = (time?: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const filteredShares = computed(() => {
  if (!search.value) return sharedWithMe.value
  const s = search.value.trim().toLowerCase()
  return sharedWithMe.value.filter(item =>
    (item.shareTitle && item.shareTitle.toLowerCase().includes(s)) ||
    (item.sharedBy && item.sharedBy.toLowerCase().includes(s))
  )
})

onMounted(fetchSharesWithMe)
</script>

<style scoped>
.el-card {
  max-width: 900px;
  margin: 40px auto;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(107, 79, 255, 0.08);
  background: #fafaff;
  padding: 32px 24px;
}
h2 {
  color: #6b4fff;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 24px;
  letter-spacing: 1px;
}
.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.el-table {
  margin-bottom: 16px;
  border-radius: 8px;
  background: #fff;
}
.el-table th {
  background: #f3f4fa;
  color: #666;
  font-weight: 600;
}
.el-table td {
  color: #333;
  font-size: 15px;
}
</style>