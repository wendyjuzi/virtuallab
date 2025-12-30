<template>
  <div class="user-management-container">
    <div class="page-header" style="position:relative;">
      <el-button class="back-btn" @click="$router.back()" type="default" style="position:absolute;left:24px;top:24px;z-index:2;font-size:16px;padding: 6px 18px 6px 32px;border-radius:20px;box-shadow:0 2px 8px rgba(124,58,237,0.08);color:#7c3aed;border:1.5px solid #ede9fe;background:linear-gradient(90deg,#f5f3ff 60%,#ede9fe 100%);">
        <i class="el-icon-arrow-left" style="margin-right:6px;"></i>返回
      </el-button>
      <h1>用户管理</h1>
      <p>管理院系中的所有用户信息</p>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <div class="search-bar">
        <el-input
          v-model="searchForm.username"
          placeholder="搜索用户名"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.realName"
          placeholder="搜索真实姓名"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
          <el-option label="锁定" :value="2" />
        </el-select>
        <el-button type="primary" @click="handleSearch" :loading="loading">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="success" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
        <el-button type="warning" @click="handleBatchOperation" :disabled="selectedUsers.length === 0">
          <el-icon><Operation /></el-icon>
          批量操作
        </el-button>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="list-card">
      <el-table
        :data="userList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="studentId" label="学号/工号" width="120" />
        <el-table-column prop="department" label="院系" width="150" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">

            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="resetForm"
    >
      <el-form
        :model="userForm"
        :rules="userRules"
        ref="userFormRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号/工号" prop="studentId">
              <el-input v-model="userForm.studentId" placeholder="请输入学号或工号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户类型" prop="userType">
              <el-select v-model="userForm.userType" placeholder="请选择用户类型" style="width: 100%">
                <el-option label="系统管理员" value="ADMIN" />
                <el-option label="院系管理员" value="DEPARTMENT_ADMIN" />
                <el-option label="教师" value="TEACHER" />
                <el-option label="学生" value="STUDENT" />

              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="院系" prop="department">
              <el-input
                  :model-value="userStore.user?.department"
                  placeholder="院系"
                  disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input v-model="userForm.major" placeholder="请输入专业" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
            <el-radio :value="2">锁定</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量操作" width="400px">
      <el-form>
        <el-form-item label="操作类型">
          <el-select v-model="batchOperation.type" placeholder="请选择操作类型" style="width: 100%">
            <el-option label="批量启用" value="enable" />
            <el-option label="批量禁用" value="disable" />
            <el-option label="批量删除" value="delete" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作原因" v-if="batchOperation.type === 'disable'">
          <el-input v-model="batchOperation.reason" type="textarea" placeholder="请输入禁用原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Operation } from '@element-plus/icons-vue'
import {
  createUser,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
  getUserRoles
} from '@/api/request'
import { getDepartmentUserList } from '@/api/departmentAdmin' // 新增导入
import { useUserStore } from "@/store/user"

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const batchDialogVisible = ref(false)
const userFormRef = ref()
const isEdit = ref(false)
const selectedUsers = ref<any[]>([])
const userStore = useUserStore() // 获取用户store

