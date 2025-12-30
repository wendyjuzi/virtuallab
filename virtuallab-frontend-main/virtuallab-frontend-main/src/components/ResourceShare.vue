<template>
  <div class="resource-share">
    <!-- 分享对话框 -->
    <el-dialog
      v-model="props.visible"
      title="分享资源"
      width="600px"
      :before-close="handleClose"
    >
      <div class="share-content">
        <!-- 分享类型选择 -->
        <div class="share-type-section">
          <h4>选择分享方式</h4>
          <el-radio-group v-model="shareType" class="share-type-group">
            <el-radio-button :value="'user'">
              <el-icon><User /></el-icon>
              分享给用户
            </el-radio-button>
            <el-radio-button :value="'class'">
              <el-icon><School /></el-icon>
              分享给班级
            </el-radio-button>
            <el-radio-button :value="'link'">
              <el-icon><Link /></el-icon>
              生成链接
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 用户分享 -->
        <div v-if="shareType === 'user'" class="share-section">
          <h4>选择用户</h4>
          <el-select
            v-model="selectedUsers"
            multiple
            filterable
            placeholder="搜索并选择用户"
            class="user-select"
          >
            <el-option
              v-for="user in userList"
              :key="user.username"
              :label="user.name"
              :value="user.username"
            >
              <div class="user-option">
                <el-avatar :size="24" :src="user.avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span>{{ user.name }}</span>
                <span class="user-role">{{ user.role }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 班级分享 -->
        <div v-if="shareType === 'class'" class="share-section">
          <h4>选择班级</h4>
          <el-select
            v-model="selectedClasses"
            multiple
            filterable
            placeholder="搜索并选择班级"
            class="class-select"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            >
              <div class="class-option">
                <el-icon><School /></el-icon>
                <span>{{ cls.name }}</span>
                <span class="class-count">({{ cls.studentCount }}人)</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 链接分享 -->
        <div v-if="shareType === 'link'" class="share-section">
          <h4>链接分享设置</h4>
          <el-form :model="linkForm" label-width="100px">
            <el-form-item label="分享标题">
              <el-input 
                v-model="linkForm.shareTitle" 
                placeholder="请输入分享标题"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="分享描述">
              <el-input 
                v-model="linkForm.shareDescription" 
                type="textarea" 
                placeholder="请输入分享描述"
                maxlength="200"
                show-word-limit
                :rows="3"
              />
            </el-form-item>
          </el-form>
        </div>

        

        <!-- 高级设置 -->
        <div class="share-section">
          <h4>高级设置</h4>
          <el-form :model="advancedSettings" label-width="120px">
            <el-form-item label="过期时间">
              <el-date-picker
                v-model="advancedSettings.expiresAt"
                type="datetime"
                placeholder="选择过期时间（可选）"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleShare" :loading="sharing">
            确认分享
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分享成功对话框 -->
    <el-dialog
      v-model="showSuccessDialog"
      title="分享成功"
      width="500px"
      :show-close="false"
    >
      <div class="success-content">
        <el-icon class="success-icon" color="#67C23A"><CircleCheckFilled /></el-icon>
        <h3>资源分享成功！</h3>
        <p>已成功分享给 {{ shareResult.sharedCount }} 个接收者</p>
        
        <div v-if="shareResult.shareLink" class="share-link-section">
          <h4>分享链接</h4>
          <div class="link-display">
            <el-input 
              v-model="shareResult.shareLink" 
              readonly 
              class="link-input"
            >
              <template #append>
                <el-button @click="copyLink">复制</el-button>
              </template>
            </el-input>
          </div>
        </div>

        <div class="share-actions">
          <el-button @click="showSuccessDialog = false">关闭</el-button>
          <el-button type="primary" @click="viewShares">查看分享记录</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Share, User, School, Link, CircleCheckFilled } from '@element-plus/icons-vue'
import { 
  createShare, 
  createLinkShare,
  type ShareInfo 
} from '@/api/resourceShare'
import { getAllUsers } from '@/api/request'
import { useUserStore } from '@/store/user'
import axios from 'axios';

interface User {
  username: string
  name: string
  role: string
  avatar?: string
}

interface Class {
  id: string
  name: string
  studentCount: number
}

const props = defineProps<{ visible: boolean, resourceId: number, resourceTitle?: string }>()
const emit = defineEmits(['update:visible', 'shareSuccess', 'close'])

