import axios from 'axios';
import request from './request'

export interface ExperimentProject {
  id: number;
  name: string;
  description: string;
  category: string;
  level: string;
  imageUrl: string;
  videoUrl: string;
}

export function searchProjects(params: {
  category?: string;
  level?: string;
  keyword?: string;
}) {
return axios.get<ExperimentProject[]>('/experiment/project/search', { params });
}

// 用户注册
export function registerUser(data: any) {
  return request.post('/user/register', data)
}

// 分配角色
export function assignRoles(userId: number, roleIds: string[]) {
  return axios.post(`/api/user/assignRoles?userId=${userId}`, roleIds).then(res => res.data)
}
export function getAllProjects() {
    return axios.get<ExperimentProject[]>('/api/experiment/project/list');
}

// export function searchProjects(params: { keyword?: string }) {
//     return axios.get<ExperimentProject[]>('/api/experiment/project/search', { params });
// }

//=================================== 首页展示 ================================


//=================================== 实验报告 ================================
export function getReport(sessionId: any) {
  return request({
    url: `/experiment/report/${sessionId}`,
    method: 'get',
    transformResponse: [
      (data) => {
        try {
          // 处理原始响应文本
          const parsed = typeof data === 'string' ? JSON.parse(data) : data
          // 返回扁平化结构
          return {
            title: parsed.title || '',
            studentId: parsed.studentId || '',
            projectId: parsed.projectId || '',
            manual_content: parsed.manualContent || parsed.manual_content || '',
            principle: parsed.principle || '',
            purpose: parsed.purpose || '',
            category: parsed.category || '',
            method: parsed.method || '',
            steps: parsed.steps || '',
            description: parsed.description || '',
            attachment_path: parsed.attachmentPath || parsed.attachment_path || '',
            original_filename: parsed.originalFilename || parsed.original_filename || '',
            file_size: parsed.file_size || parsed.fileSize || '',
            mime_type: parsed.mimeType || parsed.mime_type || '',
            status: parsed.status || 'DRAFT',
            created_at: parsed.createdAt || parsed.created_at || null,
            updated_at: parsed.updatedAt || parsed.updated_at || null,
            score: parsed.score || null,
            comment: parsed.comment || ''
          }
        } catch (e) {
          return {data: null}
        }
      }]
  })
}

export function getUserByStudentId(studentId: any){
  return request({
    url: `http://localhost:8080/user/student/${studentId}`,
    method: 'get'
  })
}

export function getReportList(studentId: string | number) {
  return request({
    url: `/experiment/students/${studentId}/reports`,
    method: 'get'
  })
}

export function getSubmittedAndGradedReports(){
  return request({
    url: '/experiment/teacher/reports',
    method: 'get',
    params:{
      status: 'SUBMITTED,GRADED'
    }
  })
}
export function saveContent(sessionId: any, data: any){
  return request({
    url: `/experiment/report/${sessionId}/save`,
    method: 'post',
    params:{
      manualContent: data.manual_content,
      status: data.status
    }
  })
}

export function submitReport(sessionId: any, data: any) {
  return request({
    url: `/experiment/report/${sessionId}/submit`,
    method: 'post',
    params:{
      status: data.status
    }
  });
}

export function gradeReport(sessionId:any, data: any){
  return request({
    url:`/experiment/teacherReport/${sessionId}/grade`,
    method: 'post',
    params:{
      status:data.status,
      comment: data.comment,
      score: data.score
    }
  })
}

export function uploadAttachment(sessionId: any, file: any) {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: `/experiment/report/${sessionId}/attachment`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type' : 'multipart/form-data'
    },
    timeout: 60000
  });
}

export function downloadAttachment(sessionId: any) {
  return request({
    url: `/experiment/report/${sessionId}/attachment/download`,
    method: 'get',
    responseType: 'blob', // 重要：指定响应类型为blob
    headers: {
      'Cache-Control': 'no-cache'
    }
  }).then(response => {
    return response.data || response;
  })
}

export function deleteAttachment(sessionId: any) {
  return request({
    url: `/experiment/report/${sessionId}/attachment/delete`,
    method: 'delete'
  });
}

// 获取实验列表（用于首页展示）
export function getExperimentList(params: any) {
  return request.get('/system-admin/experiments', { params })
}

// 获取实验详情
export function getExperimentDetail(id: number) {
  return request.get(`/experiment/${id}`);
}

export function createExperiment(data: any) {
  return request.post('/system-admin/experiments', data)
}

export function updateExperiment(data: any) {
  return request.put('/system-admin/experiments', data)
}

export function deleteExperiment(id: number) {
  return request.delete(`/system-admin/experiments/${id}`)
}

