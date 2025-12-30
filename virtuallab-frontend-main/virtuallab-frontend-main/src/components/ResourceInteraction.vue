<template>
  <div class="resource-interaction video-style">
    <!-- 操作栏美化，所有按钮横向排列，风格统一 -->
    <div class="interaction-bar">
      <div class="action-btn" @click="handleLike" :class="{ active: isLiked }">
        <el-icon class="action-icon"><component :is="isLiked ? 'StarFilled' : 'Star'" /></el-icon>
        <span class="action-text">点赞 {{ likeCount }}</span>
      </div>
      <div class="action-btn" @click="handleFavorite" :class="{ active: isFavorited }">
        <el-icon class="action-icon"><component :is="isFavorited ? 'StarFilled' : 'Star'" /></el-icon>
        <span class="action-text">收藏 {{ favoriteCount }}</span>
      </div>
      <div class="action-btn" @click="handleCommentClick">
        <el-icon class="action-icon"><ChatDotRound /></el-icon>
        <span class="action-text">评论 {{ commentCount }}</span>
      </div>
      <div class="action-btn" @click="handleDownload">
        <el-icon class="action-icon"><Download /></el-icon>
        <span class="action-text">下载 {{ downloadCount }}</span>
      </div>
      <div class="action-btn" @click="showShareDialog = true">
        <el-icon class="action-icon"><Share /></el-icon>
        <span class="action-text">分享</span>
      </div>
      <div class="action-btn" @click="showCopyDialog = true">
        <el-icon class="action-icon"><CopyDocument /></el-icon>
        <span class="action-text">复制</span>
      </div>
    </div>
    <!-- 评论区卡片 -->
    <el-card class="video-comment-card">
      <div class="video-comment-title">评论区</div>
      <div class="comment-content">
        <div class="comment-list">
          <div v-if="comments.length === 0" class="comment-empty">暂无评论，快来抢沙发吧~</div>
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-author">{{ comment.userName }}</span>
              <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
              <div class="comment-actions" v-if="canEditComment(comment)">
                <el-button size="small" @click="editComment(comment)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteComment(comment.id)">删除</el-button>
              </div>
            </div>
            <div class="comment-text" v-if="!comment.isEditing">{{ comment.content }}</div>
            <div class="comment-edit" v-else>
              <el-input
                v-model="comment.editContent"
                type="textarea"
                :rows="2"
              />
              <div class="edit-actions">
                <el-button size="small" @click="saveComment(comment)">保存</el-button>
                <el-button size="small" @click="cancelEdit(comment)">取消</el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="comment-form">
          <el-input
            v-model="newComment"
            type="textarea"
            placeholder="写下你的评论..."
            :rows="3"
          />
          <el-button type="primary" class="submit-btn" @click="submitComment" :loading="commentLoading" style="margin-top: 12px;">发表评论</el-button>
        </div>
      </div>
    </el-card>
    <!-- 其它对话框保持不变 -->
    <el-dialog v-model="showRatingDialog" title="为资源评分" width="400px">
      <div class="rating-content">
        <div class="rating-stars">
          <el-rate 
            v-model="userRating" 
            :max="5" 
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            show-text
            :texts="['很差', '较差', '一般', '不错', '很好']"
          />
        </div>
        <el-input
          v-model="ratingComment"
          type="textarea"
          placeholder="添加评分说明（可选）"
          :rows="3"
        />
      </div>
      <template #footer>
        <el-button @click="showRatingDialog = false">取消</el-button>
        <el-button type="primary" @click="submitRating" :loading="ratingLoading">提交评分</el-button>
      </template>
    </el-dialog>
    <!-- 统一的资源分享弹窗 -->
    <ResourceShare
      v-if="showShareDialog && resource"
      :resourceId="resource.id"
      :resourceTitle="resource.name"
      @shareSuccess="showShareDialog = false"
      @close="showShareDialog = false"
    />
    <el-dialog v-model="showCopyDialog" title="复制资源" width="400px">
      <div class="copy-content">
        <el-form :model="copyForm" label-width="100px">
          <el-form-item label="目标用户">
            <el-input v-model="copyForm.targetUserId" placeholder="请输入目标用户ID" />
          </el-form-item>
          <el-form-item label="新名称">
            <el-input v-model="copyForm.newName" placeholder="请输入新名称（可选）" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showCopyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCopy" :loading="copyLoading">复制资源</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Star, StarFilled, Download, ChatDotRound, Share, CopyDocument,
  User, Clock, View
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useLikeFavoriteStore } from '@/store/likeFavorite'
import * as resourceApi from '@/api/resource'
import * as commentApi from '@/api/comment'
import { getUserById } from '@/api/request'
import axios from 'axios'
import ResourceShare from '@/components/ResourceShare.vue'

