<template>
  <div class="resource-manage">
    <div class="toolbar">
      <el-button type="primary" @click="showCreateDialog = true">新建资源</el-button>
      <el-input v-model="searchKeyword" placeholder="搜索资源名称..." style="width: 200px; margin-left: 16px" @input="loadData" clearable />
    </div>
    <el-table :data="resourceList" v-loading="loading" style="margin-top: 16px;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="资源名称" />
      <el-table-column prop="type" label="类型" />
      <el-table-column prop="url" label="地址" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editResource(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteResource(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="showCreateDialog" :title="editMode ? '编辑资源' : '新建资源'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="资源名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="form.type" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.url" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveResource">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminResourceList, createAdminResource, updateAdminResource, deleteAdminResource } from '@/api/resource'
import type { CommonResult } from '@/types/common'

const resourceList = ref<any[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const editMode = ref(false)
const form = reactive({ id: null, name: '', type: '', url: '', description: '' })
const searchKeyword = ref('')

const loadData = async () => {
  loading.value = true
  try {
    const res: CommonResult = await getAdminResourceList({ keyword: searchKeyword.value })
    if (res && res.code === 200) {
      resourceList.value = res.data.records || res.data.list || res.data || []
    }
  } finally {
    loading.value = false
  }
}

const editResource = (row: any) => {
  Object.assign(form, row)
  editMode.value = true
  showCreateDialog.value = true
}

const saveResource = async () => {
  try {
    if (editMode.value) {
      await updateAdminResource(form)
      ElMessage.success('编辑成功')
    } else {
      await createAdminResource(form)
      ElMessage.success('新建成功')
    }
    showCreateDialog.value = false
    editMode.value = false
    loadData()
  } catch {
    ElMessage.error('保存失败')
  }
}

const deleteResource = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该资源吗？', '提示', { type: 'warning' })
    await deleteAdminResource(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {}
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.resource-manage {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
</style> 