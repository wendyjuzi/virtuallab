<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <div class="login-layout">
      <!-- 左侧图片区域 -->
      <div class="login-illustration">
        <div class="illustration-content">
          <h2>虚拟实验室协作平台</h2>
          <p>高效的在线学习与实验环境，随时随地开展科学探索</p>
          <!-- <div class="illustration-image">
            <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-system-icons/assets/Collaboration/SVG/ic_fluent_people_community_24_regular.svg" alt="协作" class="floating-icon icon-1" />
            <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-system-icons/assets/Chat/SVG/ic_fluent_chat_multiple_24_regular.svg" alt="聊天" class="floating-icon icon-2" />
            <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-system-icons/assets/Education/SVG/ic_fluent_book_24_regular.svg" alt="学习" class="floating-icon icon-3" />
            <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-system-icons/assets/Science/SVG/ic_fluent_beaker_24_regular.svg" alt="实验" class="floating-icon icon-4" />
          </div> -->
        </div>
      </div>

      <!-- 右侧登录区域 -->
      <div class="login-content">
        <div class="login-card-flip" :class="{ flipped: isFlipped }">
          <!-- 登录卡片 -->
          <div class="login-card front">
            <div class="login-header">
              <div class="logo">
                <el-icon size="32" color="#0a2540"><Monitor /></el-icon>
                <h1>VirtualLab</h1>
              </div>
              <p class="subtitle">虚拟实验室管理系统</p>
            </div>

            <!-- 登录方式切换 -->
            <div class="login-type-tabs">
              <el-radio-group v-model="loginType" size="large">
                <el-radio-button label="password">账号密码登录</el-radio-button>
                <el-radio-button label="email">邮箱验证码登录</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 账号密码登录表单 -->
            <el-form v-if="loginType === 'password'" ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" @submit.prevent="handleLogin">
              <el-form-item prop="username">
                <el-input
                    v-model="loginForm.username"
                    placeholder="用户名/邮箱"
                    size="large"
                    :prefix-icon="User"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="密码"
                    size="large"
                    :prefix-icon="Lock"
                    show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button
                    type="primary"
                    size="large"
                    style="width: 100%"
                    :loading="loading"
                    @click="handleLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 邮箱验证码登录表单 -->
            <el-form v-else ref="emailLoginFormRef" :model="emailLoginForm" :rules="emailLoginRules" class="login-form" @submit.prevent="handleEmailLogin">
              <el-form-item prop="email">
                <el-input v-model="emailLoginForm.email" placeholder="邮箱" size="large" :prefix-icon="Message" />
              </el-form-item>
              <el-form-item prop="code">
                <el-input v-model="emailLoginForm.code" placeholder="验证码" size="large" style="width: 60%" />
                <el-button size="small" style="margin-left: 8px" :disabled="emailSending" @click="handleSendEmailLoginCode">
                  {{ emailSending ? emailCountdown + 's' : '获取验证码' }}
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleEmailLogin">登录</el-button>
              </el-form-item>
            </el-form>

            <div class="login-footer">
              <el-checkbox v-if="loginType === 'password'" v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary" @click="isFlipped = true">没有账号？去注册</el-link>
            </div>

            <div class="demo-accounts">
              <p class="demo-title">演示账户</p>
              <div class="demo-list">
                <div class="demo-item" @click="fillDemoAccount('SYSTEM_ADMIN')">
                  <span class="demo-role">管理员</span>
                  <span class="demo-cred">admin / 123456</span>
                </div>
                <div class="demo-item" @click="fillDemoAccount('TEACHER')">
                  <span class="demo-role">教师</span>
                  <span class="demo-cred">teacher / 123456</span>
                </div>
                <div class="demo-item" @click="fillDemoAccount('STUDENT')">
                  <span class="demo-role">学生</span>
                  <span class="demo-cred">student / 123456</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 注册卡片 -->
          <div class="login-card back">
            <div class="login-header">
              <div class="logo">
                <el-icon size="32" color="#0a2540"><Monitor /></el-icon>
                <h1>VirtualLab</h1>
              </div>
              <p class="subtitle">虚拟实验室管理系统 - 注册</p>
            </div>
            <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="login-form" @submit.prevent="handleRegister">
              <el-form-item prop="username">
                <el-input v-model="registerForm.username" placeholder="用户名" size="large" :prefix-icon="User" />
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="密码" size="large" :prefix-icon="Lock" show-password />
              </el-form-item>
              <el-form-item prop="roleCode">
                <el-select v-model="registerForm.roleCode" placeholder="请选择身份" size="large" style="width: 100%">
                  <el-option label="系统管理员" value="SYSTEM_ADMIN" />
                  <el-option label="院系管理员" value="DEPARTMENT_ADMIN" />
                  <el-option label="教师" value="TEACHER" />
                  <el-option label="学生" value="STUDENT" />
                  <el-option label="访客" value="GUEST" />
                </el-select>
              </el-form-item>
            <!-- 新增：学生注册时选择班级 -->
            <el-form-item v-if="registerForm.roleCode === 'STUDENT'" prop="classId">
              <el-select v-model="registerForm.classId" placeholder="请选择班级" size="large" filterable>
                <el-option v-for="item in classList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
              <el-form-item prop="realName">
                <el-input v-model="registerForm.realName" placeholder="真实姓名" size="large" />
              </el-form-item>
              <el-form-item prop="studentId">
                <el-input v-model="registerForm.studentId" placeholder="学号/工号" size="large" />
              </el-form-item>
              <el-form-item prop="department">
                <el-input v-model="registerForm.department" placeholder="院系" size="large" />
              </el-form-item>
              <el-form-item prop="major">
                <el-input v-model="registerForm.major" placeholder="专业" size="large" />
              </el-form-item>
              <el-form-item prop="phone">
                <el-input v-model="registerForm.phone" placeholder="手机号" size="large" />
              </el-form-item>
              <el-form-item prop="email">
                <el-input v-model="registerForm.email" placeholder="邮箱" size="large" />
              </el-form-item>
              <!-- 管理员注册时显示验证码输入框 -->
              <template v-if="registerForm.roleCode === 'SYSTEM_ADMIN'">

                <el-form-item label="邮箱验证码" prop="emailCode">
                  <el-input v-model="registerForm.emailCode" placeholder="请输入邮箱验证码" size="large" style="width: 60%" />
                  <el-button size="small" style="margin-left: 8px" @click="handleSendEmailCode" :disabled="emailSendingReg">{{ emailSendingReg ? emailCountdownReg + 's' : '发送验证码' }}</el-button>
                </el-form-item>

              </template>
              <el-form-item>
                <el-button type="primary" size="large" style="width: 100%" :loading="registerLoading" @click="handleRegister">注册</el-button>
              </el-form-item>
            </el-form>
            <div class="login-footer">
              <el-link type="primary" @click="isFlipped = false">已有账号？去登录</el-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { sendEmailCode, loginWithEmail } from '@/api/request'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const emailLoginFormRef = ref()
