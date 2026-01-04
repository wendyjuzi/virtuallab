<template>
  <div class="user-management-container">
    <div class="frosted-wrapper">
      <div class="page-header">
        <h1>用户管理</h1>
        <p>管理系统中的所有用户信息</p>
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
          <el-input
            v-model="searchForm.department"
            placeholder="搜索院系"
            style="width: 300px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="searchForm.userType" placeholder="选择用户类型" clearable style="width: 150px">
            <el-option label="系统管理员" value="ADMIN" />
            <el-option label="院系管理员" value="DEPARTMENT_ADMIN" />
            <el-option label="教师" value="TEACHER" />
            <el-option label="学生" value="STUDENT" />
          </el-select>
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
          <el-table-column label="用户类型" width="180">
            <template #default="{ row }">
              <el-tag
                v-for="role in row.roleList"
                :key="role.id"
                :type="getUserTypeTag(role.code)"
                size="small"
                style="margin-right: 4px"
              >
                {{ getUserTypeLabel(role.code) }}
              </el-tag>
            </template>
          </el-table-column>
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
                <el-input v-model="userForm.department" placeholder="请输入院系" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Operation } from '@element-plus/icons-vue'
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
  getUserRoles
} from '@/api/request'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const batchDialogVisible = ref(false)
const userFormRef = ref()
const isEdit = ref(false)
const selectedUsers = ref<any[]>([])

// 搜索表单
const searchForm = reactive({
  username: '',      // 用户名
  realName: '',     // 真实姓名
  department: '',   // 院系
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
  department: [{ required: true, message: '请输入院系', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
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

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const params = {
      username: searchForm.username || '',
      realName: searchForm.realName || '',
      department: searchForm.department || '',
      userType: searchForm.userType || '',
      status: searchForm.status,
      page: pagination.current,
      size: pagination.size
    }
    const res: any = await getUserList(params)
    // 处理不同的响应格式
    if (res) {
      // 如果 res 有 code 属性，说明是 CommonResult 格式
      if (res.code === 200 && res.data) {
        const data = res.data
        userList.value = data.list || data.records || []
        pagination.total = data.total || 0
      } 
      // 如果 res 直接是 data 格式
      else if (res.list || res.records) {
        userList.value = res.list || res.records || []
        pagination.total = res.total || 0
      }
      // 如果 res.data 存在但不是 CommonResult 格式
      else if (res.data) {
        const data = res.data
        userList.value = data.list || data.records || []
        pagination.total = data.total || 0
      }
      else {
        ElMessage.warning('获取用户列表失败：响应格式异常')
        userList.value = []
        pagination.total = 0
      }
    } else {
      ElMessage.warning('获取用户列表失败，请稍后重试')
      userList.value = []
      pagination.total = 0
    }
  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '获取用户列表失败'
    ElMessage.error(errorMsg)
    userList.value = []
    pagination.total = 0
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
    department: '',
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
    let res: any
    if (isEdit.value) {
      res = await updateUser(userForm)
    } else {
      res = await createUser(userForm)
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
onMounted(async () => {
  try {
    await fetchUserList()
  } catch (error) {
    // fetchUserList 内部已经有错误处理，这里只是防止未捕获的 Promise
    console.error('初始化用户列表加载失败:', error)
  }
})
</script>

<style scoped>
.user-management-container {
  padding: 0;
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  margin-top:-22px;
  
  margin-right:-22px;
}

.frosted-wrapper {
  background: rgba(236, 236, 255, 0.82);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 32px;
  max-width: 1300px;
  width: 96vw;
  margin: 40px auto 0 auto;
  padding: 36px 32px 32px 32px;
  backdrop-filter: blur(12px);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
  width: 100%;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
}

.page-header p {
  font-size: 16px;
  color: #7C3AED;
  margin: 0;
  font-weight: 500;
}

.list-card {
  max-width: 1200px;
  width: 100%;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  border-radius: 20px;
  padding: 18px 16px 10px 16px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(8px);
}

.el-table {
  font-size: 14px;
  border-radius: 14px;
  overflow: hidden;
  background: transparent;
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

.el-table .el-tag {
  margin-right: 2px;
  margin-bottom: 2px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  background: linear-gradient(90deg, #a18fff 0%, #7C3AED 100%);
  color: #fff;
  border: none;
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
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  border-radius: 20px;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(8px);
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  padding: 12px 0;
  .el-input, .el-select {
    border-radius: 12px;
    box-shadow: 0 2px 8px #a18fff22;
    background: #f8f8ff;
  }
  .el-input__prefix, .el-icon {
    color: #7C3AED;
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
  .el-button[type="warning"] {
    background: linear-gradient(90deg, #fbbf24 0%, #f59e42 100%);
    color: #fff;
    border-radius: 14px;
    font-weight: 700;
    box-shadow: 0 2px 8px #fbbf2444;
    transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  }
  .el-button[type="warning"]:hover {
    background: linear-gradient(90deg, #f59e42 0%, #fbbf24 100%);
    box-shadow: 0 6px 24px #fbbf2455;
    transform: scale(1.04);
  }
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
.el-dialog__body .el-input, .el-dialog__body .el-select {
  border-radius: 10px;
  background: #f8f8ff;
}

@media (max-width: 1400px) {
  .frosted-wrapper {
    max-width: 100vw;
    padding: 24px 4vw 24px 4vw;
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
    padding: 4px;
  }
  .el-table {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .list-card, .search-card {
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .el-table {
    font-size: 12px;
  }
  .pagination-container {
    padding: 8px 0;
  }
  .page-header h1 {
    font-size: 20px;
  }
}

/* 表格横向滚动（小屏） */
.el-card__body {
  overflow-x: auto;
}
</style>