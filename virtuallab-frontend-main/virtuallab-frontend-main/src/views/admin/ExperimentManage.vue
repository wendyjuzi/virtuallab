<template>
  <div class="experiment-manage-bg">
    <div class="frosted-wrapper">
      <div class="toolbar">
        <span class="gradient-title">实验项目管理</span>
        <el-button type="primary" @click="showCreateDialog = true">新建实验项目</el-button>
        <el-input v-model="searchKeyword" placeholder="搜索实验名称..." style="width: 200px; margin-left: 16px" @input="loadData" clearable />
      </div>
      <el-table :data="experimentList" v-loading="loading" style="margin-top: 16px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="实验名称" />
        <el-table-column prop="category" label="分类" />
        <el-table-column prop="level" label="难度" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="editExperiment(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteExperiment(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 新建/编辑弹窗 -->
      <el-dialog v-model="showCreateDialog" :title="editMode ? '编辑实验' : '新建实验'" width="500px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="实验名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="分类">
            <el-input v-model="form.category" />
          </el-form-item>
          <el-form-item label="难度">
            <el-input v-model="form.level" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="saveExperiment">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminExperimentList, createAdminExperiment, updateAdminExperiment, deleteAdminExperiment } from '@/api/experiment'
import type { CommonResult } from '@/types/common'
import { useRouter } from 'vue-router'
import PhysicsInclinedCollision from '@/components/PhysicsInclinedCollision.vue'
import PhysicsSpringCollision from '@/components/PhysicsSpringCollision.vue'
import PhysicsRigidRotation from '@/components/PhysicsRigidRotation.vue'
import PhysicsCircuitMagnetic from '@/components/PhysicsCircuitMagnetic.vue'

const experimentList = ref<any[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const editMode = ref(false)
const form = reactive({ id: null, name: '', category: '', level: '' })
const searchKeyword = ref('')
const router = useRouter()

const loadData = async () => {
  loading.value = true
  try {
    const res: CommonResult = await getAdminExperimentList({ keyword: searchKeyword.value })
    if (res && res.code === 200) {
      experimentList.value = res.data.records || res.data.list || res.data || []
    }
  } finally {
    loading.value = false
  }
}

const editExperiment = (row: any) => {
  Object.assign(form, row)
  editMode.value = true
  showCreateDialog.value = true
}

const saveExperiment = async () => {
  try {
    if (editMode.value) {
      await updateAdminExperiment(form)
      ElMessage.success('编辑成功')
    } else {
      await createAdminExperiment(form)
      ElMessage.success('新建成功')
    }
    showCreateDialog.value = false
    editMode.value = false
    loadData()
  } catch {
    ElMessage.error('保存失败')
  }
}

const deleteExperiment = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该实验项目吗？', '提示', { type: 'warning' })
    await deleteAdminExperiment(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {}
}

const goToPhysicsDesign = (row: any) => {
  router.push({
    path: '/teacher/physics-experiment-create',
    query: { id: row.id }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.experiment-manage-bg {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
.frosted-wrapper {
  background: rgba(236, 236, 255, 0.92);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 32px;
  max-width: 1200px;
  width: 96vw;
  margin: 40px auto 0 auto;
  padding: 36px 32px 32px 32px;
  backdrop-filter: blur(12px);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gradient-title {
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
  margin-right: 32px;
}
.el-table {
  border-radius: 20px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.96);
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
.el-dialog {
  border-radius: 18px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(8px);
}
.el-dialog__header {
  font-size: 20px;
  font-weight: 800;
  color: #7C3AED;
  letter-spacing: 1px;
}
.el-dialog__footer .el-button[type="primary"] {
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px #a18fff44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-dialog__footer .el-button[type="primary"]:hover {
  background: linear-gradient(90deg, #a18fff 0%, #7C3AED 100%);
  box-shadow: 0 6px 24px #7c3aed55;
  transform: scale(1.04);
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
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  width: 100%;
}
@media (max-width: 900px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  .gradient-title {
    font-size: 20px;
    margin-right: 12px;
  }
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 