interface Props {
  resource: {
    id: number
    name: string
    description?: string
    creatorName?: string
    createTime?: string
    views?: number
    url?: string
  }
}

const props = defineProps<Props>()
const userStore = useUserStore()
const likeFavoriteStore = useLikeFavoriteStore()

// 从store获取点赞收藏状态
const experimentState = computed(() => likeFavoriteStore.getExperimentState(props.resource.id))
const isLoading = computed(() => likeFavoriteStore.isLoading(props.resource.id))

// 响应式数据
const downloadCount = ref(0)
const commentCount = ref(0)
const averageRating = ref(0)
const userRating = ref(0)

// 点赞收藏状态从store获取
const likeCount = computed(() => experimentState.value.likeCount)
const favoriteCount = computed(() => experimentState.value.favoriteCount)
const isLiked = computed(() => experimentState.value.liked)
const isFavorited = computed(() => experimentState.value.favorited)

// 对话框状态
const showRatingDialog = ref(false)
const showCommentDialog = ref(false)
const showShareDialog = ref(false)
const showCopyDialog = ref(false)

// 加载状态
const ratingLoading = ref(false)
const commentLoading = ref(false)
const shareLoading = ref(false)
const copyLoading = ref(false)

// 表单数据
const ratingComment = ref('')
const newComment = ref('')
const comments = ref<any[]>([])

const copyForm = ref({
  targetUserId: '',
  newName: ''
})

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString()
}

// 获取资源交互数据
const fetchResourceData = async () => {
  try {
    const response = await resourceApi.getResourceInteractions(props.resource.id)
    const interactions = response.data || response
    // 处理交互数据
    likeCount.value = interactions.likes || 0
    favoriteCount.value = interactions.favorites || 0
    downloadCount.value = interactions.downloads || 0
    commentCount.value = interactions.comments || 0
    averageRating.value = interactions.averageRating || 0
    isLiked.value = interactions.isLiked || false
    isFavorited.value = interactions.isFavorited || false
    userRating.value = interactions.userRating || 0
  } catch (error) {
    console.error('获取资源数据失败:', error)
  }
}

// 获取评论列表
const fetchComments = async () => {
  console.log('fetchComments 被调用')
  console.log('props.resource:', props.resource)
  try {
    const response = await commentApi.getCommentsByResourceId(props.resource.id)
    const data = response.data || response
    comments.value.splice(0, comments.value.length, ...(Array.isArray(data) ? data : []))
    await enrichCommentsWithUserName(comments.value)
    console.log('fetchComments 最终 comments.value:', JSON.stringify(comments.value))
  } catch (error) {
    comments.value = []
  }
}

// 批量查用户名并合并到评论
async function enrichCommentsWithUserName(comments: any[]) {
  const userIdSet = new Set(comments.map(c => c.userId))
  // 只保留数字 id，避免传入字符串导致后端报错
  const userIdArr = Array.from(userIdSet).filter(id => typeof id === 'number' && !isNaN(id))
  if (userIdArr.length === 0) return
  try {
    const res = await axios.get('/user/batch', { params: { ids: userIdArr.join(',') } })
    const userList = res.data || []
    const userMap: Record<number, any> = {}
    userList.forEach((u: any) => {
      userMap[u.id] = u.username || `用户${u.id}`
    })
    comments.forEach(c => {
      c.userName = userMap[c.userId] || `用户${c.userId}`
    })
  } catch {
    comments.forEach(c => {
      c.userName = `用户${c.userId}`
    })
  }
}

