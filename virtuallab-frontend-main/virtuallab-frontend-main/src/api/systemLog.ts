import request from './request'

export interface OperationLog {
    id: number
    userId?: number
    username?: string
    operation?: string
    module?: string
    description?: string
    requestMethod?: string
    requestUrl?: string
    requestParams?: string
    responseResult?: string
    ipAddress?: string
    userAgent?: string
    executionTime?: number
    status?: number
    errorMessage?: string
    createTime?: string
    permissionCode?: string
}

// 查询日志（支持条件组合）
export function queryLogs(params: {
    username?: string
    operation?: string
    module?: string
    status?: number
    startTime?: string
    endTime?: string
    page?: number
    size?: number
}) {
    return request.get<{ data: OperationLog[]; total?: number }>('/system/logs', { params })
}

// 获取全部简单日志
export function getAllLogs() {
    return request.get<OperationLog[]>('/system/logs/simple/list')
}