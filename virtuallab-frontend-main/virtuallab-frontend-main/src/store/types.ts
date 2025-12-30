export interface ExperimentProject {
    id: number
    name: string
    description: string
    category: string
    createdAt: string  // 注意这里改为驼峰
    auditStatus: 'draft' | 'pending' | 'approved' | 'rejected'  // 改为驼峰
    // 其他字段如果有需要也可以添加
    publishStatus: 'draft' | 'published' | 'unpublished' // 发布状态
    publishTime: string // 发布时间
    level: string | null
    // 媒体资源
    imageUrl: string | null
    videoUrl: string | null
    updatedAt: string  // 数据库格式: "YYYY-MM-DD HH:mm:ss"
    auditComment: string | null
    auditorId: number | null
    auditTime: string | null  // 数据库格式: "YYYY-MM-DD HH:mm:ss"
    // 创建者信息
    createdBy: string | null
}

export interface ExperimentProjectAuditLog {
    id: number
    projectId: number
    projectName: string
    status: 'approved' | 'rejected'
    comment?: string
    auditorId: number
    auditorName: string
    auditTime: string
}

export interface Notification {
    id: number;
    userId: number;
    type: string; // 使用字符串类型，或者定义具体的枚举值
    title: string;
    content: string;
    isRead: boolean; // 后端使用的是 isRead
    link?: string;
    relatedId?: number; // 后端有相关ID
    createdAt: string; // 后端使用 createdAt
}