const loading = ref(false)
const rememberMe = ref(false)
const isFlipped = ref(false)
const loginType = ref<'password' | 'email'>('password')
const registerFormRef = ref()
const registerLoading = ref(false)
const classList = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await axios.get('/student/class/all')
    classList.value = Array.isArray(res.data) ? res.data : (res.data.classList || [])
  } catch (e) {
    classList.value = []
  }
})

// 账号密码登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 邮箱验证码登录表单
const emailLoginForm = reactive({
  email: '',
  code: ''
})
const emailLoginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}
const emailSending = ref(false)
const emailCountdown = ref(60)
let emailTimer: any = null

const smsSending = ref(false)
const smsCountdown = ref(60)
let smsTimer: any = null
const emailSendingReg = ref(false)
const emailCountdownReg = ref(60)
let emailTimerReg: any = null

const registerForm = reactive({
  username: '',
  password: '',
  roleCode: '',
  realName: '',
  studentId: '',
  department: '',
  major: '',
  phone: '',
  email: '',
  userType: '',
  emailCode: '',
  classId: '' // 新增，支持班级选择
})

// 1. 完善注册表单校验规则，学生注册时班级必选
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请选择身份', trigger: 'change' }
  ],
  // 新增：仅学生时校验班级
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
    loading.value = true
    const loginRes = await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })
    if (!loginRes || loginRes.code !== 200) {
      ElMessage.error(loginRes?.message || '登录失败')
      return
    }
    await userStore.fetchCurrentUser()
    await nextTick()
    switch (userStore.userRole) {
      case 'SYSTEM_ADMIN': router.push('/admin')
        break
      case 'DEPARTMENT_ADMIN': router.push('/department')
        break
      case 'TEACHER': router.push('/teacher')
        break
      case 'STUDENT': router.push('/student')
        break
      default: router.push('/dashboard')
    }
    ElMessage.success('登录成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const handleSendEmailLoginCode = async () => {
  if (!emailLoginForm.email) {
    ElMessage.warning('请先填写邮箱')
    return
  }
  emailSending.value = true
  try {
    await sendEmailCode(emailLoginForm.email, 'LOGIN')
    ElMessage.success('验证码已发送')
    emailCountdown.value = 60
    emailTimer = setInterval(() => {
      emailCountdown.value--
      if (emailCountdown.value <= 0) {
        emailSending.value = false
        clearInterval(emailTimer)
      }
    }, 1000)
  } catch (e) {
    emailSending.value = false
  }
}

