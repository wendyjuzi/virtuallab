<template>
  <div class="department-management-bg">
    <div class="frosted-wrapper">
      <h2>院系管理</h2>
      <el-form inline @submit.prevent class="frosted-form">
        <el-form-item label="院系名称">
          <el-input v-model="newDept" placeholder="请输入院系名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addDepartment">添加院系</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="departments" style="margin-top: 24px;" class="frosted-table">
        <el-table-column prop="name" label="院系名称" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeDepartment(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 编辑对话框 -->
      <el-dialog v-model="editDialogVisible" title="编辑院系" width="400px">
        <el-form @submit.prevent>
          <el-form-item label="院系名称">
            <el-input v-model="editDeptName" placeholder="请输入院系名称" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
const newDept = ref('')
const departments = ref<{id:number,name:string}[]>([])

const editDialogVisible = ref(false)
const editDeptId = ref<number|null>(null)
const editDeptName = ref('')

const fetchDepartments = async () => {
  const res = await axios.get('/system-admin/departments')
  if(res.data && res.data.code === 200) {
    departments.value = res.data.data || []
  }
}
const addDepartment = async () => {
  if (!newDept.value) return ElMessage.warning('请输入院系名称')
  const res = await axios.post('/system-admin/departments', { name: newDept.value })
  if(res.data && res.data.code === 200) {
    ElMessage.success('添加成功')
    newDept.value = ''
    fetchDepartments()
  } else {
    ElMessage.error(res.data?.message || '添加失败')
  }
}
const openEditDialog = (row: {id:number, name:string}) => {
  editDeptId.value = row.id
  editDeptName.value = row.name
  editDialogVisible.value = true
}
const submitEdit = async () => {
  if (!editDeptName.value) return ElMessage.warning('请输入院系名称')
  const res = await axios.put('/system-admin/departments', { id: editDeptId.value, name: editDeptName.value })
  if(res.data && res.data.code === 200) {
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    fetchDepartments()
  } else {
    ElMessage.error(res.data?.message || '修改失败')
  }
}
const removeDepartment = async (row: {id:number}) => {
  const res = await axios.delete(`/system-admin/departments/${row.id}`)
  if(res.data && res.data.code === 200) {
    ElMessage.success('删除成功')
    fetchDepartments()
  } else {
    ElMessage.error(res.data?.message || '删除失败')
  }
}
onMounted(() => {
  fetchDepartments()
})
</script>

<style scoped>
.department-management-bg {
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
  max-width: 1100px;
  width: 99vw;
  margin: 72px auto 0 auto;
  padding: 64px 56px 56px 56px;
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
.frosted-form {
  background: rgba(255,255,255,0.88);
  border-radius: 18px;
  box-shadow: 0 4px 16px #a18fff22, 0 2px 8px #7c3aed11;
  padding: 18px 18px 6px 18px;
  margin-bottom: 12px;
  backdrop-filter: blur(8px);
}
.el-form-item {
  margin-bottom: 0;
}
.el-input {
  border-radius: 12px;
  background: #f8f8ff;
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
.frosted-table {
  border-radius: 16px;
  overflow: hidden;
  background: transparent;
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
/* 对话框美化 */
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
.el-dialog__body .el-input {
  border-radius: 10px;
  background: #f8f8ff;
}
@media (max-width: 900px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  .frosted-form, .frosted-table {
    border-radius: 0;
    box-shadow: none;
    padding: 8px 0 8px 0;
  }
  h2 {
    font-size: 20px;
  }
}
</style> 