// 处理点赞
const handleLike = async () => {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await resourceApi.addResourceInteraction({
      resourceId: props.resource.id,
      userId: userStore.user.id,
      type: 'LIKE'
    })
    
    if (isLiked.value) {
      likeCount.value--
      isLiked.value = false
      ElMessage.success('已取消点赞')
    } else {
      likeCount.value++
      isLiked.value = true
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 处理收藏
const handleFavorite = async () => {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await resourceApi.addResourceInteraction({
      resourceId: props.resource.id,
      userId: userStore.user.id,
      type: 'FAVORITE'
    })
    
    if (isFavorited.value) {
      favoriteCount.value--
      isFavorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      favoriteCount.value++
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 处理下载
const handleDownload = async () => {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await resourceApi.addResourceInteraction({
      resourceId: props.resource.id,
      userId: userStore.user.id,
      type: 'DOWNLOAD'
    })
    
    downloadCount.value++
    ElMessage.success('下载记录已添加')
    
    // 这里可以添加实际的下载逻辑
    if (props.resource.url) {
      window.open(props.resource.url, '_blank')
    }
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 提交评分
const submitRating = async () => {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    return
  }

  if (userRating.value === 0) {
    ElMessage.warning('请选择评分')
    return
  }

  ratingLoading.value = true
  try {
    await resourceApi.addResourceInteraction({
      resourceId: props.resource.id,
      userId: userStore.user.id,
      type: 'RATING',
      comment: ratingComment.value
    })
    
    ElMessage.success('评分提交成功')
    showRatingDialog.value = false
    await fetchResourceData()
  } catch (error) {
    ElMessage.error('评分提交失败')
  } finally {
    ratingLoading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录')
    return
  }

  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  commentLoading.value = true
  try {
    const result = await commentApi.addComment({
      resourceId: props.resource.id,
      userId: userStore.user.id,
      userName: userStore.user.username,
      content: newComment.value
    })
    
    ElMessage.success('评论发表成功')
    newComment.value = ''
    
    // 确保评论列表更新
    await fetchComments()
    
    commentCount.value++
  } catch (error) {
    console.error('评论发表失败:', error)
    ElMessage.error('评论发表失败')
  } finally {
    commentLoading.value = false
  }
}

// 提交复制
const submitCopy = async () => {
  if (!copyForm.value.targetUserId) {
    ElMessage.warning('请输入目标用户ID')
    return
  }

  copyLoading.value = true
  try {
    await resourceApi.copyResource({
      sourceId: props.resource.id,
      targetUserId: parseInt(copyForm.value.targetUserId),
      newName: copyForm.value.newName
    })
    
    ElMessage.success('资源复制成功')
    showCopyDialog.value = false
    copyForm.value = { targetUserId: '', newName: '' }
  } catch (error) {
    ElMessage.error('资源复制失败')
  } finally {
    copyLoading.value = false
  }
}

// 检查是否可以编辑评论
const canEditComment = (comment: any) => {
  return userStore.user?.id === comment.userId
}

// 编辑评论
const editComment = (comment: any) => {
  comment.isEditing = true
  comment.editContent = comment.content
}

// 保存评论
const saveComment = async (comment: any) => {
  if (!comment.editContent.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    await commentApi.updateComment({
      id: comment.id,
      resourceId: comment.resourceId,
      userId: comment.userId,
      content: comment.editContent
    })
    
    comment.content = comment.editContent
    comment.isEditing = false
    ElMessage.success('评论更新成功')
  } catch (error) {
    ElMessage.error('评论更新失败')
  }
}

// 取消编辑
const cancelEdit = (comment: any) => {
  comment.isEditing = false
  comment.editContent = ''
}

// 删除评论
const deleteComment = async (commentId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await commentApi.deleteComment(commentId, userStore.user.id)
    await fetchComments()
    commentCount.value--
    ElMessage.success('评论删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('评论删除失败')
    }
  }
}

// 监听评论对话框打开
const onDialogOpen = () => {
  console.log('评论对话框打开')
  fetchComments()
}

// 处理评论按钮点击
const handleCommentClick = () => {
  console.log('评论按钮被点击')
  showCommentDialog.value = true
  fetchComments()
}

// 组件挂载
onMounted(() => {
  console.log('ResourceInteraction 组件已加载')
  fetchResourceData()
})

// 监听 resource.id 变化，自动刷新评论
watch(() => props.resource.id, (newId) => {
  if (showCommentDialog.value) fetchComments();
})
</script>

<style scoped>
.video-style {
  max-width: 900px;
  margin: 40px auto 0 auto;
  padding-bottom: 40px;
}
.video-bar {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
  border-bottom: 1px solid #ececec;
  padding: 16px 0 12px 0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.video-comment-card {
  margin-top: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  background: #fff;
  padding: 0 0 16px 0;
}
.video-comment-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  padding: 18px 24px 0 24px;
  margin-bottom: 8px;
}
.comment-content {
  padding: 0 24px;
}
.comment-list {
  max-height: 320px;
  overflow-y: auto;
  margin-bottom: 16px;
}
.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.comment-author {
  font-weight: 600;
  color: #2c3e50;
}
.comment-time {
  color: #95a5a6;
  font-size: 12px;
}
.comment-actions {
  display: flex;
  gap: 8px;
}
.comment-edit {
  margin-top: 8px;
}
.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.comment-text {
  color: #34495e;
  line-height: 1.5;
}
.comment-form {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.comment-form .el-input {
  flex: 1;
}
.submit-btn {
  min-width: 100px;
  height: 40px;
}
.comment-empty {
  color: #aaa;
  text-align: center;
  padding: 32px 0;
  font-size: 16px;
}
.interaction-bar {
  display: flex;
  gap: 32px;
  align-items: center;
  margin: 32px 0 24px 0;
  justify-content: flex-start;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}
.action-btn:hover {
  background: #f3f4fa;
  color: #6b4fff;
}
.action-btn .el-icon {
  font-size: 22px;
}
.action-btn.active {
  color: #6b4fff;
}
</style>