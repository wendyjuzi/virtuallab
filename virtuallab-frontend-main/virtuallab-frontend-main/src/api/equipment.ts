import request from './request'

export function fetchEquipmentList(params) {
    return request({
        url: '/equipment/page',
        method: 'get',
        params
    })
}

export function getEquipmentById(id) {
    return request({
        url: `/equipment/${id}`,
        method: 'get'
    })
}

export function createEquipment(data) {
    return request({
        url: '/equipment',
        method: 'post',
        data
    })
}

export function updateEquipment(data) {
    return request({
        url: `/equipment/${data.equipmentId}`,
        method: 'put',
        data
    })
}

export function deleteEquipment(id) {
    return request({
        url: `/equipment/${id}`,
        method: 'delete'
    })
}

export function fetchEquipmentByDepartment(params) {
    return request({
        url: '/equipment/department/page',
        method: 'get',
        params
    })
}