import request from './request'

// 点赞收藏相关的接口类型定义
export interface LikeStatus {
  liked: boolean
  favorited: boolean
}

export interface LikeRecord {
  id: number
  userId: number
  resourceId: number
  createTime: string
}

export interface FavoriteRecord {
  id: number
  userId: number
  resourceId: number
  createTime: string
}

export interface FavoriteRequest {
  userId: number
  resourceId: number
}

// 统一响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页响应格式
export interface PageResponse<T = any> {
  records: T[]
  total: number
  current: number
  size: number
}

// 1. 查询点赞/收藏状态
export function getLikeFavoriteStatus(experimentId: number, userId: number) {
  return request.get<ApiResponse<LikeStatus>>(`/like-favorite/experiment/${experimentId}`, {
    params: { userId }
  })
}

// 2. 点赞资源
export function likeResource(resourceId: number, userId: number) {
  return request.post<ApiResponse<null>>(`/like-favorite/like/${resourceId}`, null, {
    params: { userId }
  })
}

// 3. 取消点赞
export function unlikeResource(resourceId: number, userId: number) {
  return request.post<ApiResponse<null>>(`/like-favorite/unlike/${resourceId}`, null, {
    params: { userId }
  })
}

// 4. 查询用户点赞列表
export function getUserLikes(userId: number, page: number = 1, size: number = 10) {
  return request.get<ApiResponse<LikeRecord[]>>(`/like-favorite/user/${userId}/likes`, {
    params: { page, size }
  })
}

// 5. 统计用户点赞数量
export function getUserLikesCount(userId: number) {
  return request.get<ApiResponse<number>>(`/like-favorite/user/${userId}/likes/count`)
}

// 6. 检查是否已点赞
export function isLiked(userId: number, resourceId: number) {
  return request.get<ApiResponse<boolean>>(`/like-favorite/is-liked`, {
    params: { userId, resourceId }
  })
}

// 7. 获取资源点赞数量
export function getResourceLikeCount(resourceId: number) {
  return request.get<ApiResponse<number>>(`/like-favorite/resource/${resourceId}/like-count`)
}

// 收藏功能接口

// 1. 添加收藏
export function addFavorite(favoriteData: FavoriteRequest) {
  return request.post<ApiResponse<number>>(`/resource-favorite/add`, favoriteData)
}

// 2. 移除收藏
export function removeFavorite(id: number) {
  return request.delete<ApiResponse<number>>(`/resource-favorite/remove/${id}`)
}

// 3. 查询收藏记录
export function getFavoriteRecord(id: number) {
  return request.get<ApiResponse<FavoriteRecord>>(`/resource-favorite/get/${id}`)
}

// 4. 查询用户收藏列表
export function getUserFavorites(userId: number, offset: number = 0, size: number = 10) {
  return request.get<ApiResponse<FavoriteRecord[]>>(`/resource-favorite/list/${userId}`, {
    params: { offset, size }
  })
}

// 5. 统计用户收藏数量
export function getUserFavoritesCount(userId: number) {
  return request.get<ApiResponse<number>>(`/resource-favorite/count/${userId}`)
}

// 6. 查询用户资源收藏
export function getUserResourceFavorite(userId: number, resourceId: number) {
  return request.get<ApiResponse<FavoriteRecord>>(`/resource-favorite/getByUserAndResource`, {
    params: { userId, resourceId }
  })
}

// 7. 获取资源收藏数量
export function getResourceFavoriteCount(resourceId: number) {
  return request.get<ApiResponse<number>>(`/resource-favorite/resource/${resourceId}/favorite-count`)
}

// 8. 检查是否已收藏
export function isFavorited(userId: number, resourceId: number) {
  return request.get<ApiResponse<boolean>>(`/resource-favorite/is-favorited`, {
    params: { userId, resourceId }
  })
}

// 管理员功能接口 - 使用新的后端接口路径

// 后端返回的数据结构定义（对应CommonResult.data）

