import request from './request'

// 评论相关接口
export interface ResourceComment {
  id?: number
  resourceId: number
  userId: number
  userName?: string
  content: string
  parentId?: number
  createTime?: string
  updateTime?: string
  status?: number
}

// 添加评论
export function addComment(data: ResourceComment) {
  return request.post('/resource-comment/create', data)
}

// 根据资源ID获取评论列表
export function getCommentsByResourceId(resourceId: number) {
  return request.get(`/resource-comment/resource/${resourceId}`)
}

// 根据评论ID获取评论详情
export function getCommentById(id: number) {
  return request.get(`/resource-comment/${id}`)
}

// 更新评论
export function updateComment(data: ResourceComment) {
  return request.put('/resource-comment/update', data)
}

// 删除评论
export function deleteComment(id: number, userId?: number) {
  // 如果 userId 存在，拼接到 url
  let url = `/resource-comment/${id}`
  if (userId) {
    url += `?userId=${userId}`
  }
  return request.delete(url)
} 