import request from './request'

// 资源相关接口
export interface Resource {
  id?: number
  name: string
  description?: string
  type: string
  url?: string
  size?: number
  format?: string
  tags?: string[]
  category?: string
  status?: number
  createTime?: string
  updateTime?: string
  creatorId?: number
  creatorName?: string
}

export interface ResourceShare {
  resourceId: number
  userId: number
  permission: string // READ, WRITE, ADMIN
  expireTime?: string
}

export interface ResourceCopy {
  sourceId: number
  targetUserId: number
  newName?: string
}

export interface ResourceInteraction {
  resourceId: number
  userId: number
  type: string // LIKE, FAVORITE, DOWNLOAD, VIEW
  comment?: string
}

// 创建资源
export function createResource(data: Resource) {
  return request.post('/resource', data)
}

// 更新资源
export function updateResource(data: Resource) {
  return request.put('/resource', data)
}

// 删除资源
export function deleteResource(id: number) {
  return request.delete(`/resource/${id}`)
}

// 根据ID获取资源
export function getResourceById(id: number) {
  return request.get(`/resource/${id}`)
}

// 获取所有资源列表
export function getAllResources() {
  return request.get('/resource/list')
}

// 复制资源
export function copyResource(data: ResourceCopy) {
  return request.post('/resource/copy', data)
}

// ================= 系统管理员资源管理接口 =================

// 分页获取资源列表
export function getAdminResourceList(params: {
  page?: number;
  size?: number;
  type?: string;
  keyword?: string;
}) {
  return request.get('/system-admin/resources', { params });
}

// 获取资源详情
export function getAdminResourceDetail(id: number) {
  return request.get(`/system-admin/resources/${id}`);
}

// 创建资源
export function createAdminResource(data: any) {
  return request.post('/system-admin/resources', data);
}

// 更新资源
export function updateAdminResource(data: any) {
  return request.put('/system-admin/resources', data);
}

// 删除资源
export function deleteAdminResource(id: number) {
  return request.delete(`/system-admin/resources/${id}`);
} 