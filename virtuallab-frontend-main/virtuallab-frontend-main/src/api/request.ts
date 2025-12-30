import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  withCredentials: true,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    ElMessage.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request 

// 认证相关
export function loginByPassword(data: { username: string; password: string }) {
  return request.post('/auth/login/password', data)
}

export function loginByFingerprint(data: { username: string; fingerprintData: string }) {
  return request.post('/auth/login/fingerprint', data)
}

export function loginWithEmail(email: string, code: string) {
  return request.post('/auth/login/email', { email, code })
}

export function registerUser(data: { username: string; email: string; password: string }) {
  return request.post('/user/register', data)
}

export function getCurrentUser() {
  return request.get('/auth/currentUser')
}
export function logout() {
  return request.post('/user/logout')
}

// 用户相关（系统管理员专用）
export function getUserList(params: any) {
  return request.get('/system-admin/users', { params })
}
export function getUserById(id: number) {
  return request.get(`/system-admin/users/${id}`)
}
export function createUser(data: any) {
  return request.post('/system-admin/users', data)
}
export function updateUser(data: any) {
  return request.put('/system-admin/users', data)
}
export function deleteUser(id: number) {
  return request.delete(`/system-admin/users/${id}`)
}
export function enableUser(id: number) {
  return request.post(`/system-admin/users/${id}/enable`)
}
export function disableUser(id: number, reason: string) {
  return request.post(`/system-admin/users/${id}/disable`, null, { params: { reason } })
}

// 用户相关
export function getUserByUsername(username: string) {
  return request.get(`/user/username/${username}`)
}
export function getAllUsers() {
  return request.get('/user/list')
}
export function updateUserProfile(data: any) {
  return request.put('/user/profile/update', data)
}
export function updateUserInfo(data: any) {
  return request.post('/user/update-info', data)
}
export function assignRoles(userId: number, roleIds: number[]) {
  return request.post('/user/assignRoles', { userId, roleIds })
}

// 个人信息管理相关
export function getUserProfile(userId: number) {
  return request.get(`/user/profile/${userId}`)
}
export function createUserProfile(data: any) {
  return request.post('/user/profile', data)
}
export function updateUserProfileInfo(data: any) {
  return request.put('/user/profile', data)
}
export function deleteUserProfile(userId: number) {
  return request.delete(`/user/profile/${userId}`)
}
export function searchUserProfiles(params: any) {
  return request.get('/user/profile/search', { params })
}
export function batchUpdateUserProfiles(data: any[]) {
  return request.post('/user/profile/batch-update', data)
}
export function exportUserProfiles(params: any) {
  return request.get('/user/profile/export', { 
    params,
    responseType: 'blob'
  })
}

// 角色相关
export function getRoleById(id: number) {
  return request.get(`/role/${id}`)
}
export function getRoleByName(name: string) {
  return request.get(`/role/name/${name}`)
}
export function getAllRoles() {
  return request.get('/role/list')
}
export function createRole(data: any) {
  return request.post('/role/create', data)
}
export function updateRole(data: any) {
  return request.put('/role/update', data)
}
export function deleteRole(id: number) {
  return request.delete(`/role/${id}`)
}
export function assignPermissions(roleId: number, permissionIds: number[]) {
  return request.post('/role/assignPermissions', { roleId, permissionIds })
}

// 权限相关
export function getPermissionById(id: number) {
  return request.get(`/permission/${id}`)
}
export function getPermissionByCode(code: string) {
  return request.get(`/permission/code/${code}`)
}
export function getAllPermissions() {
  return request.get('/permission/list')
}
export function createPermission(data: any) {
  return request.post('/permission/create', data)
}
export function updatePermission(data: any) {
  return request.put('/permission/update', data)
}
export function deletePermission(id: number) {
  return request.delete(`/permission/${id}`)
}

