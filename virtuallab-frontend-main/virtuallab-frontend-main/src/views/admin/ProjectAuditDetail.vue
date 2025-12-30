<template>
  <div class="audit-detail-container">
    <!-- 顶部标题和状态 -->
    <div class="header">
      <div class="title-container">
        <el-button class="back-btn" @click="goBack">
          <i class="el-icon-arrow-left" style="margin-right:6px;"></i>
          返回
        </el-button>
        <h1>{{ project.name || '未命名项目' }}</h1>
        <div class="project-status"
             :class="{
               'status-approved': project.auditStatus === 'approved',
               'status-rejected': project.auditStatus === 'rejected',
               'status-pending': project.auditStatus === 'pending',
               'status-draft': project.auditStatus === 'draft'
             }">
          {{
            project.auditStatus === 'approved' ? '已通过' :
                project.auditStatus === 'rejected' ? '已驳回' :
                    project.auditStatus === 'pending' ? '待审核' :
                        project.auditStatus === 'draft' ? '草稿' :
                            '未知状态'
          }}
        </div>
      </div>
    </div>

    <div class="content">
      <!-- 左侧项目详情 -->
      <div class="main-content">
        <!-- 项目基本信息卡片 -->
        <el-card shadow="never" class="card">
          <div class="card-title">
            <el-icon><Document /></el-icon>
            <span>项目基本信息</span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">项目ID</div>
              <div class="info-value">#{{ project.id }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">项目分类</div>
              <div class="info-value">{{ project.category || '未分类' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">创建者</div>
              <div class="info-value">{{ project.createdBy || '未知' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">创建时间</div>
              <div class="info-value">{{ formatTime(project.createdAt) }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">最后更新时间</div>
              <div class="info-value">{{ formatTime(project.updatedAt) }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">难度级别</div>
              <div class="info-value">{{ project.level || '未设置' }}</div>
            </div>

            <div class="info-item">
              <div class="info-label">发布状态</div>
              <div class="info-value">
                <el-tag :type="project.publishStatus === 'published' ? 'success' : 'info'">
                  {{ getPublishStatusText(project.publishStatus) }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="card-title" style="margin-top: 25px">
            <el-icon><Tickets /></el-icon>
            <span>项目描述</span>
          </div>

          <div class="description">
            {{ project.description || '暂无项目描述' }}
          </div>

          <!-- 驳回原因展示 -->
          <template v-if="project.auditStatus === 'rejected' && project.auditComment">
            <div class="card-title" style="margin-top: 25px">
              <el-icon><Warning /></el-icon>
              <span>驳回原因</span>
            </div>

            <div class="rejection-reason">
              <div class="reason-title">
                <el-icon><Close /></el-icon>
                <span>项目未通过审核原因</span>
              </div>
              <div class="reason-content">
                {{ project.auditComment }}
              </div>
            </div>
          </template>

          <!-- 媒体资源展示 -->
          <div class="card-title" style="margin-top: 25px">
            <el-icon><Picture /></el-icon>
            <span>媒体资源</span>
          </div>

          <div class="media-container">
            <div v-if="project.imageUrl" class="media-item">
              <div class="media-label">项目图片</div>
              <el-image
                  :src="project.imageUrl"
                  fit="cover"
                  class="project-image"
                  :preview-src-list="[project.imageUrl]"
                  hide-on-click-modal
              />
            </div>

            <div v-if="project.videoUrl" class="media-item">
              <el-button
                  type="primary"
                  class="simulation-btn"
                  @click="startSimulation"
              >
                <i class="el-icon-video-play" style="margin-right:6px;"></i>
                开始仿真实验
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧项目概览 -->
      <div class="sidebar">
        <el-card shadow="never" class="card info-card">
          <div class="card-title">
            <el-icon><DataAnalysis /></el-icon>
            <span>项目概览</span>
          </div>

          <div class="info-item">
            <div class="info-label">审核状态</div>
            <div class="info-value">
              <el-tag
                  :type="
                  project.auditStatus === 'approved' ? 'success' :
                  project.auditStatus === 'rejected' ? 'danger' :
                  project.auditStatus === 'pending' ? 'warning' :
                  'info'
              ">
                {{ getAuditStatusText(project.auditStatus) }}
              </el-tag>
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">审核人</div>
            <div class="info-value">{{ project.auditorId ? `ID: ${project.auditorId}` : '无' }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">审核时间</div>
            <div class="info-value">{{ project.auditTime ? formatTime(project.auditTime) : '未审核' }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">发布时间</div>
            <div class="info-value">{{ project.publishTime ? formatTime(project.publishTime) : '未发布' }}</div>
          </div>

          <div class="divider"></div>

          <div class="action-buttons">
            <el-button
                v-if="project.auditStatus === 'pending'"
                type="primary"
                class="audit-btn"
                @click="goToAudit"
            >
              立即审核
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectById } from '@/api/audit'
import type { ExperimentProject } from '@/store/types'
import { watch } from 'vue';
import {
  Document,
  Tickets,
  Warning,
  Close,
  DataAnalysis,
  Picture
} from '@element-plus/icons-vue'
import axios from 'axios';
import { ElMessage } from "element-plus";

const route = useRoute()
const router = useRouter()
const projectId = ref(Number(route.params.projectId));
const project = ref<ExperimentProject>({
  id: 1,
  name: '无名',
  description: '',
  category: '',
  createdAt: '',
  updatedAt: '',
  auditStatus: 'pending',
  auditComment: null,
  createdBy: null,
  level: null,
  imageUrl: null,
  videoUrl: null,
  publishStatus: 'unpublished',
  publishTime: '2025-07-02 09:57:50',
  auditorId: null,
  auditTime: null
})
const loading = ref(true)

// 监听路由参数变化
watch(() => route.params.projectId, (newId) => {
  projectId.value = Number(newId);
  fetchProject();
});

// 获取审核状态文本
const getAuditStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
  }
  return statusMap[status] || status
}

// 获取发布状态文本
const getPublishStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    unpublished: '未发布'
  }
  return statusMap[status] || status
}

// 格式化时间
const formatTime = (time: string | null | undefined) => {
  if (!time) return '未设置时间'
  try {
    const date = new Date(time)
    return isNaN(date.getTime())
        ? '无效日期'
        : date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
  } catch (e) {
    console.error('日期格式化错误:', e)
    return '无效日期'
  }
}

// 获取项目详情
const fetchProject = async () => {
  try {
    loading.value = true
    const response = await axios.get(`http://localhost:8080/experiment/project/${projectId.value}`);

    if (response.data) {
      project.value = response.data;
    } else {
      console.log('API 返回空数据');
    }
  } catch (error) {
    console.error('请求失败:', error);
    ElMessage.error(`请求失败`);
  } finally {
    loading.value = false;
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 开始仿真实验
const startSimulation = () => {
  if (project.value.videoUrl) {
    window.open(project.value.videoUrl, '_blank')
  } else {
    ElMessage.warning('没有可用的仿真实验链接')
  }
}

// 前往审核页面
const goToAudit = () => {
  router.push(`/department/project-audit-direct/${projectId.value}`)
}

onMounted(() => {
  fetchProject()
})
</script>

<style scoped lang="scss">
.audit-detail-container {
  padding: 32px;
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(255,255,255,0.97);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.08);
  border: 1px solid #ede9fe;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  background: linear-gradient(90deg,#f5f3ff 60%,#ede9fe 100%);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(124,58,237,0.08);
  color: #7c3aed;
  border: 1.5px solid #ede9fe;
  padding: 8px 20px 8px 16px;
  font-size: 16px;
  transition: all 0.3s;
}

.back-btn:hover {
  transform: translateX(-3px);
  box-shadow: 0 4px 12px rgba(124,58,237,0.15);
}

.title-container h1 {
  font-size: 2.1rem;
  color: #7c3aed;
  margin: 0;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(168, 85, 247, 0.08);
}

.project-status {
  font-size: 16px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(168, 85, 247, 0.15);
}

.status-approved {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.status-rejected {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.status-pending {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.status-draft {
  background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
  color: #909399;
  border: 1px solid #e9e9eb;
}

.content {
  display: flex;
  gap: 24px;
}

.main-content {
  flex: 1;
}

.sidebar {
  width: 320px;
}

.card {
  background: rgba(255,255,255,0.97);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.08);
  margin-bottom: 24px;
  border: 1px solid #ede9fe;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #7c3aed;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ede9fe;
}

.card-title .el-icon {
  background: #f3e8ff;
  padding: 8px;
  border-radius: 10px;
  color: #7c3aed;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: #a78bfa;
  margin-bottom: 6px;
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  color: #6d28d9;
  font-weight: 600;
  padding: 8px 12px;
  background: #f5f3ff;
  border-radius: 8px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.description {
  line-height: 1.8;
  color: #6d28d9;
  padding: 16px;
  background: #f5f3ff;
  border-radius: 12px;
  margin-top: 10px;
  border: 1px solid #ede9fe;
}

.rejection-reason {
  padding: 20px;
  background: #fef0f0;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid #fde2e2;
}

.reason-title {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reason-content {
  color: #f56c6c;
  line-height: 1.6;
  padding-left: 28px;
}

.media-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-image {
  width: 100%;
  max-width: 500px;
  height: 280px;
  border-radius: 12px;
  border: 1px solid #ede9fe;
  background: #f5f3ff;
  object-fit: cover;
}

.simulation-btn {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.18);
  border: none;
}

.simulation-btn:hover {
  background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.25);
}

.info-card .info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed #ede9fe;
}

.divider {
  height: 1px;
  background: #ede9fe;
  margin: 20px 0;
}

.action-buttons {
  margin-top: 20px;
}

.audit-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.18);
  border: none;
  width: 100%;
}

.audit-btn:hover {
  background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.25);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .audit-detail-container {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 16px;
  }

  .title-container {
    width: 100%;
    flex-wrap: wrap;
  }

  .title-container h1 {
    font-size: 1.8rem;
  }

  .card {
    padding: 20px;
  }

  .project-image {
    height: 200px;
  }
}
</style>