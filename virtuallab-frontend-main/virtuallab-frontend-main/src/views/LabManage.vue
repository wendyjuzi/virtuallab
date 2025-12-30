<template>
  <div class="lab-reservation-admin">
    <!-- 顶部导航 -->
    <div class="reservation-header">
      <h1><i class="icon-lab"></i> 实验室管理系统（管理员）</h1>
    </div>

    <!-- 主要内容区 -->
    <div class="reservation-container">
      <!-- 待审批预约表格 -->
      <div class="reservation-table-container">
        <div class="table-header">
          <h2><i class="icon-pending"></i> 待审批预约</h2>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="refreshData">
              <i class="icon-refresh"></i> 刷新数据
            </el-button>
          </div>
        </div>

        <div class="table-wrapper">
          <el-table
              :data="pendingPaginatedData"
              style="width: 100%"
              border
              stripe
              v-loading="loading"
              :empty-text="pendingEmptyText"
          >
            <el-table-column
                prop="lab_name"
                label="实验室"
                width="180"
            >
              <template #header>
                <div class="column-header">
                  <i class="icon-lab"></i>
                  <span>实验室</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column
                label="预约时间"
                width="240"
            >
              <template #header>
                <div class="column-header">
                  <i class="icon-time"></i>
                  <span>预约时间</span>
                </div>
              </template>
              <template #default="{ row }">
                <div class="time-range">
                  <div class="time-item">
                    <el-icon><clock /></el-icon>
                    <span>{{ formatDateTime(row.start_time) }}</span>
                  </div>
                  <div class="time-separator">至</div>
                  <div class="time-item">
                    <el-icon><clock /></el-icon>
                    <span>{{ formatDateTime(row.end_time) }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column
                prop="username"
                label="申请人"
                width="120"
            />

            <el-table-column
                prop="purpose"
                label="预约用途"
                min-width="200"
            >
              <template #header>
                <div class="column-header">
                  <i class="icon-purpose"></i>
                  <span>预约用途</span>
                </div>
              </template>
              <template #default="{ row }">
                <div class="purpose-text">
                  {{ truncateText(row.purpose, 30) }}
                </div>
              </template>
            </el-table-column>

            <el-table-column
                label="操作"
                width="200"
            >
              <template #header>
                <div class="column-header">
                  <i class="icon-action"></i>
                  <span>操作</span>
                </div>
              </template>
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                      type="success"
                      size="small"
                      @click="approve(row)"
                  >
                    通过
                  </el-button>
                  <el-button
                      type="danger"
                      size="small"
                      @click="reject(row)"
                  >
                    拒绝
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-container" v-if="pendingReservations.length > 0">
          <el-pagination
              v-model:current-page="pendingCurrentPage"
              v-model:page-size="pendingPageSize"
              :total="pendingReservations.length"
              :page-sizes="[5, 10, 20]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePendingSizeChange"
              @current-change="handlePendingPageChange"
          />
        </div>
      </div>

      <!-- 已审批预约表格 -->
      <div class="reservation-table-container">
        <div class="table-header">
          <h2><i class="icon-approved"></i> 已审批预约</h2>
        </div>

        <div class="table-wrapper">
          <el-table
              :data="processedPaginatedData"
              style="width: 100%"
              border
              stripe
              v-loading="loading"
              :empty-text="processedEmptyText"
          >
            <el-table-column
                prop="lab_name"
                label="实验室"
                width="180"
            >
              <template #header>
                <div class="column-header">
                  <i class="icon-lab"></i>
                  <span>实验室</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column
                label="预约时间"
                width="240"
            >
              <template #header>
                <div class="column-header">
                  <i class="icon-time"></i>
                  <span>预约时间</span>
                </div>
              </template>
              <template #default="{ row }">
                <div class="time-range">
                  <div class="time-item">
                    <el-icon><clock /></el-icon>
                    <span>{{ formatDateTime(row.start_time) }}</span>
                  </div>
                  <div class="time-separator">至</div>
                  <div class="time-item">
                    <el-icon><clock /></el-icon>
                    <span>{{ formatDateTime(row.end_time) }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column
                prop="username"
                label="申请人"
                width="120"
            />

            <el-table-column
                prop="purpose"
                label="预约用途"
                min-width="200"
            >
              <template #header>
                <div class="column-header">
                  <i class="icon-purpose"></i>
                  <span>预约用途</span>
                </div>
              </template>
              <template #default="{ row }">
                <div class="purpose-text">
                  {{ truncateText(row.purpose, 30) }}
                </div>
              </template>
            </el-table-column>

            <el-table-column
                label="状态"
                width="140"
                prop="status"
            >
              <template #header>
                <div class="column-header">
                  <i class="icon-status"></i>
                  <span>状态</span>
                </div>
              </template>
              <template #default="{ row }">
                <el-tag
                    :type="getStatusTagType(row.status)"
                    size="small"
                    :class="'status-tag-' + row.status"
                    effect="light"
                >
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-container" v-if="processedReservations.length > 0">
          <el-pagination
              v-model:current-page="processedCurrentPage"
              v-model:page-size="processedPageSize"
              :total="processedReservations.length"
              :page-sizes="[5, 10, 20]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleProcessedSizeChange"
              @current-change="handleProcessedPageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Clock } from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  getPendingReservations,
  getProcessedReservations,
  rejectReservation,
  approveReservation
} from "@/api/LabReservation";
import {useUserStore} from "@/store/user";
import {storeToRefs} from "pinia";

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const userId = computed(() => user.value?.id)
console.log("获取到的admin_id为:", userId.value)

// 预约记录数据
const allReservations = ref<any[]>([]);
const loading = ref(false)

// 分页相关 - 待审批
const pendingCurrentPage = ref(1)
const pendingPageSize = ref(10)
const pendingEmptyText = ref('暂无待审批预约')

// 分页相关 - 已审批
const processedCurrentPage = ref(1)
const processedPageSize = ref(10)
const processedEmptyText = ref('暂无已审批预约')

// 计算属性 - 过滤掉已取消的预约并按状态分类
const pendingReservations = computed(() => {
  return allReservations.value.filter(reservation =>
      reservation.status === 'pending'
  )
})

const processedReservations = computed(() => {
  return allReservations.value.filter(reservation =>
      reservation.status === 'approved' || reservation.status === 'rejected'
  )
})

// 计算属性 - 分页数据
const pendingPaginatedData = computed(() => {
  const start = (pendingCurrentPage.value - 1) * pendingPageSize.value
  const end = start + pendingPageSize.value
  return pendingReservations.value.slice(start, end)
})

const processedPaginatedData = computed(() => {
  const start = (processedCurrentPage.value - 1) * processedPageSize.value
  const end = start + processedPageSize.value
  return processedReservations.value.slice(start, end)
})

// 方法定义
const refreshData = async () => {
  await fetchReservations()
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'danger'
    default: return ''
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return '已通过'
    case 'pending': return '待审核'
    case 'rejected': return '已拒绝'
    default: return status
  }
}

