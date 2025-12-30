import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginByPassword, registerUser, logout, getCurrentUser } from '@/api/request'
import { ElMessage } from 'element-plus'
import { jwtDecode } from 'jwt-decode'

export interface User {
  id: number
  studentId: string
  username: string
  roles: string[]
  permissions?: string[]
  // 其他字段可根据后端返回补充
  department?: string  // 添加院系字段
  realName?: string    // 添加真实姓名字段
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  // 计算属性
  const isLoggedIn = computed(() => {
    console.log('isLoggedIn 计算:', token.value)
    return !!token.value
  })
  const userRole = computed(() => user.value?.roles?.[0]?.toUpperCase() || '')
  const userName = computed(() => user.value?.username || '')

  // 登录
  async function login(form: { username: string; password: string }) {
    const res = await loginByPassword(form) as unknown as ApiResponse<{ token: string }>
    if (res.code === 200) {
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      // 解析 JWT payload
      try {
        const payload = jwtDecode(res.data.token)
        console.log('JWT payload:', payload)
      } catch (e) {
        console.error('JWT 解析失败:', e)
      }
    }
    // 直接返回后端响应，前端自己判断
    return res
  }

  // 注册
  async function register(form: any) {
    const res = await registerUser(form) as unknown as { code: number; message: string; data?: any }
    return res
  }

  // 退出
  async function doLogout() {
    await logout()
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化
  function initUser() {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    console.log('initUser 被调用，localStorage token:', t, 'user:', u)
    if (t) token.value = t
    if (u) user.value = JSON.parse(u)
    console.log('initUser 设置后，token.value:', token.value, 'user.value:', user.value)
  }

  // 角色权限映射
  const rolePermissions = {
    SYSTEM_ADMIN: [
      'user:manage',
      'lab:manage',
      'experiment:manage',
      'system:config',
      'data:view',
      'report:manage'
    ],
    DEPARTMENT_ADMIN: [
      'user:view',
      'lab:manage',
      'experiment:manage',
      'data:view',
      'report:view'
    ],
    TEACHER: [
      'lab:view',
      'experiment:create',
      'experiment:edit',
      'data:view',
      'report:create'
    ],
    STUDENT: [
      'lab:view',
      'experiment:view',
      'data:view',
      'report:view'
    ],
    guest: [
      'lab:view',
      'experiment:view'
    ]
  }

  // 检查权限
  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false
    const userRoleUpper = user.value.roles[0]?.toUpperCase()
    const permissions = rolePermissions[userRoleUpper as keyof typeof rolePermissions] || []
    return permissions.includes(permission)
  }

  // 检查角色
  const hasRole = (role: string): boolean => {
    return user.value?.roles.includes(role) || false
  }

  // 设置用户信息
  const setUser = (userInfo: User) => {
    user.value = userInfo
    localStorage.setItem('user', JSON.stringify(userInfo))
  }

  // 设置token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 清除用户信息
  const clearUser = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 新增 fetchCurrentUser 方法
  async function fetchCurrentUser() {
    const res = await getCurrentUser() as unknown as ApiResponse<{
      roles: string[],
      user: any,
      department?: string
    }>
    if (res.code === 200) {
      // 后端返回的数据结构是 { roles: [], user: {} }
      // 需要将 roles 和 user 信息合并
      const userInfo: User = {
        ...res.data.user,
        roles: res.data.roles,
        department: res.data.user.department || res.data.department
      }
      user.value = userInfo
      localStorage.setItem('user', JSON.stringify(userInfo))
      return userInfo
    } else {
      throw new Error(res.message || '获取用户信息失败')
    }
  }
  const userDepartment = computed(() => user.value?.department || '未设置院系')
  return {
    user,
    token,
    isLoggedIn,
    userRole,
    userName,
    userDepartment,
    login,
    register,
    doLogout,
    initUser,
    hasPermission,
    hasRole,
    setUser,
    setToken,
    clearUser,
    fetchCurrentUser
  }
}) 