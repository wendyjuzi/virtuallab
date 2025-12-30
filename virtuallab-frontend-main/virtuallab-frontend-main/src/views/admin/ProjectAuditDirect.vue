<template>
  <div class="audit-direct-container">
    <!-- 返回按钮和标题 -->
    <div class="header" style="position:relative;">
      <el-button
          class="back-btn"
          @click="$router.back()"
          type="default"
          style="position:absolute;left:0;top:50%;transform:translateY(-50%);z-index:2;font-size:16px;padding: 6px 18px 6px 32px;border-radius:20px;box-shadow:0 2px 8px rgba(124,58,237,0.08);color:#7c3aed;border:1.5px solid #ede9fe;background:linear-gradient(90deg,#f5f3ff 60%,#ede9fe 100%);"
      >
        <i class="el-icon-arrow-left" style="margin-right:6px;"></i>返回
      </el-button>
      <h1>实验项目审核</h1>
    </div>

    <!-- 审核卡片 -->
    <el-card class="audit-card">
      <template #header>
        <div class="card-header">
          <h3>审核操作</h3>
        </div>
      </template>

      <el-form :model="auditForm" label-width="120px">
        <el-form-item label="审核意见">
          <el-input
              type="textarea"
              v-model="auditForm.comment"
              placeholder="请输入审核意见"
              rows="6"
              resize="none"
              class="audit-textarea"
          ></el-input>
        </el-form-item>

        <el-form-item class="action-buttons">
          <el-button
              type="success"
              @click="handleAudit('approved')"
              :loading="auditLoading"
              class="approve-btn"
          >
            <i class="el-icon-check" style="margin-right:6px;"></i>
            审核通过并发布
          </el-button>
          <el-button
              type="danger"
              @click="handleAudit('rejected')"
              :loading="auditLoading"
              class="reject-btn"
          >
            <i class="el-icon-close" style="margin-right:6px;"></i>
            审核驳回
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作成功提示 -->
    <el-dialog
        v-model="successDialogVisible"
        :title="auditResult === 'approved' ? '审核通过' : '审核驳回'"
        width="400px"
        center
        class="result-dialog"
    >
      <div class="success-message">
        <el-icon
            :color="auditResult === 'approved' ? '#67C23A' : '#F56C6C'"
            :size="50"
        >
          <component :is="auditResult === 'approved' ? SuccessFilled : CircleCloseFilled" />
        </el-icon>
        <p>{{ successMessage }}</p>
      </div>
      <template #footer>
        <el-button
            type="primary"
            @click="handleSuccessConfirm"
            class="confirm-btn"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auditProject, publishProject } from '@/api/audit'
import { ElMessage } from 'element-plus'
import { SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const projectId = Number(route.params.projectId)
const auditLoading = ref(false)
const successDialogVisible = ref(false)
const successMessage = ref('')
const auditResult = ref<'approved' | 'rejected'>('approved')

// 审核表单
const auditForm = ref({
  comment: ''
})

// 处理审核操作
const handleAudit = async (status: 'approved' | 'rejected') => {
  try {
    auditLoading.value = true
    auditResult.value = status

    const currentUserId = userStore.user?.id
    if (!currentUserId) {
      ElMessage.error('无法获取当前用户信息')
      return
    }

    await auditProject(
        projectId,
        status,
        auditForm.value.comment,
        currentUserId
    )

    if (status === 'approved') {
      await publishProject(projectId)
      successMessage.value = '项目审核通过并已成功发布到班级！'
    } else {
      successMessage.value = '项目已成功驳回！'
    }

    successDialogVisible.value = true
  } catch (error) {
    console.error('操作失败', error)
    ElMessage.error('操作失败')
  } finally {
    auditLoading.value = false
  }
}

// 处理成功确认
const handleSuccessConfirm = () => {
  successDialogVisible.value = false
  router.push('/department/project-audit')
}
</script>

<style scoped lang="scss">
/* 基础容器样式 */
.audit-direct-container {
  padding: 32px;
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  min-height: 100vh;
}

/* 头部区域样式 */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 20px 0 120px;
  position: relative;
}

.header h1 {
  font-size: 2.1rem;
  color: #7c3aed;
  margin: 0;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(168, 85, 247, 0.08);
}

/* 审核卡片样式 */
.audit-card {
  background: rgba(255,255,255,0.97);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.08);
  margin-bottom: 32px;
  border: 1px solid #ede9fe;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #ede9fe;
  margin-bottom: 30px;
}

.card-header h3 {
  font-size: 1.5rem;
  color: #7c3aed;
  margin: 0;
  font-weight: 700;
}

.audit-textarea {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.10);
  border: 1px solid #ede9fe;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
}

/* 按钮样式 */
.approve-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%) !important;
  padding: 12px 30px !important;
  border-radius: 12px !important;
  font-size: 16px !important;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.18) !important;
  border: none !important;
}

.approve-btn:hover {
  background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.25) !important;
}

.reject-btn {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%) !important;
  padding: 12px 30px !important;
  border-radius: 12px !important;
  font-size: 16px !important;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(248, 113, 113, 0.18) !important;
  border: none !important;
}

.reject-btn:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(248, 113, 113, 0.25) !important;
}

/* 成功消息样式 */
.success-message {
  text-align: center;
  padding: 20px;
}

.success-message p {
  margin-top: 20px;
  font-size: 18px;
  color: #6d28d9;
  font-weight: 500;
}

/* 对话框样式 */
.result-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

.result-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #ede9fe 60%, #fff 100%);
  margin-right: 0;
}

.result-dialog :deep(.el-dialog__title) {
  color: #7c3aed;
  font-weight: 700;
}

.confirm-btn {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%) !important;
  border-radius: 10px !important;
  padding: 10px 30px !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.18) !important;
  border: none !important;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%) !important;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.25) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audit-direct-container {
    padding: 15px;
  }

  .header {
    padding: 0 20px 0 100px;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .audit-card {
    padding: 20px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .approve-btn, .reject-btn {
    width: 100%;
  }
}
</style>