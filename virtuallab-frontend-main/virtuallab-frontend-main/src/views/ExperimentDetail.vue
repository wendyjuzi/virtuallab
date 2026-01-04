<template>
  <div class="detail-page">
    <div class="header-banner">
      <button class="back-btn" @click="goBack" aria-label="返回上一页">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="11" fill="url(#paint0_linear)"/>
          <path d="M13.5 7L9.5 11L13.5 15" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="paint0_linear" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7C3AED"/>
              <stop offset="1" stop-color="#6366F1"/>
            </linearGradient>
          </defs>
        </svg>
      </button>
      <h1>{{ project?.name }}</h1>
      <p class="sub-info">类型：{{ project?.category }} ｜ 难度：{{ project?.level }}</p>
    </div>

    <div class="content-section card-hover">
      <div class="left">
        <img :src="getValidImageUrl(project)" alt="实验封面" @error="handleImageError">
      </div>
      <div class="right">
        <p class="description">{{ project?.description }}</p>
        <el-button
          v-if="project?.sceneJsonPath"
          class="start-btn"
          type="primary"
          size="large"
          @click="goTo3DExperiment"
        >
          🚀 开始实验
        </el-button>
        <el-button
          v-else
          class="start-btn"
          type="primary"
          size="large"
          @click="startExperiment"
        >
          🚀 开始实验
        </el-button>
      </div>
    </div>

    <!-- 交互区：点赞、收藏、评论 -->
    <div class="interaction-bar">
      <el-button :type="isLiked ? 'primary' : 'default'" @click="handleLike">
        <el-icon><StarFilled v-if="isLiked" /><Star v-else /></el-icon>
        点赞 {{ likeCount }}
      </el-button>
      <el-button :type="isFavorited ? 'warning' : 'default'" @click="handleFavorite">
        <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
        收藏 {{ favoriteCount }}
      </el-button>
      <el-button @click="scrollToComment">评论区</el-button>
      <el-button type="info" @click="showShareDialog = true">分享</el-button>
    </div>

    <!-- 评论区 -->
    <div id="comment-section" class="comment-section">
      <el-card class="video-comment-card">
        <div class="video-comment-title">评论区</div>
        <div class="comment-content">
          <div class="comment-list" ref="commentListRef">
            <div v-if="comments.length === 0" class="comment-empty">暂无评论，快来抢沙发吧~</div>
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                {{ (comment.userName || comment.userId || '').toString().charAt(0).toUpperCase() }}
              </div>
              <div class="comment-main">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.userName || comment.userId }}</span>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                  <div class="comment-actions" v-if="isAdmin">
                    <el-button size="small" type="danger" @click="handleDelete(comment.id)">删除</el-button>
                  </div>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
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
    </div>
    <ResourceShare
      v-if="project"
      v-model:visible="showShareDialog"
      :resourceId="project.id"
      :resourceTitle="project.name"
      @shareSuccess="showShareDialog = false"
      @close="showShareDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { getCommentsByResourceId, addComment, deleteComment } from '@/api/comment';
import { useUserStore } from '@/store/user';
import { useLikeFavoriteStore } from '@/store/likeFavorite';
import { Star, StarFilled } from '@element-plus/icons-vue';
import ResourceShare from '@/components/ResourceShare.vue';
import { getExperimentImageUrl, handleImageError as handleImageErrorUtil } from '@/utils/imageUtils';

interface Project {
  id: number;
  name: string;
  category: string;
  level: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  sceneJsonPath?: string; // 新增 sceneJsonPath 字段
}

const userStore = useUserStore();
const likeFavoriteStore = useLikeFavoriteStore();
const route = useRoute();
const router = useRouter();
const project = ref<Project | null>(null);
const comments = ref<any[]>([]);
const newComment = ref('');
const commentLoading = ref(false);
const isAdmin = computed(() => userStore.userRole === 'SYSTEM_ADMIN');
const defaultAvatar = '/images/experiments/experiment1.png';
const commentListRef = ref<HTMLElement | null>(null);
const showShareDialog = ref(false);

// 点赞收藏状态
const likeState = computed(() => project.value ? likeFavoriteStore.getExperimentState(project.value.id) : { liked: false, favorited: false, likeCount: 0, favoriteCount: 0 })
const isLiked = computed(() => likeState.value.liked)
const isFavorited = computed(() => likeState.value.favorited)
const likeCount = computed(() => likeState.value.likeCount)
const favoriteCount = computed(() => likeState.value.favoriteCount)

