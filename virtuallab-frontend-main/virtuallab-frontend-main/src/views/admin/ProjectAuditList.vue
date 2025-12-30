<template>
  <div class="audit-list-container">
    <div class="header" style="position:relative;">
      <el-button class="back-btn" @click="$router.back()" type="default" style="position:absolute;left:0;top:50%;transform:translateY(-50%);z-index:2;font-size:16px;padding: 6px 18px 6px 32px;border-radius:20px;box-shadow:0 2px 8px rgba(124,58,237,0.08);color:#7c3aed;border:1.5px solid #ede9fe;background:linear-gradient(90deg,#f5f3ff 60%,#ede9fe 100%);">
        <i class="el-icon-arrow-left" style="margin-right:6px;"></i>返回
      </el-button>
      <h1>实验项目审核</h1>
      <div class="header-actions">
        <el-button
            type="primary"
            @click="navigateToCreate"
            class="create-btn"
        >
          新增项目
        </el-button>
      </div>
    </div>

    <div class="filters-container">
      <div class="filters">
        <el-input
            v-model="searchQuery"
            placeholder="搜索项目名称或描述..."
            clearable
            class="search-input"
            @clear="fetchProjects"
            @keyup.enter="fetchProjects"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>

        <el-select
            v-model="filterStatus"
            placeholder="选择状态"
            clearable
            class="status-filter"
        >
          <el-option label="全部" value="all" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已驳回" value="rejected" />
        </el-select>

        <el-button
            type="primary"
            @click="fetchProjects"
            class="search-btn"
        >
          搜索
        </el-button>
      </div>
    </div>

    <div class="project-list">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="filteredProjects.length === 0" class="empty">
        <el-empty description="未找到符合条件的项目" />
      </div>

      <div v-else class="project-grid">
        <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
        >
          <div class="card-header">
            <h3>{{ project.name }}</h3>
            <el-tag
                :type="getStatusType(project.auditStatus)"
                size="small"
                effect="light"
            >
              {{ getStatusText(project.auditStatus) }}
            </el-tag>
          </div>

          <div class="card-content" @click="viewDetail(project.id)">
            <div class="category">
              <i class="el-icon-folder"></i>
              <span>{{ project.category || '未分类' }}</span>
            </div>
            <p class="description">{{ truncateDescription(project.description) }}</p>
            <div class="meta">
              <div class="creator">
                <i class="el-icon-user"></i>
                <span>{{ project.createdBy || '未知用户' }}</span>
              </div>
              <div class="time">
                <i class="el-icon-time"></i>
                <span>{{ formatTime(project.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="button-group">
              <el-button
                  v-if="project.auditStatus === 'pending'"
                  type="success"
                  @click.stop="directAudit(project.id)"
                  class="audit-btn"
              >
                审核
              </el-button>

              <el-button
                  type="primary"
                  @click.stop="viewDetail(project.id)"
                  class="view-btn"
              >
                查看
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页区域 -->
    <div class="pagination">
      <el-pagination
          background
          layout="prev, pager, next, jumper, total"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  getPendingProjects,
  getApprovedProjects,
  getRejectedProjects,
  getAllProjects
} from '@/api/audit'
import type { ExperimentProject } from '@/store/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const projects = ref<ExperimentProject[]>([])
const loading = ref(false)
const filterStatus = ref('pending') // 默认显示待审核项目
const filterCategory = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const userStore = useUserStore()
const currentUserDepartment = computed(() => userStore.userDepartment || '')

// 模拟项目分类
const categories = ref([
  '计算机网络', '操作系统', '数据结构',
  '人工智能', '数据库系统', '软件工程',
  '计算机组成', '算法设计', '网络安全'
])

const filteredProjects = computed(() => {
  return projects.value
})

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    draft: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    draft: '草稿'
  }
  return texts[status] || status
}

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

const truncateDescription = (desc: string | undefined) => {
  if (!desc) return '暂无描述'
  return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
}