// 临时权限相关
export function grantTempPermission(data: any) {
  return request.post('/temp-permission/grant', data)
}
export function revokeTempPermission(id: number) {
  return request.delete(`/temp-permission/${id}`)
}
export function revokeUserTempPermissions(userId: number) {
  return request.delete(`/temp-permission/user/${userId}`)
}
export function getUserTempPermissions(userId: number) {
  return request.get(`/temp-permission/user/${userId}`)
}
export function getUserActiveTempPermissions(userId: number) {
  return request.get(`/temp-permission/user/${userId}/active`)
}
export function getRoleTempPermissions(roleId: number) {
  return request.get(`/temp-permission/role/${roleId}`)
}
export function getPermissionTempPermissions(permissionId: number) {
  return request.get(`/temp-permission/permission/${permissionId}`)
}
export function checkUserTempPermission(userId: number, permissionId: number) {
  return request.get('/temp-permission/check-permission', { params: { userId, permissionId } })
}
export function checkUserTempRole(userId: number, roleId: number) {
  return request.get('/temp-permission/check-role', { params: { userId, roleId } })
}
export function getUserActiveTempPermissionIds(userId: number) {
  return request.get(`/temp-permission/user/${userId}/permission-ids`)
}
export function getUserActiveTempRoleIds(userId: number) {
  return request.get(`/temp-permission/user/${userId}/role-ids`)
}
export function updateExpiredTempPermissions() {
  return request.post('/temp-permission/update-expired')
}
export function batchGrantTempPermissions(data: any[]) {
  return request.post('/temp-permission/batch-grant', data)
}

// 管理员验证码相关
export function sendEmailCode(email: string, type: string = 'LOGIN') {
  return request.post('/auth/email/send-code', { email, type })
}
export function verifyEmailCode(email: string, code: string, type: string) {
  return request.post('/auth/email/verify', { email, code, type })
}
export function checkEmailVerified(email: string) {
  return request.get('/auth/email/check', { params: { email } })
}

// 统计相关
export function getStatistics() {
  return request.get('/system-admin/statistics')
}

// 获取用户角色
export function getUserRoles(userId: number) {
  return request.get(`/system-admin/users/${userId}/roles`)
}

// 系统监控相关
export function getSystemStatus() {
  return request.get('/monitor/status')
}
export function getSystemStatusCompat() {
  return request.get('/monitor/system-status')
}

// 实时操作监控
export function getRealtimeOperations(params: { limit?: number }) {
  return request({
    url: '/monitor/realtime-operations',
    method: 'get',
    params
  })
}

// 详细操作日志分页
export function getOperationLogs(params: { page: number, size: number, keyword?: string, type?: string }) {
  return request({
    url: '/monitor/operation-logs',
    method: 'get',
    params
  })
}

// 日志详情
export function getOperationLogDetail(id: number) {
  return request({
    url: `/monitor/operations/logs/${id}`,
    method: 'get'
  })
}
export function getPermissionStats() {
  return request.get('/monitor/permission-stats')
}
export function getUserBehaviorAnalysis() {
  return request.get('/monitor/user-behavior')
}
export function getSystemPerformance(params?: {
  timeRange?: string;
}) {
  return request.get('/monitor/performance', { params })
}

export function exportOperationLogs(params?: {
  startTime?: string;
  endTime?: string;
  type?: string;
}) {
  return request.get('/monitor/operations/export', { 
    params,
    responseType: 'blob'
  })
} 

// 院系管理员相关
export function getDepartmentUserStats(adminUserId: number) {
    return request.get(`/department-admin/statistics/users`, {
        params: { adminUserId }
    })
}

// 数据备份相关
export function startBackup() {
  return request.post('/admin/backup')
}
export function getBackupRecords() {
  return request.get('/admin/backup/records')
}
export function downloadBackup(fileName: string) {
  return request.get(`/admin/backup/download/${fileName}`, { responseType: 'blob' })
}

// 院系管理员统计相关
export function getDepartmentTeacherCount(adminUserId: number) {
  return request.get(`/department-admin/statistics/teachers/count`, {
    params: { adminUserId }
  })
}

export function getDepartmentStudentCount(adminUserId: number) {
  return request.get(`/department-admin/statistics/students/count`, {
    params: { adminUserId }
  })
}

// 获取本院系项目数量
export function getDepartmentProjectCount(adminUserId: number) {
  return request.get(`/department/projects/count`, {
    params: { adminUserId }
  })
}

// 获取学生实验项目列表
interface ExperimentStatsResponse {
  pageData: {
    records: any[];
    total: number;
    size: number;
    current: number;
    // 其他分页字段...
  };
  totalExperiments: number;
  completedExperiments: number;
  averageScore?: number;
}

export function getStudentExperiments(params: {
  userId: number;
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
}): Promise<{ code: number; data: ExperimentStatsResponse }> {
  return request.get('/student/experiments', { params });
}