// 响应式数据
const showSuccessDialog = ref(false)
const sharing = ref(false)
const shareType = ref<'user' | 'class' | 'link'>('user')
const selectedUsers = ref<string[]>([])
const selectedClasses = ref<string[]>([])
const permission = ref<'read' | 'write' | 'admin'>('read')
const userList = ref<User[]>([])
const classList = ref<Class[]>([])

const userStore = useUserStore()

const linkForm = reactive({
  shareTitle: '',
  shareDescription: ''
})

const advancedSettings = reactive({
  expiresAt: '',
  enableDownload: true,
  enableComment: true
})

const shareResult = reactive({
  shareLink: '',
  sharedCount: 0
})

// 方法
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  shareType.value = 'user'
  selectedUsers.value = []
  selectedClasses.value = []
  permission.value = 'read'
  linkForm.shareTitle = ''
  linkForm.shareDescription = ''
  advancedSettings.expiresAt = ''
  advancedSettings.enableDownload = true
  advancedSettings.enableComment = true
}

const handleShare = async () => {
  try {
    sharing.value = true

    let shareData: any = {
      resourceId: props.resourceId,
      permission: permission.value,
      enableDownload: advancedSettings.enableDownload,
      enableComment: advancedSettings.enableComment
    }

    if (advancedSettings.expiresAt) {
      shareData.expiresAt = advancedSettings.expiresAt
    }

    let result: ShareInfo

    switch (shareType.value) {
      case 'user':
        if (selectedUsers.value.length === 0) {
          ElMessage.warning('请选择至少一个用户')
          return
        }
        // 校验每个username非空，逐个分享
        for (const username of selectedUsers.value) {
          if (!username || !username.trim()) {
            ElMessage.warning('存在空的用户名，已跳过');
            continue;
          }
          const shareDataSingle = {
            resourceId: props.resourceId,
            sharedBy: userStore.user!.username,
            targetUsername: username,
            permission: permission.value
          };
          await createShareByUsername(shareDataSingle); // 你需要有createShareByUsername方法
        }
        shareResult.sharedCount = selectedUsers.value.length;
        showSuccessDialog.value = true;
        emit('shareSuccess', {});
        break;

      case 'class':
        if (selectedClasses.value.length === 0) {
          ElMessage.warning('请选择至少一个班级')
          return
        }
        shareData.classIds = selectedClasses.value
        shareData.sharedBy = userStore.user!.username
        const classResult = await createShare(shareData)
        result = classResult.data
        shareResult.sharedCount = selectedClasses.value.length
        break

      case 'link':
        shareData.shareTitle = linkForm.shareTitle || props.resourceTitle
        shareData.shareDescription = linkForm.shareDescription
        shareData.sharedBy = userStore.user!.username
        const linkResult = await createLinkShare(shareData)
        result = linkResult.data
        shareResult.shareLink = result.shareLink || ''
        shareResult.sharedCount = 1
        break
    }

    emit('update:visible', false)
    showSuccessDialog.value = true
    
    ElMessage.success('分享成功！')
    emit('shareSuccess', result)

  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败，请重试')
  } finally {
    sharing.value = false
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareResult.shareLink)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const viewShares = () => {
  showSuccessDialog.value = false
  // 跳转到分享记录页面
  // router.push(`/shares?resourceId=${props.resourceId}`)
}

async function fetchUserList() {
  const res = await getAllUsers()
  userList.value = res.data
}

async function createShareByUsername(data: { resourceId: number, sharedBy: string, targetUsername: string, permission: string }) {
  console.log('分享请求地址', axios.defaults.baseURL);
  return axios.post('/resource-share/share-by-username', data);
}

onMounted(fetchUserList)
</script>

<style scoped>
.resource-share {
  display: inline-block;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.share-content {
  max-height: 60vh;
  overflow-y: auto;
}

.share-type-section,
.share-section {
  margin-bottom: 24px;
}

.share-type-section h4,
.share-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.share-type-group {
  width: 100%;
}

.share-type-group :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.user-select,
.class-select {
  width: 100%;
}

.user-option,
.class-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-role,
.class-count {
  color: #999;
  font-size: 12px;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-content h3 {
  margin: 0 0 8px 0;
  color: #67C23A;
}

.success-content p {
  margin: 0 0 24px 0;
  color: #666;
}

.share-link-section {
  margin: 24px 0;
  text-align: left;
}

.share-link-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.link-display {
  display: flex;
  gap: 8px;
}

.link-input {
  flex: 1;
}

.share-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.dialog-footer {
  text-align: right;
}
</style> 