const fetchProjects = async () => {
  try {
    loading.value = true

    // 使用当前用户的院系作为参数
    let res
    switch(filterStatus.value) {
      case 'pending':
        res = await getPendingProjects(
            searchQuery.value,
            currentUserDepartment.value,  // 直接传递用户院系
            currentPage.value,
            pageSize.value
        )
        break
      case 'approved':
        res = await getApprovedProjects(
            searchQuery.value,
            currentUserDepartment.value,  // 直接传递用户院系
            currentPage.value,
            pageSize.value
        )
        break
      case 'rejected':
        res = await getRejectedProjects(
            searchQuery.value,
            currentUserDepartment.value,  // 直接传递用户院系
            currentPage.value,
            pageSize.value
        )
        break
      default: // all
        res = await getAllProjects(
            searchQuery.value,
            currentUserDepartment.value,  // 直接传递用户院系
            currentPage.value,
            pageSize.value
        )
    }

    // 修正点：正确提取分页数据
    const resData = res.data || {}
    projects.value = resData.records || []  // 提取实际项目数组
    total.value = resData.total || 0        // 提取总记录数

    // 可选：调试日志
    console.log("项目数据:", projects.value)
    console.log("分页信息:", `总数:${total.value}`)
  } catch (error) {
    console.error('获取项目失败', error)
    ElMessage.error('获取项目数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const viewDetail = (projectId: number) => {
  router.push(`/department/project-audit/${projectId}`)
}

const directAudit = (projectId: number) => {
  router.push(`/department/project-audit-direct/${projectId}`)
}

const navigateToCreate = () => {
  router.push('/experiment/create')
}

const confirmDelete = (project: ExperimentProject) => {
  ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？此操作不可撤销。`,
      '删除项目确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        customClass: 'delete-confirm-dialog'
      }
  ).then(async () => {
    await handleDelete(project.id)
  }).catch(() => {
    // 取消删除
  })
}

const handleDelete = async (projectId: number) => {
  try {
    loading.value = true
    // 调用删除API
    ElMessage.success('项目删除成功')
    // 重新加载项目列表
    await fetchProjects()
  } catch (error) {
    console.error('删除项目失败', error)
    ElMessage.error('删除项目失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchProjects()
}

// 初始化时获取项目数据
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
/* 基础容器样式 */
.audit-list-container {
  padding: 32px;
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  min-height: 100vh;
}

/* 头部区域样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 20px 0 120px;
}

.header h1 {
  font-size: 2.1rem;
  color: #7c3aed;
  margin: 0;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(168, 85, 247, 0.08);
}

/* 筛选区域样式 */
.filters-container {
  background: rgba(255,255,255,0.95);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.08);
  margin-bottom: 32px;
  border: 1px solid #ede9fe;
}

.filters {
  display: flex;
  gap: 18px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.10);
}

.status-filter, .category-filter {
  width: 180px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.10);
}

/* 项目列表区域 */
.project-list {
  background: rgba(255,255,255,0.97);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.08);
  margin-bottom: 32px;
  border: 1px solid #ede9fe;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
}

/* 项目卡片样式 */
.project-card {
  background: linear-gradient(135deg, #f5f3ff 60%, #ede9fe 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(124,58,237,0.10);
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid #ede9fe;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 12px 30px rgba(124,58,237,0.18);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 25px;
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  border-bottom: 1px solid #ede9fe;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #7c3aed;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  padding-right: 15px;
}

.card-content {
  padding: 25px;
  flex: 1;
  cursor: pointer;
  transition: background-color 0.3s;
}

.card-content:hover {
  background-color: #f3e8ff;
}

.category {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #a78bfa;
  font-size: 0.95rem;
  font-weight: 500;
}

.category i {
  font-size: 1.2rem;
  color: #a78bfa;
}

.description {
  color: #6d28d9;
  line-height: 1.7;
  min-height: 70px;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #a78bfa;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #ede9fe;
}

.creator, .time {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 卡片底部按钮区域 */
.card-footer {
  padding: 18px 25px;
  border-top: 1px solid #ede9fe;
  display: flex;
  justify-content: flex-end; /* 按钮靠右对齐 */
  background-color: #f5f3ff;
}

/* 分页区域 */
.pagination {
  display: flex;
  justify-content: center;
  padding: 28px;
  background: rgba(255,255,255,0.97);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.08);
  border: 1px solid #ede9fe;
}

.loading, .empty {
  padding: 50px;
  text-align: center;
}

/* 按钮全局样式 */
.audit-list-container :deep(.el-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 26px;
  border-radius: 10px;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-size: 14px;
  font-weight: 600;
  border: none;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 10px rgba(124,58,237,0.08);
}

/* 新增项目按钮 */
.create-btn {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%) !important;
  border-radius: 12px;
  padding: 13px 35px !important;
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.18);
  font-weight: 700;
  font-size: 16px !important;
  letter-spacing: 0.5px;
  color: #fff !important;
}

.create-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.25);
  background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%) !important;
}

/* 审核按钮 */
.audit-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
  min-width: 100px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.18);
  color: #fff !important;
}

.audit-btn:hover {
  background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%) !important;
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.25);
  transform: translateY(-3px);
}

/* 查看按钮 */
.view-btn {
  background: linear-gradient(135deg, #ede9fe 0%, #a78bfa 100%) !important;
  min-width: 100px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.10);
  color: #7c3aed !important;
}

.view-btn:hover {
  background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%) !important;
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.18);
  transform: translateY(-3px);
}

/* 搜索按钮 */
.search-btn {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%) !important;
  padding: 0 40px !important;
  height: 44px;
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.18);
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #fff !important;
}

.search-btn:hover {
  background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%) !important;
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.25);
  transform: translateY(-3px);
}
.button-group {
  display: flex;
  gap: 12px; /* 按钮间距 */
}
/* 状态标签样式 */
.el-tag {
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(168,85,247,0.08);
  min-width: 80px;
  text-align: center;
  background: #ede9fe !important;
  color: #7c3aed !important;
  border: none !important;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .filters {
    flex-wrap: wrap;
  }

  .search-input, .status-filter, .category-filter {
    width: 100%;
    max-width: none;
  }

  .project-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .audit-list-container {
    padding: 15px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filters-container, .project-list, .pagination {
    padding: 20px;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-wrap: wrap;
  }

  .card-footer .el-button {
    flex: 1 0 45%;
    margin-bottom: 10px;
  }
}
</style>