console.log('ExperimentDetail mounted');

onMounted(async () => {
  console.log('onMounted called');
  const id = route.params.id;
  const res = await axios.get(`/api/experiment/project/${id}`);
  project.value = res.data;
  console.log('project loaded', project.value);
  if (project.value) {
    likeFavoriteStore.fetchExperimentState(project.value.id)
  }
  fetchComments();
});

function formatTime(time?: string) {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString();
}

async function fetchComments() {
  if (!project.value?.id) return;
  const res = await getCommentsByResourceId(project.value.id);
  console.log('评论接口原始返回', res);
  comments.value = Array.isArray(res) ? res : (res.data || []);
}

async function submitComment() {
  if (!userStore.user?.id) {
    ElMessage.warning('请先登录后再评论');
    return;
  }
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }
  commentLoading.value = true;
  try {
    await addComment({
      resourceId: project.value!.id,
      userId: userStore.user.id,
      userName: userStore.user.username,
      content: newComment.value.trim()
    });
    newComment.value = '';
    ElMessage.success('评论成功');
    await fetchComments();
    // 评论成功后滚动到底部
    nextTick(() => {
      if (commentListRef.value) {
        commentListRef.value.scrollTop = commentListRef.value.scrollHeight;
      }
    });
  } catch (e) {
    ElMessage.error('评论失败');
  } finally {
    commentLoading.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await deleteComment(id, userStore.user.id);
    ElMessage.success('删除成功');
    fetchComments();
  } catch (e) {
    ElMessage.error('删除失败');
  }
}
// 图片获取方法（使用统一工具函数）
function getValidImageUrl(project: any): string {
  return getExperimentImageUrl(project?.imageUrl || project?.image)
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  handleImageErrorUtil(event)
}

const handleLike = async () => {
  if (!project.value) return
  await likeFavoriteStore.toggleLike(project.value.id)
}
const handleFavorite = async () => {
  if (!project.value) return
  await likeFavoriteStore.toggleFavorite(project.value.id)
}
const scrollToComment = () => {
  document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' })
}

const startExperiment = async () => {
  const projectId = project.value?.id
  const studentId = userStore.user?.studentId  // 你需要确保用户信息中包含 studentId

  if (!projectId || !studentId) {
    ElMessage.error('用户信息或实验信息缺失')
    return
  }

  try {
    await axios.post('/api/experiment/project/start', {
      projectId,
      studentId
    }, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    })

    // 更新成功后打开实验链接
    if (project.value.videoUrl) {
      window.open(project.value.videoUrl, '_blank')
    }

    ElMessage.success('实验已开始，状态已更新为 in_progress')
  } catch (err) {
    console.error('更新失败', err)
    ElMessage.error('实验启动失败')
  }
}

const goTo3DExperiment = () => {
  if (project.value?.sceneJsonPath) {
    let path = project.value.sceneJsonPath
    if (path && !path.startsWith('/')) {
      path = '/' + path
    }
    if (path && !path.startsWith('/static/json/')) {
      const idx = path.indexOf('static/json/')
      if (idx !== -1) {
        path = '/' + path.slice(idx)
      } else {
        const idx2 = path.indexOf('json/')
        if (idx2 !== -1) {
          path = '/static/' + path.slice(idx2)
        }
      }
    }
    router.push({
      name: 'Experiment3DRunStandalone', // 跳转到无布局的独立页面
      query: { sceneJsonPath: path }
    });
  }
};

const onShareSuccess = (shareInfo: any) => {
  // 分享成功后的处理，比如弹窗提示、刷新等
  ElMessage.success('资源分享成功！')
}

// 返回上一页
function goBack() {
  router.back();
}
</script>

