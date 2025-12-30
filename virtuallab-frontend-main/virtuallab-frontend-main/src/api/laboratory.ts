import request from './request'

export function fetchLabList(params) {
    return request({
        url: '/laboratories',
        method: 'get',
        params
    })
}

export function getLabById(id) {
    return request({
        url: `/laboratories/${id}`,
        method: 'get'
    })
}

export function createLab(data) {
    return request({
        url: '/laboratories',
        method: 'post',
        data
    })
}

export function updateLab(data) {
    return request({
        url: '/laboratories',
        method: 'put',
        data
    })
}

export function deleteLab(id) {
    return request({
        url: `/laboratories/${id}`,
        method: 'delete'
    })
}

// 获取所有实验室列表（不分页）
export function fetchLaboratoryList(params = {}) {
    return request({
        url: '/laboratories',
        method: 'get',
        params: {
            pageSize: 1000, // 获取足够多的数据
            ...params
        }
    })
}