// 首先为项目详情定义一个接口类型
interface ProjectDetails {
  id: number,
  projectId: number;
  name: string;
  category: string;
  purpose: string;
  principle: string;
  method: string;
  steps: string;
  publishTime: string;
  description: string;
}

// 获取实验项目详细信息（用于生成报告）
export function getProjectDetailsForReport(projectId: number){
  return request.get<ProjectDetails>(`/experiment/project/details/${projectId}`)
      .then(response => {
        // 打印完整响应用于调试
        console.log('获取到的实验详情为:', response);

        // 检查响应是否存在
        if (!response) {
          throw new Error('接口返回空响应');
        }

        return response;
      });
}

// 发布实验报告
export function publishExperimentReport(data: {
  id: number,
  projectId: number,
  sessionId: string,
  studentIds: number[],// 改为接受数组
  title: string;
  category:string;
  purpose: string;
  principle: string;
  method: string;
  steps: string;
  description: string,
  status: string,
  manualContent: string,
  created_at: string
}) {
  return request.post('/experiment/project/publish-report',
      data,
      {
        params:{
          studentIds: data.studentIds.join(",")
        }
      }
      );
}

// 获取学生ID的函数
export async function getStudentIdForProject(projectId: number) {
  try {
    // 1. 根据projectId获取classId
    const classId = await request.get<number[]>(
        `/student/experiments/project-class/${projectId}`
    );

    console.log('班级ID响应:', classId);

    // 2. 根据classId获取studentId
    const studentIds = await request.get<number[]>(
        `/student/experiments/student-class/${classId}`
    );

    console.log('学生ID响应:', studentIds);
    return studentIds;
  } catch (error) {
    console.error('获取学生ID失败:', error);
    throw error;
  }
}

// ================= 系统管理员实验管理接口 =================

// 分页获取实验列表
export function getAdminExperimentList(params: {
  page?: number;
  size?: number;
  category?: string;
  level?: string;
  keyword?: string;
}) {
  return request.get('/system-admin/experiments', { params });
}

// 获取实验详情
export function getAdminExperimentDetail(id: number) {
  return request.get(`/system-admin/experiments/${id}`);
}

// 创建实验
export function createAdminExperiment(data: any) {
  return request.post('/system-admin/experiments', data);
}

// 更新实验
export function updateAdminExperiment(data: any) {
  return request.put('/system-admin/experiments', data);
}

// 删除实验
export function deleteAdminExperiment(id: number) {
  return request.delete(`/system-admin/experiments/${id}`);
}

// 发布实验
export function publishExperimentApi(data: any) {
  return request({
    url: '/admin/experiment/publish',
    method: 'post',
    data
  })
}

// 获取实验列表
export function getExperimentListApi(params?: any) {
  return request({
    url: '/admin/experiment/list',
    method: 'get',
    params
  })
}

// 获取实验详情
export function getExperimentDetailApi(id: string | number) {
  return request({
    url: `/admin/experiment/${id}`,
    method: 'get'
  })
}

// 更新实验
export function updateExperimentApi(id: string | number, data: any) {
  return request({
    url: `/admin/experiment/${id}`,
    method: 'put',
    data
  })
}

// 删除实验
export function deleteExperimentApi(id: string | number) {
  return request({
    url: `/admin/experiment/${id}`,
    method: 'delete'
  })
}

// 获取实验模板列表
export function getExperimentTemplatesApi() {
  return request({
    url: '/admin/experiment/templates',
    method: 'get'
  })
}

// 保存实验模板
export function saveExperimentTemplateApi(data: any) {
  return request({
    url: '/admin/experiment/template',
    method: 'post',
    data
  })
}

// 获取学科分类
export function getSubjectCategoriesApi() {
  return request({
    url: '/admin/experiment/subjects',
    method: 'get'
  })
}

// 获取年级列表
export function getGradeListApi() {
  return request({
    url: '/admin/experiment/grades',
    method: 'get'
  })
}

// 实验审核
export function reviewExperimentApi(id: string | number, status: string, comment?: string) {
  return request({
    url: `/admin/experiment/${id}/review`,
    method: 'post',
    data: {
      status,
      comment
    }
  })
}

// 批量操作实验
export function batchOperationExperimentApi(ids: string[] | number[], operation: string) {
  return request({
    url: '/admin/experiment/batch',
    method: 'post',
    data: {
      ids,
      operation
    }
  })
}

// 导出实验数据
export function exportExperimentApi(params?: any) {
  return request({
    url: '/admin/experiment/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导入实验数据
export function importExperimentApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/admin/experiment/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