// 管理员统计数据响应格式
export interface AdminStatsResponse {
  totalUsers: number
  totalLikes: number
  totalFavorites: number
  totalResources: number
  avgLikesPerUser: number
  avgFavoritesPerUser: number
  topUsers: Array<{
    userId: number
    username: string
    nickname: string
    likeCount: number
    favoriteCount: number
    totalInteractions: number
    lastActivity?: string
  }>
  topResources: Array<{
    resourceId: number
    resourceName: string
    resourceType: string
    likeCount: number
    favoriteCount: number
    totalInteractions: number
    category?: string
  }>
}

// 资源统计数据响应格式
export interface ResourceStatsResponse {
  totalResources: number
  totalLikes: number
  totalFavorites: number
  avgLikesPerResource: number
  avgFavoritesPerResource: number
  topResources: Array<{
    resourceId: number
    resourceName: string
    resourceType: string
    likeCount: number
    favoriteCount: number
    totalInteractions: number
    category?: string
  }>
}

// 带用户信息的点赞记录
export interface LikeRecordWithUser {
  id: number
  userId: number
  username: string
  resourceId: number
  resourceName: string
  createTime: string
}

// 带用户信息的收藏记录
export interface FavoriteRecordWithUser {
  id: number
  userId: number
  username: string
  resourceId: number
  resourceName: string
  createTime: string
}

// 管理员功能：获取所有用户的点赞收藏统计
export function getAllUsersLikeFavoriteStats() {
  return request.get<AdminStatsResponse>('/admin/like-favorite/stats')
}

// 管理员功能：获取所有点赞记录
export function getAllLikes(page: number = 1, size: number = 20) {
  return request.get<PageResponse<LikeRecordWithUser>>('/admin/like-favorite/likes', {
    params: { page, size }
  })
}

// 管理员功能：获取所有收藏记录
export function getAllFavorites(page: number = 1, size: number = 20) {
  return request.get<PageResponse<FavoriteRecordWithUser>>('/admin/like-favorite/favorites', {
    params: { page, size }
  })
}

// 管理员功能：删除指定点赞记录
export function adminDeleteLike(likeId: number) {
  return request.delete<ApiResponse<number>>(`/admin/like-favorite/like/${likeId}`)
}

// 管理员功能：批量删除点赞记录
export function adminBatchDeleteLikes(likeIds: number[], reason?: string) {
  return request.delete<ApiResponse<number>>('/admin/like-favorite/likes/batch', {
    data: { 
      ids: likeIds,
      reason: reason || '管理员批量删除'
    }
  })
}

// 管理员功能：删除指定收藏记录
export function adminDeleteFavorite(favoriteId: number) {
  return request.delete<ApiResponse<number>>(`/admin/like-favorite/favorite/${favoriteId}`)
}

// 管理员功能：批量删除收藏记录
export function adminBatchDeleteFavorites(favoriteIds: number[], reason?: string) {
  return request.delete<ApiResponse<number>>('/admin/like-favorite/favorites/batch', {
    data: { 
      ids: favoriteIds,
      reason: reason || '管理员批量删除'
    }
  })
}

// 管理员功能：重置用户统计
export function adminResetUserStats(userId: number) {
  return request.post<ApiResponse<null>>(`/admin/like-favorite/user/${userId}/reset-stats`)
}

// 管理员功能：获取资源统计
export function getResourceLikeFavoriteStats() {
  return request.get<ResourceStatsResponse>('/admin/like-favorite/resource-stats')
}

// 管理员功能：获取指定资源统计
export function getResourceDetailStats(resourceId: number) {
  return request.get<ApiResponse<any>>(`/admin/like-favorite/resource/${resourceId}/stats`)
}

// 管理员功能：获取指定用户统计
export function getUserDetailStats(userId: number) {
  return request.get<ApiResponse<any>>(`/admin/like-favorite/user/${userId}/stats`)
}

// 管理员功能：导出数据
export function exportLikeFavoriteData(format: 'excel' | 'csv' = 'excel') {
  return request.get<ApiResponse<any>>('/admin/like-favorite/export', {
    params: { format },
    responseType: 'blob'
  })
}

// 管理员功能：系统概览
export function getSystemOverview() {
  return request.get<ApiResponse<any>>('/admin/like-favorite/overview')
} 