const handleEmailLogin = async () => {
  if (!emailLoginFormRef.value) return
  try {
    await emailLoginFormRef.value.validate()
    loading.value = true
    const res: any = await loginWithEmail(emailLoginForm.email, emailLoginForm.code)
    if (!res || res.code !== 200) {
      ElMessage.error(res?.message || '登录失败')
      return
    }
    await userStore.fetchCurrentUser()
    await nextTick()
    switch (userStore.userRole) {
      case 'SYSTEM_ADMIN': router.push('/admin'); break
      case 'DEPARTMENT_ADMIN': router.push('/department'); break
      case 'TEACHER': router.push('/teacher'); break
      case 'STUDENT': router.push('/student'); break
      default: router.push('/dashboard')
    }
    ElMessage.success('登录成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '登录失败，请检查邮箱和验证码')
  } finally {
    loading.value = false
  }
}

const handleSendEmailCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先填写邮箱')
    return
  }
  emailSendingReg.value = true
  try {
    const type = registerForm.roleCode === 'SYSTEM_ADMIN' ? 'REGISTER' : 'LOGIN'
    await sendEmailCode(registerForm.email, type)
    ElMessage.success('邮箱验证码已发送')
    emailCountdownReg.value = 60
    emailTimerReg = setInterval(() => {
      emailCountdownReg.value--
      if (emailCountdownReg.value <= 0) {
        emailSendingReg.value = false
        clearInterval(emailTimerReg)
      }
    }, 1000)
  } catch (e) {
    emailSendingReg.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  try {
    await registerFormRef.value.validate()
    registerLoading.value = true
    let formToSend = { ...registerForm, roleCode: registerForm.roleCode.toUpperCase() }
    if (registerForm.roleCode === 'SYSTEM_ADMIN') {
      formToSend.userType = 'admin'
      if (!registerForm.emailCode) {
        ElMessage.error('请填写邮箱验证码')
        registerLoading.value = false
        return
      }
      formToSend.emailCode = registerForm.emailCode
    }
    // 学生注册时带上classId
    if (registerForm.roleCode === 'STUDENT') {
      formToSend.classId = registerForm.classId
    }
    const res = await userStore.register(formToSend)
    if (res && res.code === 200) {
      // 新增：学生注册成功后自动加入班级
      if (registerForm.roleCode === 'STUDENT' && registerForm.classId) {
        // 尝试从注册返回中获取 studentId
        const studentId = res?.studentId || res?.data?.studentId || res?.data?.id || registerForm.studentId
        if (studentId) {
          const joinRes = await axios.post('/student/class/select', {
            studentId,
            classId: registerForm.classId
          })
          if (joinRes?.data?.code === 200) {
            ElMessage.success('注册并加入班级成功，请登录')
            isFlipped.value = false
            registerLoading.value = false
            return
          } else {
            ElMessage.error('注册成功，但加入班级失败：' + (joinRes?.data?.msg || joinRes?.data?.message || '未知错误'))
          }
        } else {
          ElMessage.error('注册成功，但未能获取学号，无法自动加入班级')
        }
      } else {
        ElMessage.success(res?.msg || res?.message || res?.data?.msg || '注册成功，请登录')
        isFlipped.value = false
      }
    } else {
      ElMessage.error(res?.msg || res?.message || res?.data?.msg || '注册失败')
    }
  } catch (error) {
    ElMessage.error(error?.message || '注册失败')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4c249f 0%, #7c3aed 100%);
  position: relative;
  overflow: hidden;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% {
    background: linear-gradient(135deg, #4c249f 0%, #7c3aed 100%);
  }
  50% {
    background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%);
  }
  100% {
    background: linear-gradient(135deg, #4c249f 0%, #7c3aed 100%);
  }
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  backdrop-filter: blur(80px);
}

.background-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 
    inset 0 0 40px rgba(255, 255, 255, 0.08),
    0 0 80px rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  animation: float 15s ease-in-out infinite;
  transition: all 0.5s ease;
}

.shape:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 0 60px rgba(255, 255, 255, 0.12),
    0 0 100px rgba(255, 255, 255, 0.08);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
  background: radial-gradient(circle at center, rgba(212, 180, 255, 0.15), rgba(160, 120, 240, 0.08));
  filter: blur(2px);
}

