import request from './request'

// 获取角色列表
export function getRoleList() {
  return request.get('/system-admin/roles')
}

// 创建角色
export function createRole(data: { name: string; description: string }) {
  return request.post('/system-admin/roles', data)
}

// 更新角色
export function updateRole(data: { id: number|string; name: string; description: string }) {
  return request.put('/system-admin/roles', data)
}

// 删除角色
export function deleteRole(roleId: number|string) {
  return request.delete(`/system-admin/roles/${roleId}`)
}

// 获取权限列表
export function getPermissionList() {
  return request.get('/system-admin/permissions')
}

// 创建权限
export function createPermission(data: { name: string; description: string }) {
  return request.post('/system-admin/permissions', data)
}

// 更新权限
export function updatePermission(data: { id: number|string; name: string; description: string }) {
  return request.put('/system-admin/permissions', data)
}

// 删除权限
export function deletePermission(permissionId: number|string) {
  return request.delete(`/system-admin/permissions/${permissionId}`)
}

// 为角色分配权限
export function assignPermissionsToRole(roleId: number|string, permissionIds: number[]) {
  return request.post(`/system-admin/roles/${roleId}/permissions`, permissionIds)
}

// 获取角色的权限
export function getRolePermissions(roleId: number|string) {
  return request.get(`/system-admin/roles/${roleId}/permissions`)
}

// 获取系统状态
export function getSystemStatus() {
  return request.get('/monitor/status')
} 