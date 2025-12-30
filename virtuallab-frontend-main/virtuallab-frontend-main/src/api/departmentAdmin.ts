import request from './request'

// 用户管理相关API
export function createDepartmentUser(userCreateDTO: any, adminUserId: number) {
  return request.post('/department-admin/users', userCreateDTO, {
    params: { adminUserId }
  })
}

export function batchCreateDepartmentUsers(userCreateDTOs: any[], adminUserId: number) {
  return request.post('/department-admin/users/batch', userCreateDTOs, {
    params: { adminUserId }
  })
}

export function updateDepartmentUser(user: any, adminUserId: number) {
  return request.put('/department-admin/users', user, {
    params: { adminUserId }
  })
}

export function disableDepartmentUser(userId: number, reason: string, adminUserId: number) {
  return request.post(`/department-admin/users/${userId}/disable`, null, {
    params: { reason, adminUserId }
  })
}

export function enableDepartmentUser(userId: number, adminUserId: number) {
  return request.post(`/department-admin/users/${userId}/enable`, null, {
    params: { adminUserId }
  })
}

export function resetDepartmentUserPassword(userId: number, newPassword: string, adminUserId: number) {
  return request.post(`/department-admin/users/${userId}/reset-password`, null, {
    params: { newPassword, adminUserId }
  })
}

export function lockDepartmentUser(userId: number, reason: string, adminUserId: number) {
  return request.post(`/department-admin/users/${userId}/lock`, null, {
    params: { reason, adminUserId }
  })
}

export function unlockDepartmentUser(userId: number, adminUserId: number) {
  return request.post(`/department-admin/users/${userId}/unlock`, null, {
    params: { adminUserId }
  })
}

// 权限管理相关API
export function assignRolesToDepartmentUser(userId: number, roleIds: number[], adminUserId: number) {
  return request.post(`/department-admin/users/${userId}/roles`, roleIds, {
    params: { adminUserId }
  })
}

export function setDepartmentUserTemporaryPermission(
  userId: number, 
  roleId: number, 
  startTime: string, 
  endTime: string, 
  reason: string, 
  adminUserId: number
) {
  return request.post(`/department-admin/users/${userId}/temporary-permissions`, null, {
    params: { roleId, startTime, endTime, reason, adminUserId }
  })
}

export function adjustDepartmentUserPermissions(userId: number, permissionIds: number[], adminUserId: number) {
  return request.post(`/department-admin/users/${userId}/permissions/adjust`, permissionIds, {
    params: { adminUserId }
  })
}

// 教学资源管理相关API
export function manageDepartmentResource(resourceId: number, operation: string, adminUserId: number) {
  return request.post(`/department-admin/resources/${resourceId}`, null, {
    params: { operation, adminUserId }
  })
}

export function approveDepartmentResource(
  resourceId: number, 
  approvalResult: string, 
  comment: string, 
  adminUserId: number
) {
  return request.post(`/department-admin/resources/${resourceId}/approve`, null, {
    params: { approvalResult, comment, adminUserId }
  })
}

export function manageDepartmentScore(scoreId: number, operation: string, adminUserId: number) {
  return request.post(`/department-admin/scores/${scoreId}`, null, {
    params: { operation, adminUserId }
  })
}

export function generateDepartmentScoreReport(adminUserId: number) {
  return request.get('/department-admin/scores/report', {
    params: { adminUserId }
  })
}

// 与系统管理员协同相关API
export function submitPermissionRequest(
  requestType: string,
  description: string,
  userIds: number[],
  permissionIds: number[],
  adminUserId: number
) {
  return request.post('/department-admin/permission-requests', {
    userIds,
    permissionIds
  }, {
    params: { requestType, description, adminUserId }
  })
}

export function reportUserAbnormal(
  userId: number,
  abnormalType: string,
  description: string,
  adminUserId: number
) {
  return request.post('/department-admin/user-abnormal', null, {
    params: { userId, abnormalType, description, adminUserId }
  })
}

export function getPermissionRequestStatus(adminUserId: number) {
  return request.get('/department-admin/permission-requests/status', {
    params: { adminUserId }
  })
}

// 查询功能相关API
export function getDepartmentUserList(
  username?: string,
  realName?: string,
  userType?: string,
  status?: number,
  adminUserId: number = 1,
  page: number = 1,
  size: number = 10
) {
  return request.get('/department-admin/users', {
    params: { username, realName, userType, status, adminUserId, page, size }
  })
}

export function getDepartmentUserRoles(userId: number, adminUserId: number) {
  return request.get(`/department-admin/users/${userId}/roles`, {
    params: { adminUserId }
  })
}

export function getDepartmentAssignableRoles(adminUserId: number) {
  return request.get('/department-admin/assignable-roles', {
    params: { adminUserId }
  })
}

export function getDepartmentAssignablePermissions(adminUserId: number) {
  return request.get('/department-admin/assignable-permissions', {
    params: { adminUserId }
  })
}

export function getDepartmentOperationLogs(
  username?: string,
  operation?: string,
  module?: string,
  startTime?: string,
  endTime?: string,
  adminUserId: number = 1,
  page: number = 1,
  size: number = 10
) {
  return request.get('/department-admin/operation-logs', {
    params: { username, operation, module, startTime, endTime, adminUserId, page, size }
  })
}

export function getDepartmentUserStatistics(adminUserId: number) {
  return request.get('/department-admin/statistics/users', {
    params: { adminUserId }
  })
}

export function getDepartmentPermissionUsageStatistics(adminUserId: number) {
  return request.get('/department-admin/statistics/permission-usage', {
    params: { adminUserId }
  })
} 