.shape-2 {
  width: 500px;
  height: 500px;
  top: 50%;
  right: -100px;
  animation-delay: 2s;
  background: radial-gradient(circle at center, rgba(187, 147, 252, 0.12), rgba(130, 90, 230, 0.06));
  filter: blur(3px);
}

.shape-3 {
  width: 200px;
  height: 200px;
  bottom: 10%;
  left: 15%;
  animation-delay: 4s;
  background: radial-gradient(circle at center, rgba(232, 222, 255, 0.15), rgba(180, 160, 240, 0.08));
  filter: blur(1px);
}

@keyframes float {
  0%, 100% { 
    transform: translate(0, 0) rotate(0deg) scale(1); 
  }
  25% { 
    transform: translate(-20px, 20px) rotate(5deg) scale(1.05); 
  }
  50% { 
    transform: translate(10px, -15px) rotate(-5deg) scale(0.95); 
  }
  75% { 
    transform: translate(15px, 10px) rotate(3deg) scale(1.02); 
  }
}

.login-layout {
  display: flex;
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  max-height: 800px;
  position: relative;
  z-index: 2;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 25px 70px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    0 0 100px rgba(124, 58, 237, 0.3);
  backdrop-filter: blur(20px);
  animation: cardAppear 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 左侧图片区域 */
.login-illustration {
  flex: 1;
  background: linear-gradient(135deg, rgba(76, 36, 159, 0.75) 0%, rgba(124, 58, 237, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.login-illustration::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://img.freepik.com/free-vector/group-young-people-posing-photo_52683-18824.jpg?w=1380&t=st=1689320015~exp=1689320615~hmac=abc5a39d6c8b487854c69e828e7639b4ab76a0a3dcb5bb9a3948a1c0a9d3a5a0') center/cover no-repeat;
  opacity: 0.2;
  z-index: -1;
}

.illustration-content {
  text-align: center;
  color: white;
  max-width: 80%;
  z-index: 2;
}

.illustration-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #ece4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.illustration-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  line-height: 1.6;
}

.illustration-image {
  position: relative;
  height: 300px;
  width: 100%;
  margin-top: 2rem;
}

.floating-icon {
  position: absolute;
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: floatIcon 6s ease-in-out infinite;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 50%;
}

.icon-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.icon-2 {
  top: 10%;
  right: 25%;
  animation-delay: 1.5s;
}

.icon-3 {
  bottom: 15%;
  left: 30%;
  animation-delay: 3s;
}

.icon-4 {
  bottom: 25%;
  right: 20%;
  animation-delay: 4.5s;
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* 右侧登录区域 */
.login-content {
  width: 440px;
  background: rgba(252, 252, 252, 0.98);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  z-index: 0;
  pointer-events: none;
}

.login-card-flip {
  position: relative;
  width: 100%;
  min-height: 520px;
  height: auto;
  perspective: 2000px;
  z-index: 1;
}

.login-card-flip .login-card {
  width: 100%;
  height: auto;
  max-height: 85vh;
  position: absolute;
  margin-top:-110px;
  backface-visibility: hidden;
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 40px 30px 30px 30px;
  display: block;
  overflow-y: auto;
  word-break: break-all;
  scrollbar-width: thin;
  scrollbar-color: #d8b4fe #f8fafc;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.8);
}

.login-card-flip .login-card::-webkit-scrollbar {
  width: 6px;
  background: #f8fafc;
  border-radius: 6px;
}

.login-card-flip .login-card::-webkit-scrollbar-thumb {
  background: #d8b4fe;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.login-card-flip .login-card::-webkit-scrollbar-thumb:hover {
  background: #c084fc;
}

.login-card-flip .front {
  z-index: 2;
  background: #fff;
}

.login-card-flip .back {
  transform: rotateY(180deg);
  background: #fff;
}

.login-card-flip.flipped .front {
  transform: rotateY(-180deg);
}

.login-card-flip.flipped .back {
  transform: rotateY(0deg);
  z-index: 3;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 12px;
}

.logo h1 {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  word-break: break-all;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  background: linear-gradient(135deg, #6d28d9 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
  word-break: break-all;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
}

.login-form {
  width: 100%;
  min-width: 0;
  margin-bottom: 28px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.demo-accounts {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  word-break: break-all;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-title {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
  text-align: center;
  word-break: break-all;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.demo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  word-break: break-all;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  word-break: break-all;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid rgba(241, 245, 249, 0.6);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

.demo-item:hover {
  background: rgba(241, 245, 249, 0.9);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
}

.demo-role {
  font-size: 13px;
  color: #334155;
  font-weight: 600;
  word-break: break-all;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-cred {
  font-size: 12px;
  color: #64748b;
  font-family: 'SF Mono', 'Courier New', monospace;
  word-break: break-all;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05), 
    0 0 0 1px #e2e8f0,
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  padding: 2px 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.08), 
    0 0 0 1px #cbd5e1,
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 
    0 0 0 3px rgba(168, 85, 247, 0.25), 
    0 0 0 1px #a855f7,
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

:deep(.el-input__inner) {
  font-size: 15px;
  color: #334155;
}

:deep(.el-button--primary) {
  border-radius: 12px;
  background: linear-gradient(135deg, #6d28d9 0%, #a855f7 100%);
  border: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  height: 48px;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(109, 40, 217, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

:deep(.el-button--primary::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

:deep(.el-button--primary:hover::before) {
  left: 100%;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(109, 40, 217, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
  box-shadow: 
    0 2px 6px rgba(109, 40, 217, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.login-type-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}

:deep(.el-radio-button__inner) {
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #6d28d9 0%, #a855f7 100%);
  box-shadow: 0 2px 6px rgba(109, 40, 217, 0.2);
  border-color: #6d28d9;
}

:deep(.el-checkbox__inner) {
  border-radius: 4px;
  border-color: #cbd5e1;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #a855f7;
  border-color: #a855f7;
}

:deep(.el-link) {
  color: #a855f7;
  font-weight: 500;
}

:deep(.el-link:hover) {
  color: #7c3aed;
}

:deep(.el-select__wrapper) {
  border-radius: 10px;
}

:deep(.el-select-dropdown__item.selected) {
  color: #a855f7;
  font-weight: 600;
}

:deep(.el-select-dropdown__item.hover) {
  background: #f1f5f9;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-layout {
    width: 95%;
    flex-direction: column;
    height: auto;
    max-height: none;
  }
  
  .login-illustration {
    padding: 30px;
    min-height: 300px;
  }
  
  .illustration-content h2 {
    font-size: 2rem;
  }
  
  .illustration-content p {
    font-size: 1rem;
  }
  
  .illustration-image {
    height: 200px;
  }
  
  .floating-icon {
    width: 60px;
    height: 60px;
    padding: 10px;
  }
  
  .login-content {
    width: 100%;
    padding: 30px 20px;
  }
  
  .login-card-flip {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .login-illustration {
    display: none;
  }
  
  .login-content {
    padding: 20px 15px;
  }
  
  .login-card-flip .login-card {
    padding: 30px 20px 20px 20px;
  }
}
</style> 