// 审批预约
const approve = async (reservation: any) => {
  try {
    await approveReservation(reservation.reservation_id)
    console.log('审批预约通过:', reservation.reservation_id)
    await fetchReservations()
  } catch (error) {
    console.error('审批预约失败:', error)
    ElMessage.error('审批预约失败')
  }
}

// 拒绝预约
const reject = async (reservation: any) => {
  try {
    await rejectReservation(reservation.reservation_id)
    console.log('审批预约拒绝:', reservation.reservation_id)
    ElMessage.success('预约已拒绝')
    await fetchReservations()
  } catch (error) {
    if(error !== 'cancel') {
      console.error('拒绝预约失败:', error)
      ElMessage.error('拒绝预约失败')
    }
  }
}

// 获取所有预约
const fetchReservations = async () => {
  try {
    loading.value = true
    const [pendingRes, processedRes] = await Promise.all([
      getPendingReservations(),
      getProcessedReservations()
    ])

    // 合并数据并过滤掉已取消的
    allReservations.value = [
      ...(pendingRes?.data ?? pendingRes),
      ...(processedRes?.data ?? processedRes)
    ].filter(res => res.status !== 'cancelled')

    pendingEmptyText.value = pendingReservations.value.length === 0 ? '暂无待审批预约' : ''
    processedEmptyText.value = processedReservations.value.length === 0 ? '暂无已审批预约' : ''
  } catch (error) {
    console.error('获取预约数据失败:', error)
    ElMessage.error('获取预约数据失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handlePendingSizeChange = (size: number) => {
  pendingPageSize.value = size
}

const handlePendingPageChange = (page: number) => {
  pendingCurrentPage.value = page
}

const handleProcessedSizeChange = (size: number) => {
  processedPageSize.value = size
}

const handleProcessedPageChange = (page: number) => {
  processedCurrentPage.value = page
}

// 文字截断
const truncateText = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 初始化数据
onMounted(async () => {
  await fetchReservations()
})
</script>

<style scoped lang="scss">
/* 样式部分保持不变，与之前相同 */
.lab-reservation-admin {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0;
    font-size: 20px;
    display: flex;
    align-items: center;

    i {
      margin-right: 10px;
      font-size: 24px;
    }
  }
}

.reservation-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reservation-table-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  border-radius: 8px;
  border-left: 4px solid #409eff;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    display: flex;
    align-items: center;
    letter-spacing: 0.5px;

    i {
      margin-right: 12px;
      font-size: 24px;
      color: #409eff;
    }
  }
}

