import request from './request'
import type { Notification } from '@/store/types'

export const getUnreadNotifications = (userId: number) => {
    return request.get<Notification[]>(`/notification/unread`, {
        params: { userId }
    })
}

export const markAsRead = (notificationId: number) => {
    return request.post(`/notification/mark-as-read/${notificationId}`)
}

export const markAllAsRead = (userId: number) => {
    return request.post(`/notification/mark-all-read`, null, {
        params: { userId }
    })
}

export const getNotificationDetail = (notificationId: number) => {
    return request.get<Notification>(`/notification/${notificationId}`)
}


/**
 * 删除通知
 * @param notificationId 通知ID
 */
export const deleteNotification = (notificationId: number) => {
    return request.delete(`/notification/${notificationId}`)
}

// notification.ts
export const getAllNotifications = (userId: number) => {
    return request.get<Notification[]>(`/notification/all`, {
        params: { userId }
    })
}
