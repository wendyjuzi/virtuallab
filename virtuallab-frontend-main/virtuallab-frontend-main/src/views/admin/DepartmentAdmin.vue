<template>
  <div class="department-admin-new">
    <div class="header-glass">
      <h1>院系管理员控制台</h1>
      <div class="user-info">
        <span>欢迎，{{ userStore.userName }}</span>
        <span class="role">{{ getRoleName(userStore.userRole) }}</span>
        <span class="department">院系：{{ userStore.userDepartment }}</span>
      </div>
    </div>
    <div class="dashboard-grid">
      <!-- 左侧 -->
      <div class="left-panel">
        <div class="left-top">
          <div class="stats-grid">
            <div class="stat-card" @click="navigateTo('/department/users')">
              <h3>本院系用户</h3>
              <div class="stat-number">{{ stats.departmentUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
            <div class="stat-card" @click="navigateTo('/department/project-audit')">
              <h3>本院系项目</h3>
              <div class="stat-number">{{ stats.departmentProjects }}</div>
              <div class="stat-label">进行中项目</div>
            </div>
            <div class="stat-card" @click="navigateTo('/department/users?userType=TEACHER')">
              <h3>本院系教师</h3>
              <div class="stat-number">{{ stats.departmentTeachers }}</div>
              <div class="stat-label">教师数量</div>
            </div>
            <div class="stat-card" @click="navigateTo('/department/users?userType=STUDENT')">
              <h3>本院系学生</h3>
              <div class="stat-number">{{ stats.departmentStudents }}</div>
              <div class="stat-label">学生数量</div>
            </div>
          </div>
        </div>
        <div class="left-bottom">
          <div class="management-section">
            <h2>DEPARTMENT<br>MANAGEMENT</h2>
            <div class="management-grid">
              <div class="management-card" @click="navigateTo('/department/users')">
                <div class="card-icon">👥</div>
                <h3>用户管理</h3>
                <p>管理本院系用户信息</p>
              </div>
              <div class="management-card" @click="navigateTo('/department/project-audit')">
                <div class="card-icon">📋</div>
                <h3>项目审核</h3>
                <p>审核本院系实验项目</p>
              </div>
              <div class="management-card" @click="navigateTo('/department/reports')">
                <div class="card-icon">📊</div>
                <h3>统计报告</h3>
                <p>查看本院系统计数据</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧 -->
      <div class="right-panel">
        <div class="right-top">
          <div class="recent-activities">
            <h2><span>LATEST</span><span>NEWS</span></h2>
            <div class="activity-list">
              <div
                  class="activity-item"
                  v-for="notification in notifications"
                  :key="notification.id"
                  :class="{ 'unread': !notification.isRead }"
              >
                <div class="activity-icon">{{ getNotificationIcon(notification.type) }}</div>
                <div class="activity-content">
                  <div class="activity-title">{{ notification.title }}</div>
                  <div class="activity-message">{{ notification.content }}</div>
                  <div class="activity-time">{{ formatNotificationTime(notification.createdAt) }}</div>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="empty-notifications">
                暂无通知
              </div>
            </div>
          </div>
        </div>
        <div class="right-bottom">
          <div class="quick-actions">
            <h2>快捷操作</h2>
            <div class="action-buttons">
              <button class="action-btn primary" @click="addUser">添加用户</button>
              <button class="action-btn" @click="createProject">创建项目</button>
              <button class="action-btn" @click="navigateTo('/department/reports')">生成报告</button>
              <button class="action-btn" @click="refreshData">刷新数据</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 用户信息对话框 -->
    <el-dialog
        v-model="showUserDialog"
        :title="isEditUser ? '编辑用户' : '新增用户'"
        width="700px"
        @close="resetUserForm"
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
              <el-input
                  v-model="userForm.username"
                  placeholder="请输入用户名"
                  :disabled="isEditUser"
              />
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
              <el-select
                  v-model="userForm.userType"
                  placeholder="请选择用户类型"
                  style="width: 100%"
              >
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
                  v-model="userForm.department"
                  :disabled="lockDepartment"
                  placeholder="请输入院系"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input v-model="userForm.major" placeholder="请输入专业" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
            label="密码"
            prop="password"
            v-if="!isEditUser"
        >
          <el-input
              v-model="userForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUserDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="handleCreateUser"
            :loading="submitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
// import UserFormDialog from '@/components/UserFormDialog.vue'
import { getDepartmentUserStats } from '@/api/request' // 导入新添加的API方法
import { createDepartmentUser } from '@/api/departmentAdmin'
import {ElMessage} from "element-plus"
import type { FormInstance, FormRules } from 'element-plus'
import {reactive} from "vue"
import {
  getDepartmentTeacherCount,
  getDepartmentStudentCount,
  getDepartmentProjectCount
} from '@/api/request'
// 添加通知相关的导入
import { getAllNotifications } from '@/api/notification'
import type { Notification } from '@/store/types'

const router = useRouter()
const userStore = useUserStore()
const showUserDialog = ref(false)
const isEditUser = ref(false)
const lockDepartment = ref(true)
const submitting = ref(false)
const userFormRef = ref<FormInstance>()
// 用户表单数据
const userForm = reactive({
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
// 表单验证规则
const userRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3位', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  studentId: [
    { required: true, message: '请输入学号或工号', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入院系', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
})

// 重置用户表单
const resetUserForm = () => {
  Object.assign(userForm, {
    username: '',
    realName: '',
    email: '',
    phone: '',
    studentId: '',
    major: '',
    userType: '',
    password: '',
    status: 1
  })

  // 设置院系为当前用户的院系
  userForm.department = userStore.userDepartment || ''

  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 处理用户创建
const handleCreateUser = async () => {
  try {
    // 验证表单
    const valid = await userFormRef.value?.validate()
    if (!valid) return

    submitting.value = true

    const adminUserId = userStore.user?.id
    if (!adminUserId) {
      ElMessage.error('无法获取管理员信息')
      return
    }

    // 添加院系信息，并映射用户类型
    const payload = {
      username: userForm.username,
      realName: userForm.realName,
      email: userForm.email,
      phone: userForm.phone,
      studentId: userForm.studentId,
      department: userStore.userDepartment,
      major: userForm.major,
      userType: userForm.userType, // TEACHER 或 STUDENT
      password: userForm.password,
      status: userForm.status
    }

    // 调用院系管理员API创建用户
    const res: any = await createDepartmentUser(payload, adminUserId)
    if (res.code === 200) {
      ElMessage.success('用户创建成功')
      showUserDialog.value = false
      // 刷新统计数据
      await fetchDepartmentStats()
    } else {
      ElMessage.error(res?.message || '创建失败')
    }
  } catch (error: any) {
    console.error('创建用户失败:', error)
    ElMessage.error(error?.message || '创建用户失败')
  } finally {
    submitting.value = false
  }
}

// 添加用户按钮点击事件
const addUser = () => {
  resetUserForm()
  isEditUser.value = false
  showUserDialog.value = true
}
const stats = ref({
  departmentUsers: 0, // 初始化为0，等待API返回
  departmentProjects: 0,
  departmentTeachers: 0,
  departmentStudents: 0
})

// 获取院系用户统计数据
const fetchDepartmentStats = async () => {
  try {
    const res = await getDepartmentUserStats(userStore.user?.id || 0)
    // 添加空值检查
    if (res && res.data) {
      stats.value.departmentUsers = res.data.total || 0
    } else {
      stats.value.departmentUsers = 0
    }

    // 获取教师数量
    const teacherRes = await getDepartmentTeacherCount(userStore.user?.id || 0)
    stats.value.departmentTeachers = (teacherRes?.data) || 0

    // 获取学生数量
    const studentRes = await getDepartmentStudentCount(userStore.user?.id || 0)
    stats.value.departmentStudents = (studentRes?.data) || 0

    // 获取本院系项目数量
    const projectRes = await getDepartmentProjectCount(userStore.user?.id || 0)
    if (projectRes && projectRes.data) {
      stats.value.departmentProjects = projectRes.data.count || 0
    } else {
      stats.value.departmentProjects = 0
    }
  } catch (error) {
    console.error('获取院系用户统计失败:', error)
    // 设置默认值
    stats.value.departmentUsers = 0
    stats.value.departmentTeachers = 0
    stats.value.departmentStudents = 0
    stats.value.departmentProjects = 0
  }
}

const notifications = ref<Notification[]>([]) // 存储通知数据
// 获取最新通知
const fetchNotifications = async () => {
  try {
    const userId = userStore.user?.id || 0
    const res = await getAllNotifications(userId)
    // 添加空值检查，确保 res.data 是数组
    if (res && res.data && Array.isArray(res.data)) {
      // 按创建时间降序排序并取前3条
      notifications.value = res.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
    } else {
      notifications.value = []
    }
  } catch (error) {
    console.error('获取通知失败:', error)
    notifications.value = []
  }
}
// 获取通知图标
const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    audit: '📋',
    publish: '🚀',
    system: '🔔',
    warning: '⚠️'
  }
  return icons[type] || '🔔'
}

// 格式化通知时间
const formatNotificationTime = (time: string) => {
  if (!time) return '未知时间'
  try {
    const date = new Date(time)
    return isNaN(date.getTime())
        ? '无效日期'
        : date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
  } catch (e) {
    console.error('日期格式化错误:', e)
    return '无效日期'
  }
}
const getRoleName = (role: string) => {
  const roleNames = {
    admin: '系统管理员',
    department_admin: '院系管理员',
    teacher: '教师',
    student: '学生',
    guest: '访客'
  }
  return roleNames[role as keyof typeof roleNames] || role
}

const navigateTo = (path: string) => {
  router.push(path)
}

const createProject = () => {
  router.push('/experiment/create')
}

// 添加刷新功能
const refreshData = async () => {
  try {
    await fetchDepartmentStats()
    await fetchNotifications()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败，请稍后重试')
  }
}

const generateReport = () => {
  console.log('生成报告')
}

const manageResources = () => {
  console.log('资源管理')
}

onMounted(async () => {  // 添加 async 关键字
  if (userStore.userRole !== 'DEPARTMENT_ADMIN') {
    router.push('/unauthorized')
    return
  }

  // 组件挂载时获取统计数据
  await fetchDepartmentStats()
  await fetchNotifications() // 加载通知数据
})
</script>

<style scoped>
.header-glass {
  width: calc(100% - 64px);
  max-width: 1400px;
  margin: 0px auto 32px auto;
  padding: 20px 32px 20px 32px;
  border-radius: 20px;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 4px 24px rgba(168, 85, 247, 0.10);
  border: 1.5px solid rgba(168, 85, 247, 0.18);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
}
.header-glass h1 {
  color: #7c3aed;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 2px;
  margin: 0;
  text-shadow: 0 2px 8px rgba(168, 85, 247, 0.08);
}
.header-glass .user-info {
  text-align: right;
  color: #6b7280;
}
.header-glass .user-info span {
  color: #7c3aed;
  font-size: 15px;
  margin-bottom: 2px;
  display: block;
}
.header-glass .role {
  color: #a78bfa !important;
  font-weight: bold;
}
.header-glass .department {
  color: #6d28d9 !important;
  font-size: 14px;
}
@media (max-width: 900px) {
  .header-glass {
    width: 100%;
    max-width: 100%;
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 12px 14px 12px;
  }
  .header-glass .user-info {
    text-align: left;
    margin-top: 10px;
  }
}
.department-admin-new {
  min-height: 100vh;
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  padding: 0 0 32px 0;
  margin-top:-26px;
  margin-bottom:-26px;
  margin-left:-23px;
  margin-right:-23px;

}
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 80vh;
}
.left-top {
  flex: 1 1 0;
  background: linear-gradient(135deg, #f5f3ff 80%, #ede9fe 100%);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.06);
  padding: 32px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.left-bottom {
  flex: 1 1 0;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.06);
  padding: 32px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  justify-content: flex-start;
}
.stat-card {
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(124,58,237,0.08);
  padding: 28px 20px;
  min-width: 140px;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.stat-card:hover {
  transform: translateY(-6px) scale(1.04);
  box-shadow: 0 8px 32px rgba(124,58,237,0.12);
}
.stat-title {
  color: #a78bfa;
  font-size: 16px;
  margin-bottom: 8px;
}
.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #7c3aed;
}
.stat-label {
  font-size: 14px;
  color: #a78bfa;
  margin-left: 2px;
}
.management-section h2 {
  color: #a78bfa;
  margin-bottom: 40px;
  margin-top: -10px;
  font-size: 32px;
  font-weight: 800;
  font-family: 'Montserrat', 'Arial Black', sans-serif;
  letter-spacing: 1.5px;
  text-align: left;
  line-height: 1.4;
  text-transform: uppercase;
}
.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
}
.management-card {
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  padding: 24px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(124,58,237,0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
}
.management-card:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 8px 32px rgba(124,58,237,0.12);
}
.card-icon {
  font-size: 2em;
  margin-bottom: 10px;
}
.management-card h3 {
  margin: 0 0 8px 0;
  color: #7c3aed;
  font-size: 16px;
  font-weight: 600;
}
.management-card p {
  margin: 0;
  color: #6d28d9;
  font-size: 13px;
}
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 80vh;
}
.right-top {
  flex: 3 1 0;
  background: #f9f7fd;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.13);
  padding: 32px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
  position: relative;
  border: 2px solid #e9d5ff;
  background-image:
    repeating-linear-gradient(to bottom, #f9f7fd, #f9f7fd 38px, #ede9fe 40px),
    linear-gradient(120deg, rgba(255,255,255,0.7) 0%, rgba(233,213,255,0.2) 100%);
  overflow: visible;
}
.recent-activities {
  position: relative;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
}
.recent-activities::before, .recent-activities::after {
  content: '';
  position: absolute;
  top: -22px;
  width: 32px;
  height: 32px;
  background: radial-gradient(circle at 60% 40%, #e5e7eb 60%, #b4aee8 100%);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(124,58,237,0.13), 0 1.5px 0 #b4aee8 inset;
  border: 2.5px solid #a78bfa;
  z-index: 2;
  display: block;
}
.recent-activities::before {
  left: 24px;
}
.recent-activities::after {
  left: 74px;
}
.recent-activities .notebook-side {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  background: linear-gradient(to bottom, #a78bfa 60%, #ede9fe 100%);
  border-radius: 8px 0 0 8px;
  box-shadow: 2px 0 8px rgba(124,58,237,0.08);
  z-index: 1;
}
.recent-activities h2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 300%;
  transform: translateY(-50%) rotate(90deg);
  z-index: 3;
  font-family: 'Montserrat', 'Bebas Neue', 'Oswald', 'Arial Black', 'Arial', sans-serif;
  font-size: 58px;
  font-weight: 900;
  letter-spacing: 6px;
  color: #d1c4e9;
  text-shadow: 0 4px 16px rgba(168, 85, 247, 0.13);
  line-height: 1.1;
  background: none;
  padding: 0;
  margin: 0;
  height: auto;
  width: 120px;
  user-select: none;
}
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0 8px 8px 32px;
  position: relative;
  z-index: 2;
}
.activity-item {
  display: flex;
  align-items: center;
  padding: 18px 0 12px 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  border-bottom: 1.5px dashed #e9d5ff;
  position: relative;
  transition: background 0.2s;
}
.activity-item:last-child {
  border-bottom: none;
}
.activity-item:hover {
  background: rgba(168, 139, 250, 0.07);
}
.activity-icon {
  font-size: 1.6em;
  margin-right: 18px;
  color: #a78bfa;
  filter: drop-shadow(0 2px 4px #ede9fe);
}
.activity-content {
  flex: 1;
}
.activity-title {
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 5px;
  font-size: 16px;
  letter-spacing: 0.5px;
}
.activity-time {
  font-size: 12px;
  color: #a78bfa;
}
.unread {
  background: #ede9fe;
  border-left: 3px solid #a78bfa;
}
.activity-message {
  font-size: 13px;
  color: #6d28d9;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.empty-notifications {
  padding: 20px;
  text-align: center;
  color: #a78bfa;
  font-style: italic;
  opacity: 0.8;
}
.right-bottom {
  flex: 1 1 0;
  background: linear-gradient(135deg, #f5f3ff 60%, #ede9fe 100%);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.06);
  padding: 32px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
}
.quick-actions {
  background: linear-gradient(135deg, #f5f3ff 60%, #ede9fe 100%);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(124,58,237,0.08);
  padding: 24px 16px;
  margin-top: 0;
}
.quick-actions h2 {
  color: #7c3aed;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 700;
}
.action-buttons {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}
.action-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(120deg, #a78bfa 0%, #ede9fe 100%);
  color: #7c3aed;
  box-shadow: 0 2px 12px rgba(124,58,237,0.08);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}
.action-btn.primary {
  background: linear-gradient(120deg, #7c3aed 0%, #ede9fe 100%);
  color: #fff;
}
.action-btn:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 8px 32px rgba(124,58,237,0.12);
  background: linear-gradient(120deg, #a78bfa 0%, #ede9fe 100%);
  color: #6d28d9;
}
</style>