.header-actions {
  display: flex;
  gap: 12px;

  .el-button {
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}

.table-wrapper {
  width: 100%;
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
}

.column-header {
  display: flex;
  align-items: center;
  font-weight: 600;

  i {
    margin-right: 10px;
    font-size: 18px;
    color: #409eff;
  }
}

.time-range {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .time-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #333;

    .el-icon {
      color: var(--el-color-primary);
      font-size: 16px;
    }
  }

  .time-separator {
    color: #999;
    font-size: 13px;
    text-align: center;
    margin: 4px 0;
    font-style: italic;
  }
}

.purpose-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
  font-size: 14px;
  color: #555;
}

.action-buttons {
  display: flex;
  gap: 10px;

  .el-button {
    display: flex;
    align-items: center;
    border-radius: 6px;
    padding: 7px 12px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    i {
      margin-right: 6px;
      font-size: 16px;
    }

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

// 状态标签样式
:deep(.el-tag) {
  border-radius: 12px;
  padding: 0 12px;
  height: 26px;
  line-height: 26px;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.status-tag-pending) {
  --el-tag-bg-color: rgba(255, 153, 0, 0.1);
  --el-tag-border-color: rgba(255, 153, 0, 0.2);
  --el-tag-text-color: #ff9900;
}

:deep(.status-tag-approved) {
  --el-tag-bg-color: rgba(103, 194, 58, 0.1);
  --el-tag-border-color: rgba(103, 194, 58, 0.2);
  --el-tag-text-color: #67c23a;
}

:deep(.status-tag-rejected) {
  --el-tag-bg-color: rgba(245, 108, 108, 0.1);
  --el-tag-border-color: rgba(245, 108, 108, 0.2);
  --el-tag-text-color: #f56c6c;
}

// 表格样式优化
:deep(.el-table) {
  --el-table-border-color: #f0f0f0;
  --el-table-header-bg-color: #f9fafc;
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.05);
  --el-table-border: none;
  --el-table-border-radius: 8px;

  th {
    font-weight: 600;
    color: #2c3e50;
    background-color: var(--el-table-header-bg-color);
    height: 52px;

    &.is-leaf {
      border-bottom: 1px solid #f0f0f0;
    }
  }

  td {
    padding: 16px 0;
    border-bottom: 1px solid #f5f5f5;
    transition: background-color 0.3s;
  }

  tr {
    &:hover td {
      background-color: var(--el-table-row-hover-bg-color);
    }

    &:last-child td {
      border-bottom: none;
    }
  }

  &::before {
    display: none;
  }

  .cell {
    padding: 0 16px;
    line-height: 1.5;
  }
}

// 图标样式
[class^="icon-"] {
  font-style: normal;
  font-size: 18px;
}

.icon-lab:before { content: "🧪"; }
.icon-pending:before { content: "⏳"; font-size: 22px; }
.icon-approved:before { content: "✅"; font-size: 22px; }
.icon-time:before { content: "⏱️"; }
.icon-purpose:before { content: "📝"; }
.icon-status:before { content: "🏷️"; }
.icon-action:before { content: "⚙️"; }
.icon-refresh:before { content: "🔄"; }

// 按钮样式优化
.el-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  font-weight: 500;
  letter-spacing: 0.3px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  &.is-disabled {
    opacity: 0.6;
    transform: none !important;
    box-shadow: none !important;
  }
}

// 分页样式优化
:deep(.el-pagination) {
  .btn-prev, .btn-next, .number {
    border-radius: 6px !important;
    margin: 0 4px;
    min-width: 32px;
    height: 32px;
    line-height: 32px;
  }

  .number.active {
    background: linear-gradient(135deg, #409EFF, #3375e0);
    color: white;
    font-weight: 500;
  }

  .el-pagination__total, .el-pagination__jump {
    font-size: 14px;
    color: #666;
  }

  .el-input__inner {
    border-radius: 6px;
    height: 32px;
  }
}
</style>