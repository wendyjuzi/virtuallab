import request from './request'

// 通知相关接口类型定义
export interface ShareNotification {
  id: number
  type: string
  title: string
  content: string
  sender: string
  receiver: string
  resourceId: number
  resourceTitle: string
  shareLink?: string
  createdAt: string
  isRead: boolean
  actionUrl: string
}

export interface ShareStatistics {
  shareCount: number
  viewCount: number
  downloadCount: number
}

export interface ShareInfo {
  id: number
  resourceId: number
  shareType: 'user' | 'class' | 'link'
  shareLink?: string
  shareCode?: string
  shareTitle?: string
  shareDescription?: string
  shareImage?: string
  permission: 'read' | 'write' | 'admin'
  expiresAt?: string
  createdAt: string
  viewCount: number
  downloadCount: number
  status: 'active' | 'expired' | 'revoked'
  sharedWith?: string
}

// 通知相关接口

// 获取我的所有分享通知
export function getShareNotifications() {
  return request.get<ShareNotification[]>('/resource/share/notifications')
}

// 获取未读通知
export function getUnreadShareNotifications(username: string) {
  return request.get<ShareNotification[]>(`/resource/share/notifications/unread?username=${username}`)
}

// 标记单条通知为已读
export function markShareNotificationRead(notificationId: number, username: string) {
  return request.post<{ success: boolean }>(`/resource/share/notifications/${notificationId}/read?username=${username}`)
}

// 标记全部为已读
export function markAllShareNotificationsRead(username: string) {
  return request.post<{ success: boolean }>(`/resource/share/notifications/read-all?username=${username}`)
}

// 分享相关接口

// 创建通用分享
export function createShare(data: {
  resourceId: number
  shareType: 'user' | 'class' | 'link'
  userIds?: string[]
  classIds?: string[]
  permission?: 'read' | 'write' | 'admin'
  expiresAt?: string
  shareTitle?: string
  shareDescription?: string
  shareImage?: string
  enableDownload?: boolean
  enableComment?: boolean
  sharedBy: string
}) {
  return request.post<ShareInfo>('/resource/share', data)
}

// 创建链接分享
export function createLinkShare(data: {
  resourceId: number
  shareTitle?: string
  shareDescription?: string
  sharedBy: string
}) {
  return request.post<ShareInfo>('/resource/share/link', data)
}

// 获取我发起的所有分享
export function getMyShares() {
  return request.get<ShareInfo[]>('/resource/share/my')
}

// 获取分享给我的所有资源
export function getSharesWithMe() {
  return request.get<ShareInfo[]>('/resource-share/shared-with-me')
}

// 获取单条分享详情
export function getShareDetail(shareId: number) {
  return request.get<ShareInfo>(`/resource/share/${shareId}`)
}

// 访问分享链接
export function accessShareLink(shareLink: string) {
  return request.get<ShareInfo>(`/resource/share/link/${shareLink}`)
}

// 下载分享资源
export function downloadShareResource(shareId: number) {
  return request.post<{ success: boolean }>(`/resource/share/${shareId}/download`)
}

// 获取资源的分享统计
export function getShareStatistics(resourceId: number) {
  return request.get<ShareStatistics>(`/resource/share/statistics?resourceId=${resourceId}`)
}

// 删除/撤销分享
export function deleteShare(shareId: number) {
  return request.delete<{ success: boolean }>(`/resource/share/${shareId}`)
}

// 修改分享信息
export function updateShare(shareId: number, data: any) {
  return request.put<ShareInfo>(`/resource/share/${shareId}`, data)
}

// 获取某资源的所有分享记录
export function getResourceShares(resourceId: number) {
  return request.get<ShareInfo[]>(`/resource/share/resource/${resourceId}`)
} 