<style scoped>
.detail-page {
  width: 100%;
  min-height: 100vh;
  padding: 50px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f8f9ff 0%, #e0e7ff 100%); /* 更柔和渐变 */
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.header-banner {
  position: relative;
  text-align: center;
  margin-bottom: 40px;
  background: rgba(255,255,255,0.85);
  border-radius: 20px;
  box-shadow: 0 4px 24px 0 #a5b4fc22;
  padding: 32px 0 24px 0;
}
.back-btn {
  position: absolute;
  left: 32px;
  top: 32px;
  width: 48px;
  height: 48px;
  border: none;
  outline: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED 0%, #6366F1 100%);
  box-shadow: 0 2px 12px #a5b4fc44;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  z-index: 10;
}
.back-btn:hover {
  box-shadow: 0 4px 24px #7c3aed66;
  transform: scale(1.08);
}
.back-btn svg {
  display: block;
}

.header-banner h1 {
  font-size: 36px;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
}

.header-banner .sub-info {
  font-size: 16px;
  color: #7C3AED;
  margin-top: 10px;
  font-weight: 500;
}

.content-section {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  border: 4px solid;
  border-radius: 24px;
  color: #333;
  background: rgba(255, 255, 255, 0.92);
  border-image-slice: 1;
  border-image-source: linear-gradient(45deg, #7C3AED, #a5b4fc);
  box-shadow: 0 10px 36px rgba(124, 58, 237, 0.13);
  transition: all 0.3s ease;
  backdrop-filter: blur(2.5px);
}
.content-section:hover {
  box-shadow: 0 20px 60px rgba(124, 58, 237, 0.22);
  background: rgba(255, 255, 255, 1);
}
.left {
  flex: 1.3;
  display: flex;
  justify-content: center;
  align-items: center;
}
.left img {
  width: 100%;
  max-width: 650px;
  min-width: 320px;
  border-radius: 22px;
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.13);
  object-fit: cover;
  border: 2.5px solid #ede9fe;
  background: #f8f8ff;
}
.right {
  flex: 0.9;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  min-width: 260px;
  padding-bottom: 70px; /* 给按钮留空间 */
}
.description {
  font-size: 17px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 30px;
  word-break: break-word;
}
.start-btn {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #7C3AED, #6366F1);
  border: none;
  font-weight: 600;
  padding: 18px 44px;
  border-radius: 16px;
  color: white;
  font-size: 20px;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 4px 18px #a5b4fc44;
  transition: all 0.3s ease;
  z-index: 2;
}
.start-btn:hover {
  transform: scale(1.09);
  box-shadow: 0 8px 32px #7c3aed55;
  background: linear-gradient(45deg, #6366F1, #7C3AED);
}
.interaction-bar {
  display: flex;
  gap: 18px;
  margin: 32px 0 18px 0;
  align-items: center;
  justify-content: center;
}
.interaction-bar .el-button {
  border-radius: 12px !important;
  font-size: 16px;
  font-weight: 500;
  padding: 10px 22px;
  box-shadow: 0 2px 8px #a5b4fc22;
  transition: box-shadow 0.2s, background 0.2s;
}
.interaction-bar .el-button:hover {
  box-shadow: 0 4px 16px #7c3aed33;
}
.comment-section {
  max-width: 900px;
  margin: 48px auto 0 auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(124, 58, 237, 0.10);
  padding: 36px 32px 28px 32px;
}
.video-comment-title {
  font-size: 22px;
  font-weight: 700;
  color: #7C3AED;
  margin-bottom: 18px;
  letter-spacing: 1px;
}
.comment-item {
  background: #f7f7fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px #a5b4fc11;
  border: 1px solid #ede9fe;
}
.comment-item:hover {
  box-shadow: 0 4px 16px #7c3aed22;
  background: #f3f0ff;
}
.comment-avatar {
  background: linear-gradient(135deg, #ede9fe 0%, #a5b4fc 100%);
  color: #7C3AED;
  border: 2px solid #a5b4fc;
}
.submit-btn {
  background: linear-gradient(45deg, #7C3AED, #6366F1);
  color: #fff;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  box-shadow: 0 2px 8px #a5b4fc22;
  border: none;
  transition: background 0.2s, box-shadow 0.2s;
}
.submit-btn:hover {
  background: linear-gradient(45deg, #6366F1, #7C3AED);
  box-shadow: 0 4px 16px #7c3aed33;
}
@media (max-width: 1100px) {
  .detail-page {
    padding: 18px;
  }
  .header-banner {
    padding: 18px 0 14px 0;
  }
  .back-btn {
    left: 12px;
    top: 12px;
    width: 38px;
    height: 38px;
  }
  .content-section {
    flex-direction: column;
    padding: 18px;
    gap: 18px;
  }
  .left img {
    max-width: 100vw;
    min-width: 0;
  }
  .right {
    min-width: 0;
    padding-bottom: 0;
  }
  .start-btn {
    position: static;
    width: 100%;
    margin-top: 18px;
    font-size: 18px;
    padding: 14px 0;
    border-radius: 14px;
    box-shadow: 0 2px 8px #a5b4fc22;
    left: unset;
    transform: none;
  }
  .comment-section {
    padding: 18px 8px 14px 8px;
  }
}
</style>


