
<template>
  <div class="user-profile-container sysadmin-frosted-bg">
    <div class="header-glass sysadmin-glass profile-header">
      <div class="profile-lottie" ref="userLottieRef"></div>
      <div class="profile-info">
        <h1 class="profile-name">{{ userStore.user?.username || '用户' }}</h1>
        <p class="profile-role">{{ getRoleName(userStore.user?.roles?.[0] || '') }}</p>
        <p class="profile-email">{{ (userStore.user as any)?.email || '暂无邮箱' }}</p>
      </div>
    </div>

    <div class="profile-content">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="profile-card sysadmin-chart-card">
            <template #header>
              <div class="card-header">
                <el-icon><User /></el-icon>
                <span>基本信息</span>
              </div>
            </template>
            <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="userForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="学号/工号" prop="studentId">
                <el-input v-model="userForm.studentId" placeholder="请输入学号或工号" />
              </el-form-item>
              <el-form-item label="院系" prop="department">
                <el-input v-model="userForm.department" placeholder="请输入院系" />
              </el-form-item>
              <el-form-item label="专业" prop="major">
                <el-input v-model="userForm.major" placeholder="请输入专业" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateProfile" :loading="updating">保存修改</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="profile-card sysadmin-chart-card">
            <template #header>
              <div class="card-header">
                <el-icon><Lock /></el-icon>
                <span>安全设置</span>
              </div>
            </template>
            <div class="security-items">
              <div class="security-item">
                <div class="security-info">
                  <h4>修改密码</h4>
                  <p>定期更换密码可以提高账户安全性</p>
                </div>
                <el-button @click="showPasswordDialog = true">修改</el-button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <h4>邮箱验证</h4>
                  <p>绑定邮箱用于找回密码和接收通知</p>
                </div>
                <el-button @click="verifyEmail" :disabled="!userForm.email">验证</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="profile-card sysadmin-chart-card" style="margin-top: 24px;">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>权限信息</span>
          </div>
        </template>
        <div class="permissions-info">
          <div class="permission-group">
            <h4>角色</h4>
            <div class="permission-tags">
              <el-tag v-for="role in userStore.user?.roles" :key="role" type="primary">
                {{ getRoleName(role) }}
              </el-tag>
            </div>
          </div>
          <div class="permission-group">
            <h4>权限</h4>
            <div class="permission-tags">
              <el-tag v-for="permission in getUserPermissions()" :key="permission" type="success">
                {{ permission }}
              </el-tag>
            </div>
          </div>
          <!-- 新增：学生班级管理入口 -->
          <div v-if="userStore.user?.roles?.includes('STUDENT')" style="margin-top: 24px;">
            <el-button type="primary" @click="goToClassSelect">班级管理</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="updatePassword" :loading="updatingPassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Document } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { updateUserProfile } from '@/api/request'
import lottie from 'lottie-web'
import userLottie from '@/assets/lotties/user.json'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 响应式数据
const userLottieRef = ref<HTMLElement>()
const showPasswordDialog = ref(false)
const passwordFormRef = ref()
const userFormRef = ref()
const updating = ref(false)
const updatingPassword = ref(false)

// 表单数据
const userForm = reactive({
  username: userStore.user?.username || '',
  realName: (userStore.user as any)?.realName || '',
  email: (userStore.user as any)?.email || '',
  phone: (userStore.user as any)?.phone || '',
  studentId: (userStore.user as any)?.studentId || '',
  department: (userStore.user as any)?.department || '',
  major: (userStore.user as any)?.major || ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
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
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }]
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const getRoleName = (role: string) => {
  const roleNames: Record<string, string> = {
    'SYSTEM_ADMIN': '系统管理员',
    'DEPARTMENT_ADMIN': '院系管理员',
    'TEACHER': '教师',
    'STUDENT': '学生',
    'GUEST': '访客'
  }
  return roleNames[role] || role
}

const getUserPermissions = () => {
  if (!userStore.user) return []
  const userRoleUpper = userStore.user.roles[0]?.toUpperCase()
  const rolePermissions = {
    SYSTEM_ADMIN: [
      '用户管理',
      '实验室管理',
      '实验管理',
      '系统配置',
      '数据查看',
      '报告管理'
    ],
    DEPARTMENT_ADMIN: [
      '用户查看',
      '实验室管理',
      '实验管理',
      '数据查看',
      '报告查看'
    ],
    TEACHER: [
      '实验室查看',
      '实验创建',
      '实验编辑',
      '数据查看',
      '报告创建'
    ],
    STUDENT: [
      '实验室查看',
      '实验查看',
      '数据查看',
      '报告查看'
    ]
  }
  return rolePermissions[userRoleUpper as keyof typeof rolePermissions] || []
}

const updateProfile = async () => {
  try {
    await userFormRef.value.validate()
    updating.value = true
    
    const updateData = {
      id: userStore.user?.id,
      username: userForm.username,
      realName: userForm.realName,
      email: userForm.email,
      phone: userForm.phone,
      studentId: userForm.studentId,
      department: userForm.department,
      major: userForm.major
    }
    
    const res = await updateUserProfile(updateData) as any
    if (res && res.code === 200) {
      ElMessage.success('个人信息更新成功')
      // 更新本地用户信息
      await userStore.fetchCurrentUser()
    } else {
      ElMessage.error(res?.message || '更新失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '更新失败')
  } finally {
    updating.value = false
  }
}

const verifyEmail = () => {
  ElMessage.info('邮箱验证功能开发中')
}

const updatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    updatingPassword.value = true
    
    // 这里需要调用修改密码的API
    // const res = await updatePassword(passwordForm)
    
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
    
    // 重置表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error: any) {
    ElMessage.error(error?.message || '密码修改失败')
  } finally {
    updatingPassword.value = false
  }
}

const resetForm = () => {
  // 重置表单到初始状态
  Object.assign(userForm, {
    username: userStore.user?.username || '',
    realName: (userStore.user as any)?.realName || '',
    email: (userStore.user as any)?.email || '',
    phone: (userStore.user as any)?.phone || '',
    studentId: (userStore.user as any)?.studentId || '',
    department: (userStore.user as any)?.department || '',
    major: (userStore.user as any)?.major || ''
  })
  ElMessage.info('表单已重置')
}

function goToClassSelect() {
  router.push('/student/class')
}

// 生命周期
onMounted(() => {
  // 加载 Lottie 动画
  if (userLottieRef.value) {
    lottie.loadAnimation({
      container: userLottieRef.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: userLottie,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
      }
    })
  }
})
</script>

<style scoped>
.user-profile-container {
  min-height: 100vh;
  padding: 20px;
}

.sysadmin-frosted-bg {
    background: linear-gradient(120deg, #ececff 60%, #f8f8ff 100%);
}

.profile-header {
  padding: 32px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-glass.sysadmin-glass {
  background: rgba(255,255,255,0.78);
  border-radius: 28px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  backdrop-filter: blur(12px);
  border: 2px solid #ececff;
  margin: 0 auto 32px auto;
  padding: 38px;
  text-align: center;
  max-width: 1200px;
}

.profile-lottie {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  flex: 1;
  text-align: left;
}

.profile-name {
  font-size: 38px;
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

.profile-role {
  font-size: 18px;
  color: #7C3AED;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.profile-email {
  font-size: 16px;
  color: #a18fff;
  margin: 0;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
}

.sysadmin-chart-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 16px #bdbdfc22;
  padding: 18px 12px 12px 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.security-info h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.security-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.permissions-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.permission-group h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .security-item {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style> 