// 搜索表单
const searchForm = reactive({
  username: '',      // 用户名
  realName: '',     // 真实姓名
  userType: '',     // 用户类型
  status: null      // 状态
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 用户列表
const userList = ref<any[]>([])

// 用户表单
const userForm = reactive({
  id: null as number | null,
  username: '',
  realName: '',
  email: '',
  phone: '',
  studentId: '',
  department: '',
  major: '',
  userType: '',
  password: '',
  status: 1
})

// 批量操作
const batchOperation = reactive({
  type: '',
  reason: ''
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3位', trigger: 'blur' },
    { max: 20, message: '用户名长度不能超过20位', trigger: 'blur' }
  ],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  studentId: [{ required: true, message: '请输入学号或工号', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户')

// 方法
const getUserTypeLabel = (roleCode: string) => {
  const typeNames: Record<string, string> = {
    'admin': '系统管理员',
    'department_admin': '院系管理员',
    'teacher': '教师',
    'student': '学生',
    'guest': '访客'
  }
  return typeNames[roleCode] || roleCode
}

const getUserTypeTag = (roleCode: string) => {
  const typeTags: Record<string, string> = {
    'admin': 'danger',
    'department_admin': 'warning',
    'teacher': 'primary',
    'student': 'success',
    'guest': 'info'
  }
  return typeTags[roleCode] || 'info'
}

const getStatusLabel = (status: number) => {
  const statusNames: Record<number, string> = {
    0: '禁用',
    1: '正常',
    2: '锁定'
  }
  return statusNames[status] || '未知'
}

const getStatusTag = (status: number) => {
  const statusTags: Record<number, string> = {
    0: 'danger',
    1: 'success',
    2: 'warning'
  }
  return statusTags[status] || 'info'
}

// 获取用户列表 - 修改为调用部门管理员API
const fetchUserList = async () => {
  loading.value = true
  try {
    // 从userStore获取当前登录的管理员信息
    const adminUserId = userStore.user?.id
    if (!adminUserId) {
      ElMessage.error('无法获取管理员信息')
      return
    }
    // 将 status 从 null 转换为 undefined
    const status = searchForm.status === null ? undefined : searchForm.status

    const params = {
      username: searchForm.username || '',
      realName: searchForm.realName || '',
      userType: searchForm.userType || '',
      status,
      adminUserId, // 传递当前管理员ID
      page: pagination.current,
      size: pagination.size
    }

    const res: any = await getDepartmentUserList(
        params.username,
        params.realName,
        params.userType,
        params.status,
        params.adminUserId,
        params.page,
        params.size
    )

    if (res.code === 200) {
      userList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    username: '',
    realName: '',
    userType: '',
    status: null
  })
  pagination.current = 1
  fetchUserList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchUserList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchUserList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

// 新增用户
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑用户
const handleEdit = (row: any) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(userForm, row)
}

// 删除用户
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res: any = await deleteUser(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchUserList()
    } else {
      ElMessage.error(res?.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '删除失败')
    }
  }
}

// 切换用户状态
const handleToggleStatus = async (row: any) => {
  try {
    let res: any
    if (row.status === 1) {
      // 禁用用户
      const reason = await ElMessageBox.prompt('请输入禁用原因', '禁用用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '禁用原因不能为空'
      })
      res = await disableUser(row.id, reason.value)
    } else {
      // 启用用户
      res = await enableUser(row.id)
    }
    
    if (res.code === 200) {
      ElMessage.success(row.status === 1 ? '禁用成功' : '启用成功')
      fetchUserList()
    } else {
      ElMessage.error(res?.message || '操作失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

// 批量操作
const handleBatchOperation = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要操作的用户')
    return
  }
  batchDialogVisible.value = true
}

const handleBatchSubmit = async () => {
  if (!batchOperation.type) {
    ElMessage.warning('请选择操作类型')
    return
  }
  
  try {
    submitting.value = true
    const userIds = selectedUsers.value.map(user => user.id)
    
    if (batchOperation.type === 'delete') {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
        '确认批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      // 批量删除
      for (const id of userIds) {
        await deleteUser(id)
      }
      ElMessage.success('批量删除成功')
    } else if (batchOperation.type === 'enable') {
      // 批量启用
      for (const id of userIds) {
        await enableUser(id)
      }
      ElMessage.success('批量启用成功')
    } else if (batchOperation.type === 'disable') {
      if (!batchOperation.reason) {
        ElMessage.warning('请输入禁用原因')
        return
      }
      // 批量禁用
      for (const id of userIds) {
        await disableUser(id, batchOperation.reason)
      }
      ElMessage.success('批量禁用成功')
    }
    
    batchDialogVisible.value = false
    fetchUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '批量操作失败')
    }
  } finally {
    submitting.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await userFormRef.value.validate()
    submitting.value = true

    // 自动设置院系和专业（从当前管理员信息中获取）
    const userFormWithDepartment = {
      ...userForm,
      department: userStore.user?.department || '',
    }

    let res: any
    if (isEdit.value) {
      res = await updateUser(userFormWithDepartment)
    } else {
      res = await createUser(userFormWithDepartment)
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      fetchUserList()
    } else {
      ElMessage.error(res?.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(userForm, {
    id: null,
    username: '',
    realName: '',
    email: '',
    phone: '',
    studentId: '',
    department: '',
    major: '',
    userType: '',
    password: '',
    status: 1
  })
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 生命周期
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management-container {
  padding: 32px;
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  min-height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -26px;
  margin-left: -23px;
  margin-right: -23px;
  margin-bottom: -26px;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
  width: 100%;
  padding: 16px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(216, 180, 254, 0.2);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.1);
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #7c3aed;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.page-header p {
  font-size: 16px;
  color: #a78bfa;
  margin: 0;
}

.list-card {
  max-width: 1200px;
  width: 100%;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.1);
  border-radius: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(216, 180, 254, 0.2);
}

.el-table {
  font-size: 14px;
  border-radius: 12px;
  overflow: hidden;
  color: #4a4a4a;
}

.el-table th {
  background: linear-gradient(135deg, #ede9fe, #f5f3ff);
  color: #7c3aed;
  font-weight: 600;
  border-color: rgba(168, 85, 247, 0.1);
}

.el-table td {
  border-color: rgba(168, 85, 247, 0.08);
}

.el-table .el-tag {
  margin-right: 2px;
  margin-bottom: 2px;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

.search-card {
  margin-bottom: 24px;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(124,58,237,0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(216, 180, 254, 0.2);
  padding: 24px;
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  padding: 12px 0;
}

.search-bar .el-input,
.search-bar .el-select {
  --el-input-border-color: rgba(168, 85, 247, 0.2);
  --el-input-hover-border-color: #a78bfa;
  --el-input-focus-border-color: #7c3aed;
  --el-input-text-color: #4a4a4a;
  --el-input-placeholder-color: #a78bfa;
  border-radius: 8px;
}

.search-bar .el-input__inner::placeholder {
  color: #a78bfa;
  opacity: 0.7;
}

.search-bar .el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-bar .el-button.el-button--primary {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  border: none;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
  color: white;
}

.search-bar .el-button.el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.3);
  background: linear-gradient(135deg, #9333ea, #c084fc);
}

.search-bar .el-button.el-button--success {
  background: linear-gradient(135deg, #22c55e, #84cc16);
  border: none;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  color: white;
}

.search-bar .el-button.el-button--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, #16a34a, #65a30d);
}

.search-bar .el-button.el-button--warning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border: none;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  color: white;
}

.search-bar .el-button.el-button--warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, #d97706, #facc15);
}

.search-bar .el-button:not(.el-button--primary):not(.el-button--success):not(.el-button--warning) {
  background: #f0f2f5;
  color: #6d28d9;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.search-bar .el-button:not(.el-button--primary):not(.el-button--success):not(.el-button--warning):hover {
  background: #e7e9ec;
  color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
}

.el-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.el-dialog__header {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: white;
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 600;
}

.el-dialog__title {
  color: white;
}

.el-dialog__footer .el-button {
  border-radius: 8px;
  font-weight: 500;
}

.el-dialog__footer .el-button--primary {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  border: none;
  color: white;
}

.el-dialog__footer .el-button--primary:hover {
  background: linear-gradient(135deg, #9333ea, #c084fc);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

/* 媒体查询 */
@media (max-width: 1300px) {
  .list-card, .search-card {
    max-width: 100%;
    min-width: 0;
    margin-left: 24px;
    margin-right: 24px;
  }
}

@media (max-width: 900px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-bar .el-input,
  .search-bar .el-select {
    width: 100% !important;
  }
  .search-bar .el-button {
    width: 100%;
  }
  .list-card {
    padding: 16px;
  }
  .el-table {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .user-management-container {
    padding: 16px;
  }
  .page-header h1 {
    font-size: 24px;
  }
  .page-header p {
    font-size: 14px;
  }
  .list-card, .search-card {
    padding: 16px;
    border-radius: 12px;
  }
  .el-table {
    font-size: 12px;
  }
  .pagination-container {
    padding: 12px 0;
  }
}

/* 表格横向滚动（小屏） */
.el-card__body {
  overflow-x: auto;
}
</style>