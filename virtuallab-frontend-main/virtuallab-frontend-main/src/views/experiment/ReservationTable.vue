<template>
  <div class="reservation-table-container">
    <div class="table-header">
      <h2><i class="icon-calendar"></i> 我的预约记录</h2>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="refreshData">
          <i class="icon-refresh"></i> 刷新数据
        </el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table
          :data="paginatedData"
          style="width: 100%"
          border
          stripe
          v-loading="loading"
          :empty-text="emptyText"
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

        <el-table-column
            label="操作"
            width="150"
            v-if="showActions"
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
                  v-if="showCancelButton(row.status)"
                  type="danger"
                  size="small"
                  @click="handleCancel(row)"
                  :loading="row.canceling"
                  plain
              >
                <i class="icon-cancel"></i>取消
              </el-button>
              <el-button
                  type="primary"
                  size="small"
                  @click="showDetailDialog(row)"
                  plain
              >
                <i class="icon-view"></i>详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container" v-if="showPagination">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="tableData.length"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        :title="`预约详情 - ${currentDetail?.lab_name}`"
        width="800px"
        class="detail-dialog"
    >
      <div class="detail-content">
        <div class="detail-row">
          <span class="detail-label">实验室名称：</span>
          <span class="detail-value">{{ currentDetail?.lab_name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">预约时间：</span>
          <span class="detail-value">
            {{ formatDateTime(currentDetail?.start_time) }} 至 {{ formatTime(currentDetail?.end_time) }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">预约状态：</span>
          <el-tag
              :type="getStatusTagType(currentDetail?.status)"
              size="medium"
          >
            {{ getStatusText(currentDetail?.status) }}
          </el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">预约用途：</span>
          <span class="detail-value purpose-full">{{ currentDetail?.purpose }}</span>
        </div>
        <div class="detail-row" v-if="currentDetail?.admin_comment">
          <span class="detail-label">管理员备注：</span>
          <span class="detail-value">{{ currentDetail?.admin_comment }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
            v-if="showCancelButton(currentDetail?.status)"
            type="danger"
            @click="handleCancel(currentDetail)"
        >
          取消预约
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watchEffect} from 'vue'
import { Clock } from '@element-plus/icons-vue'
import {cancelReservation} from "@/api/LabReservation";
import {ElMessage} from "element-plus";
import {useUserStore} from "@/store/user";

const userStore = useUserStore()
const currentUser = computed(() => userStore.user)
// 添加监听确保用户数据加载完成
const isUserReady = ref(false)

watchEffect(() => {
  if (currentUser.value?.id) {
    console.log("获取到的用户信息:", currentUser.value)
    isUserReady.value = true
  } else {
    console.log("用户信息尚未加载")
  }
})



interface Reservation {
  id: number | string
  lab_id: number | string
  lab_name: string
  start_time: string
  end_time: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  admin_comment?: string
  [key: string]: any
}

const props = withDefaults(defineProps<{
  data: Reservation[]
  loading?: boolean
  showActions?: boolean
  showPagination?: boolean
  pageSize?: number
  currentPage?: number
  emptyText?: string
}>(), {
  loading: false,
  showActions: true,
  showPagination: true,
  pageSize: 5,
  currentPage: 1,
  emptyText: '暂无预约记录'
})

const emit = defineEmits([
  'cancel',
  'refresh'
])

// 分页相关
const currentPage = ref(props.currentPage)
const pageSize = ref(props.pageSize)

// 详情对话框
const detailDialogVisible = ref(false)
const currentDetail = ref<Reservation | null>(null)

// 处理表格数据
const tableData = computed(() => {
  return props.data.map(item => ({
    ...item,
    canceling: false
  }))
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tableData.value.slice(start, end)
})

// 显示详情对话框
const showDetailDialog = (row: Reservation) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 刷新数据
const refreshData = () => {
  emit('refresh')
}

// 格式化日期时间
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

// 仅格式化时间
const formatTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'danger'
    case 'cancelled': return 'info'
    default: return ''
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return '已通过'
    case 'pending': return '待审核'
    case 'rejected': return '已拒绝'
    case 'cancelled': return '已取消'
    default: return status
  }
}

// 是否显示取消按钮
const showCancelButton = (status: string) => {
  return props.showActions && (status === 'pending')
}

// 处理取消操作
const handleCancel = async (row: Reservation) => {
  const userId = JSON.parse(JSON.stringify(userStore.user)).id;
  try {
    row.canceling = true;

    await cancelReservation(row.reservation_id, userId);
    row.status = 'cancelled';
    ElMessage.success('预约已取消');
    emit('refresh');
  } catch (error) {
    console.error('取消预约失败:', error);
    ElMessage.error('取消预约失败');
  } finally {
    row.canceling = false;
  }
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 文字截断
const truncateText = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}
</script>

<style scoped lang="scss">
.reservation-table-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  width: 100%;
  height: 100%;
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

// 状态标签样式 - 更精致的标签设计
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

:deep(.status-tag-cancelled) {
  --el-tag-bg-color: rgba(144, 147, 153, 0.1);
  --el-tag-border-color: rgba(144, 147, 153, 0.2);
  --el-tag-text-color: #909399;
}

// 表格样式优化 - 更现代的表格设计
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

// 详情对话框样式 - 更精致的对话框
.detail-dialog {
  border-radius: 12px;

  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    margin-right: 0;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 18px;

    .detail-row {
      display: flex;
      align-items: flex-start;
      min-height: 36px;
    }

    .detail-label {
      width: 120px;
      font-weight: 600;
      color: #606266;
      font-size: 15px;
    }

    .detail-value {
      flex: 1;
      color: #303133;
      word-break: break-word;
      font-size: 15px;
      line-height: 1.6;
    }

    .purpose-full {
      white-space: pre-wrap;
      line-height: 1.8;
      padding: 12px;
      background-color: #f9fafc;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
    }
  }
}

// 图标样式 - 更精致的图标
[class^="icon-"] {
  font-style: normal;
  font-size: 18px;
}

.icon-lab:before { content: "🧪"; }
.icon-calendar:before { content: "📅"; font-size: 22px; }
.icon-time:before { content: "⏱️"; }
.icon-purpose:before { content: "📝"; }
.icon-status:before { content: "🏷️"; }
.icon-action:before { content: "⚙️"; }
.icon-refresh:before { content: "🔄"; }

// 按钮样式优化 - 更精致的按钮
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