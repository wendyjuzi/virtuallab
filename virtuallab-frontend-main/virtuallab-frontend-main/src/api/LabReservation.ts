import request from "@/api/request";
import type {ComputedRef} from "vue";

export function getLaboratories() {
    return request({
        url: '/experiment/laboratories',
        method: 'get',
        transformResponse: [
            (data) => {
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    // 确保返回的是数组
                    if (Array.isArray(parsed)) {
                        // 转换字段名格式
                        return parsed.map(item => ({
                            lab_id: item.labId,
                            lab_name: item.labName,
                            location: item.location,
                            capacity: item.capacity,
                            description: item.description,
                            status: item.status,
                            createdAt: item.createdAt
                        }));
                    }
                    return [];
                } catch (e) {
                    console.error('解析实验室数据失败:', e);
                    return [];
                }
            }
        ]
    });
}
export function getReservations(userId: any) {
    return request({
        url: `/experiment/reservations/${userId}`,
        method: 'get',
        transformResponse: [
            (data) => {
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    // 确保返回的是数组
                    if (Array.isArray(parsed)) {
                        return parsed.map(item => ({
                            reservation_id: item.reservationId,
                            user_id: item.userId,
                            lab_id: item.labId,
                            lab_name: item.labName,
                            start_time: item.startTime,
                            end_time: item.endTime,
                            purpose: item.purpose,
                            status: item.status,
                            admin_id: item.adminId,
                            admin_comment: item.adminComment
                        }));
                    }
                    return [];
                } catch (e) {
                    console.error('解析预约数据失败:', e);
                    return [];
                }
            }
        ]
    });
}
// 创建预约
export function createReservation(reservationData: any, userId: any) {
    return request({
        url: `/experiment/reservations/${userId}/reserve`,
        method: 'post',
        data: {
            laboratory: {
                labId: reservationData.laboratory.labId
            },
            startTime: reservationData.startTime,
            endTime: reservationData.endTime,
            purpose: reservationData.purpose,
            userId: reservationData.userId
        },
        transformResponse: [
            (data) => {
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    return {
                        reservationId: parsed.reservationId,
                        ...parsed
                    };
                } catch (e) {
                    console.error('解析预约数据失败:', e);
                    throw e;
                }
            }
        ]
    });
}
// 批准预约
export function approveReservation(reservationId: number) {
    return request({
        url: `/experiment/reservations/${reservationId}/approve`,
        method: 'post'
    });
}
// 拒绝预约
export function rejectReservation(reservationId: number) {
    return request({
        url: `/experiment/reservations/${reservationId}/reject`,
        method: 'post'
    });
}
// 取消预约
export function cancelReservation(reservationId: number, userId: number) {
    return request({
        url: `/experiment/reservations/${reservationId}/cancel`,
        method: 'post',
        params: { userId }
    });
}

export function getPendingReservations() {
    return request({
        url: '/experiment/reservations',
        method: 'get',
        transformResponse: [
            (data) => {
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    // 确保返回的是数组
                    if (Array.isArray(parsed)) {
                        return parsed.map(item => ({
                            reservation_id: item.reservationId,
                            user_id: item.userId,
                            username: item.username,
                            lab_id: item.labId,
                            lab_name: item.labName,
                            start_time: item.startTime,
                            end_time: item.endTime,
                            purpose: item.purpose,
                            status: item.status,
                            admin_id: item.adminId,
                            admin_comment: item.adminComment
                        }));
                    }
                    return [];
                } catch (e) {
                    console.error('解析预约数据失败:', e);
                    return [];
                }
            }
        ]
    });
}

export function getProcessedReservations() {
    return request({
        url: '/experiment/reservations',
        method: 'get',
        transformResponse: [
            (data) => {
                try {
                    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                    // 确保返回的是数组
                    if (Array.isArray(parsed)) {
                        return parsed.map(item => ({
                            reservation_id: item.reservationId,
                            user_id: item.userId,
                            username: item.username,
                            lab_id: item.labId,
                            lab_name: item.labName,
                            start_time: item.startTime,
                            end_time: item.endTime,
                            purpose: item.purpose,
                            status: item.status,
                            admin_id: item.adminId,
                            admin_comment: item.adminComment
                        }));
                    }
                    return [];
                } catch (e) {
                    console.error('解析预约数据失败:', e);
                    return [];
                }
            }
        ]
    });
}