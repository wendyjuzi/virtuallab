import request from './request'
import type { ExperimentProject, ExperimentProjectAuditLog } from '@/store/types'


/**
 * 根据ID获取实验项目
 * @param projectId 项目ID
 */
export function getProjectById(projectId: number) {
    return request.get<ExperimentProject>(`/api/experiment/project/${projectId}`)
}

/**
 * 审核实验项目
 * @param projectId 项目ID
 * @param status 审核状态 (approved/rejected)
 * @param comment 审核意见
 * @param auditorId 审核人ID
 */
export function auditProject(
    projectId: number,
    status: string,
    comment: string,
    auditorId: number
) {
    return request.post(`/experiment/project/audit/audit/${projectId}`, null, {
        params: { status, comment, auditorId }
    })
}

/**
 * 发布实验项目到班级
 * @param projectId 项目ID
 */
export function publishProject(projectId: number) {
    return request.post(`/experiment/project/audit/publish/${projectId}`)
}

/**
 * 获取待审核实验项目列表
 */
export function getPendingProjects(
    keyword?: string,
    department?: string,
    pageNum?: number,
    pageSize?: number
) {
    return request({
        url: '/experiment/project/audit/pending',
        method: 'get',
        params: { keyword, department, pageNum, pageSize }
    })
}

/**
 * 获取实验项目审核历史
 * @param projectId 项目ID
 */
export function getAuditHistory(projectId: number) {
    return request.get<ExperimentProjectAuditLog[]>(
        `/experiment/project/audit/history/${projectId}`
    )
}

/**
 * 获取已发布班级
 * @param projectId 项目ID
 */
export function getPublishedClasses(projectId: number) {
    return request.get<number[]>(
        `/experiment/project/audit/published-classes/${projectId}`
    )
}

/**
 * 获取所有实验项目（包含各种状态）
 */
export function getAllProjects(
    keyword?: string,
    department?: string,
    pageNum?: number,
    pageSize?: number
) {
    return request({
        url: '/experiment/project/audit/all',
        method: 'get',
        params: { keyword, department, pageNum, pageSize }
    })
}

/**
 * 获取已通过实验项目列表
 */
export function getApprovedProjects(
    keyword?: string,
    department?: string,
    pageNum?: number,
    pageSize?: number
) {
    return request({
        url: '/experiment/project/audit/approved',
        method: 'get',
        params: { keyword, department, pageNum, pageSize }
    })
}

/**
 * 获取已驳回实验项目列表
 */
export function getRejectedProjects(
    keyword?: string,
    department?: string,
    pageNum?: number,
    pageSize?: number
) {
    return request({
        url: '/experiment/project/audit/rejected',
        method: 'get',
        params: { keyword, department, pageNum, pageSize }
    })
}

/**
 * 获取可用班级列表
 */
export function getAvailableClasses() {
    return request.get<any[]>('/classes/available')
}

/**
 * 提交实验项目审核（将草稿状态改为待审核）
 * @param projectId 项目ID
 */
export function submitProjectForAudit(projectId: number) {
    return request.post(`/experiment/project/audit/submit/${projectId}`)
}

// 获取院系审核日志
// audit.js
// audit.js
export const getAuditLogsByDepartment = (
    department: string,
    keyword: string | null,
    page: number,
    size: number
) => {
    return request({
        url: '/api/audit-logs',
        method: 'get',
        params: {
            department,
            keyword: keyword || undefined, // 将空值转为undefined
            page,
            size
        }
    });
};
