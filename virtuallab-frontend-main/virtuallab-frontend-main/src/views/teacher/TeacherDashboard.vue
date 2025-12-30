<template>
  <div class="dashboard-container">
    <div class="background-design">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>
    
    <div class="content-layout">
      <div class="dashboard-header">
        <div class="user-area">
          <h1 class="page-title">教师工作台</h1>
          <div class="user-info">
            <div class="welcome-text">欢迎，<span class="user-name">{{ userStore.userName }}</span> 老师</div>
            <div class="user-meta">
              <span class="role-badge">{{ getRoleName(userStore.userRole) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- 左上：班级管理 -->
        <div class="grid-item class-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="section-icon class-icon"></i>
              班级管理
            </h2>
          </div>
          <div class="carousel-container">
            <div class="carousel-3d">
              <div class="carousel-track" ref="carouselTrackRef">
                <div 
                  v-for="(clazz, index) in classes" 
                  :key="clazz.id" 
                  class="carousel-item"
                  :class="{ 'active': activeClassIndex === index }"
                  :style="{
                    transform: `rotateY(${index * (360 / Math.max(classes.length, 1))}deg) translateZ(250px)`,
                    filter: activeClassIndex === index ? 'none' : 'brightness(0.98)'
                  }"
                  @click="setActiveClass(index); openStudentDialog(clazz.id, clazz.name)"
                >
                  <div class="course-card">
                    <div class="course-header">
                      <h3>{{ clazz.name }}</h3>
                      <span class="course-code">班级ID：{{ clazz.id }}</span>
                    </div>
                    <div class="course-info">
                      <p>
                        <span class="info-label">学院</span>
                        <span>{{ clazz.department }}</span>
                      </p>
                      <div class="info-divider"></div>
                      <p>
                        <span class="info-label">专业</span>
                        <span>{{ clazz.major }}</span>
                      </p>
                      <div class="info-divider"></div>
                      <p>
                        <span class="info-label">年级</span>
                        <span>{{ clazz.grade }}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="carousel-controls">
              <button class="carousel-control prev" @click="rotateCarousel('prev')">
                <i class="control-icon">←</i>
              </button>
              <div class="carousel-indicators">
                <span 
                  v-for="(_, index) in classes" 
                  :key="index" 
                  class="indicator"
                  :class="{ 'active': activeClassIndex === index }"
                  @click="setActiveClass(index)"
                ></span>
              </div>
              <button class="carousel-control next" @click="rotateCarousel('next')">
                <i class="control-icon">→</i>
              </button>
            </div>
          </div>
        </div>

        <!-- 右上：快捷操作 -->
        <div class="grid-item action-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="section-icon quick-icon"></i>
              快捷操作
            </h2>
          </div>
          <div class="quick-actions">
            <button class="action-btn create-btn" @click="goToModule('experiment')">
              <div class="action-content">
                <i class="action-icon create"></i>
                <div class="text-wrapper">
                  <span class="action-text">创建实验</span>
                  <span class="wave-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </span>
                </div>
                <span class="action-desc">快速创建新的实验项目</span>
              </div>
            </button>
            <button class="action-btn grade-btn light-purple" @click="viewReports">
              <div class="action-content">
                <i class="action-icon grade"></i>
                <div class="text-wrapper">
                  <span class="action-text">批改作业</span>
                  <span class="wave-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </span>
                </div>
                <span class="action-desc">查看并评分学生作业</span>
              </div>
            </button>
            <button class="action-btn manage-btn" @click="manageStudents">
              <div class="action-content">
                <i class="action-icon manage"></i>
                <div class="text-wrapper">
                  <span class="action-text">学生管理</span>
                  <span class="wave-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </span>
                </div>
                <span class="action-desc">管理学生信息和成绩</span>
              </div>
            </button>
          </div>
        </div>

        <!-- 左下：项目管理 -->
        <div class="grid-item project-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="section-icon project-icon"></i>
              实验项目管理
            </h2>
          </div>
          <div class="project-list">
            <div
              class="project-item"
              v-for="project in myProjects"
              :key="project.id"
              :class="{'rejected': project.auditStatus === 'rejected'}"
            >
              <div class="project-info">
                <div class="project-header">
                  <h4>{{ project.name }}</h4>
                  <div class="project-status" :class="getStatusClass(project.auditStatus)">
                    {{ getStatusText(project.auditStatus) }}
                  </div>
                </div>
                <p>{{ project.description }}</p>
                <div class="project-meta">
                  <span><i class="meta-icon difficulty"></i>难度：{{ project?.level }}</span>
                  <span><i class="meta-icon category"></i>类型：{{ project?.category }}</span>
                  <span v-if="project.auditStatus === 'rejected'">
                    <i class="meta-icon reject"></i>驳回原因：{{ project.auditComment || '无' }}
                  </span>
                </div>
              </div>
              <div class="project-actions">
                <!-- 待审核状态 -->
                <template v-if="project.auditStatus === 'pending'">
                  <button class="btn" disabled>待审核</button>
                </template>

                <!-- 已通过状态 -->
                <template v-else-if="project.auditStatus === 'approved'">
                  <button class="btn secondary" @click="viewProgress(project.id)">进度</button>
                  <button class="btn secondary" @click="gradeProject(project.id)">评分统计</button>
                  <button class="btn secondary" @click="handlePublish(project.id)">发布实验报告</button>
                </template>

                <!-- 已驳回状态 -->
                <template v-else-if="project.auditStatus === 'rejected'">
                  <button class="btn danger" @click="resubmitProject(project.id)">重新提交</button>
                  <button class="btn secondary" @click="editProject(project.id)">编辑</button>
                </template>

                <!-- 草稿状态 -->
                <template v-else-if="project.auditStatus === 'draft'">
                  <button class="btn primary" @click="submitProject(project.id)">提交审核</button>
                  <button class="btn secondary" @click="editProject(project.id)">编辑</button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 右下：统计信息 -->
        <div class="grid-item stats-section">
          <div class="section-header stats-header">
            <h2 class="section-title stats-title">
              <i class="section-icon stats-icon"></i>
              <span class="stats-title-text">Instructional Analytics</span>
              <!-- <span class="stats-title-bg">TEACHING</span> -->
            </h2>
          </div>
          <div class="stats-grid">
            <div class="stat-card experiments" v-for="stat in statsList" :key="stat.title">
              <div class="stat-icon-wrapper">
                <i :class="['stat-icon', getStatIconClass(stat.title)]"></i>
        </div>
              <div class="stat-content">
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-value">
                  <span class="number">{{ stat.value }}</span>
                  <span class="unit">{{ stat.unit }}</span>
      </div>
    </div>
  </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="studentDialogVisible" :title="`班级学生列表`" width="540px" class="student-dialog-custom">
      <el-table :data="students" border style="width: 100%" class="student-table-custom">
        <el-table-column prop="id" label="学生ID" width="120" align="center" header-align="center" />
        <el-table-column label="班级名" align="center" header-align="center">
          <template #default>
            {{ currentClassName }}
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="studentDialogVisible = false" class="student-dialog-close-btn">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import axios from 'axios'
import {submitProjectForAudit} from '@/api/audit'
import {ElMessage} from "element-plus"
import {
  getProjectDetailsForReport,
  getStudentIdForProject,
  publishExperimentReport
} from "@/api/experiment";

const router = useRouter()
const userStore = useUserStore()
// 用来存放老师的项目列表
const myProjects = ref([])

// 3D轮播相关状态
const activeClassIndex = ref(0)
const carouselTrackRef = ref(null)
const carouselRotation = ref(0)

// 设置当前活动班级
const setActiveClass = (index) => {
  // 计算需要逆时针转动多少步
  const classCount = Math.max(classes.value.length, 1)
  let step = (index - activeClassIndex.value + classCount) % classCount
  carouselRotation.value -= step * (360 / classCount)
  activeClassIndex.value = index
  rotateTrack()
}

// 旋转轮播
const rotateCarousel = (direction) => {
  const classCount = Math.max(classes.value.length, 1)
  if (direction === 'next') {
    activeClassIndex.value = (activeClassIndex.value + 1) % classCount
    carouselRotation.value -= 360 / classCount
  } else {
    activeClassIndex.value = (activeClassIndex.value - 1 + classCount) % classCount
    carouselRotation.value += 360 / classCount
  }
  rotateTrack()
}

// 应用旋转效果
const rotateTrack = () => {
  if (carouselTrackRef.value) {
    carouselTrackRef.value.style.transition = 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
    carouselTrackRef.value.style.transform = `rotateY(${carouselRotation.value}deg)`
  }
}

// 自动轮播
let autoRotateInterval
const startAutoRotate = () => {
  autoRotateInterval = setInterval(() => {
    rotateCarousel('next')
  }, 3000)
}

const stopAutoRotate = () => {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval)
  }
}

const statsList = ref([
  { title: '实验项目', value: 12, unit: '项' },
  { title: '学生数量', value: 456, unit: '人' },
  { title: '待批改', value: 23, unit: '份' }
])

const fetchStudentCount = async () => {
  try {
    const res = await axios.get('/api/experiment/project/studentCount')
    console.log('完整API响应:', res.data)
    
    // 根据实际API响应结构调整
    const count = res.data?.data ?? res.data?.count ?? res.data
    
    // 确保count是数字
    const studentCount = Number(count) || 0
    
    // 创建新数组确保响应式更新
    const updatedStats = statsList.value.map(stat => 
      stat.title === '学生数量' ? { ...stat, value: studentCount } : stat
    )
    
    statsList.value = updatedStats
    
    console.log('更新后的statsList:', statsList.value)
  } catch (error) {
    console.error('获取学生数量失败', error)
    ElMessage.error('获取学生数量失败')
  }
}
const fetchPendingGradingCount = async () => {
  try {
    console.log('[前端] 开始获取待批改数量，教师:', userStore.userName);
    
    const response = await axios.get('/api/experiment/project/pendingGradingCount', {
      params: { 
        teacherName: userStore.userName 
      },
      validateStatus: function (status) {
        // 确保4xx和5xx状态码不会抛出异常
        return status < 500; 
      }
    });

    console.log('[前端] API响应:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });

    if (!response.data) {
      throw new Error('响应数据为空');
    }

    if (response.data.success === false) {
      // 从响应中提取更详细的错误信息
      const errorMsg = response.data.message || 
                      `后端返回失败状态 (代码: ${response.data.code || '无'})`;
      throw new Error(errorMsg);
    }

    if (typeof response.data.data === 'undefined') {
      throw new Error('响应中缺少data字段');
    }

    const count = response.data.data;
    console.log('[前端] 获取到的待批改数量:', count);

    statsList.value = statsList.value.map(stat => 
      stat.title === '待批改' ? { ...stat, value: count } : stat
    );

  } catch (error) {
    console.error('[前端] 获取待批改数量失败 - 完整错误:', {
      error: error,
      response: error.response,
      message: error.message,
      stack: error.stack
    });
    
    // 更友好的错误提示
    let userMessage = '获取待批改数量失败';
    if (error.response) {
      userMessage += ` (状态码: ${error.response.status})`;
      if (error.response.data?.message) {
        userMessage += `: ${error.response.data.message}`;
      }
    } else {
      userMessage += `: ${error.message}`;
    }
    
    ElMessage.error(userMessage);
  }
}


const goToScore = () => {
  router.push({ name: 'ScorePage' })  // 你路由里需要有对应的 ScorePage 页面
}

const currentClassName = ref('')  // 加上这行，定义响应式变量
const currentClassId = ref<number | null>(null)

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '未通过'
  }
  return statusMap[status] || status
}
// 获取状态类名
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    draft: 'draft',
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected'
  }
  return classMap[status] || ''
}
// 编辑项目
const editProject = (projectId: number) => {
  router.push({
    path: '/experiment/edit',
    query: { projectId }
  })
}
// 提交项目审核
const submitProject = async (projectId: number) => {
  try {
    // 调用提交审核API
    await submitProjectForAudit(projectId)

    // 显示成功提示
    ElMessage.success('项目已成功提交审核')

    // 刷新项目列表
    await fetchMyProjects()
  } catch (error) {
    console.error('提交审核失败', error)
    ElMessage.error('提交审核失败，请重试')
  }
}


// 获取当前日期，格式：YYYYMMDD
const generateSessionId = (studentId: number): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `SESS${year}${month}${day}${studentId}`;
};

// 统一日期格式化工具
const formatDate = (date: Date): string => {
  return date.toISOString().replace('T', ' ').slice(0, 19);
};

// 发布实验报告
const handlePublish = async (projectId: number) => {
  try {
    // 1. 获取实验项目详细信息
    const projectDetails = await getProjectDetailsForReport(projectId);
    console.log('实验项目详情:', projectDetails)

    // 2.获取学生id
    const studentIds = await getStudentIdForProject(projectId);
    console.log("获取到的学生id列表:", studentIds)

    // 格式化日期
    const createdAt = formatDate(new Date());
    const updatedAt = null;

    // 获取标题
    const title = projectDetails.name
    // 3.批量发布
    const results = await publishExperimentReport({
      ...projectDetails,
      title,
      projectId,
      studentIds,
      createdAt,
      updatedAt
    });

    console.log("发布成功，返回结果:", results)
    ElMessage.success("发布实验报告成功~")
    return results;
  } catch (error) {
    console.error('发布实验报告失败:', error);
    throw error;
  }
};

interface Class {
  id: number;
  name: string;
  department: string;
  major: string;
  grade: string;
}

interface Student {
  id: number;
  name: string;
}



const classes = ref<Class[]>([]);
const students = ref<Student[]>([]);
const studentDialogVisible = ref(false);

const loadClasses = async () => {
  const res = await axios.get('/api/experiment/project/class/list');
  classes.value = res.data;
};
const openStudentDialog = async (classId: number, className: string) => {
  currentClassName.value = className  // 设置当前班级名
  const res = await axios.get('/api/experiment/project/class/' + classId + '/students')
  students.value = res.data
  studentDialogVisible.value = true
}
// const openStudentDialog = async (classId: number) => {
//   try {
//     const res = await axios.get('/api/experiment/project/class/' + classId + '/students');
//     console.log('学生列表接口返回：', res.data);
//     // 确认返回的是数组
//     if (Array.isArray(res.data)) {
//       students.value = res.data;
//       studentDialogVisible.value = true;
//     } else {
//       console.error('返回数据不是数组', res.data);
//       students.value = [];
//       studentDialogVisible.value = false;
//     }
//   } catch (error) {
//     console.error('请求学生列表出错', error);
//     students.value = [];
//     studentDialogVisible.value = false;
//   }
// };

// 从后端接口获取老师自己的项目列表
async function fetchMyProjects() {
  try {
    const token = userStore.token
    if (!token) {
      router.push('/login')
      return
    }
    const res = await axios.get('/api/experiment/project/my-projects', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    myProjects.value = res.data

    // ✅ 更新 statsList 中的"实验项目"数量
    const projectCount = myProjects.value.length
    statsList.value = statsList.value.map(stat => {
      if (stat.title === '实验项目') {
        return { ...stat, value: projectCount }
      }
      return stat
    })
  } catch (error) {
    console.error('获取项目失败', error)
  }
}

const getRoleName = (role: string) => {
  const roleNames = {
    admin: '系统管理员',
    department_admin: '院系管理员',
    teacher: '教师',
    student: '学生',
    guest: '访客'
  }
  return roleNames[role as keyof typeof roleNames] || role
}

const manageCourse = (courseId: number) => {
  router.push(`/teacher/course/${courseId}`)
}

const viewStudents = (courseId: number) => {
  router.push(`/teacher/course/${courseId}/students`)
}

const manageProject = (projectId: number) => {
  router.push(`/teacher/project/${projectId}`)
}

const viewProgress = (projectId: number) => {
  router.push(`/teacher/project/${projectId}/progress`)
}


const gradeProject = (projectId: number) => {
  router.push({ name: 'GradeStatistics', query: { projectId } })
}


const createCourse = () => {
  router.push('/teacher/course/create')
}

const goToModule = (key: string) => {
  if (key === 'experiment') {
    router.push('/experiment/create');
  }
}
const goToExperiments = () => {
  router.push('/experiments'); 
}


const gradeAssignments = () => {
  router.push('/teacher/assignments')
}

const viewReports = () => {
  router.push('/experiment/teacherReportList')
}

const manageStudents = () => {
  router.push({ name: 'StudentManagement' }) // 对应你的路由配置
}

const viewSchedule = () => {
  router.push('/teacher/schedule')
}

const goToProfile = () => {
  router.push('/profile')
}

// 添加获取统计图标类名的方法
const getStatIconClass = (title: string) => {
  const iconMap: Record<string, string> = {
    '实验项目': 'experiment-icon',
    '学生数量': 'student-icon',
    '待批改': 'pending-icon'
  }
  return iconMap[title] || ''
}

onMounted(() => {
  if (userStore.userRole !== 'TEACHER') {
    router.push('/unauthorized')
    return
  }
  fetchMyProjects()  // 加载当前登录老师的项目列表
  loadClasses();
  fetchStudentCount()
  fetchPendingGradingCount() // ✅ 新增
  
  // 初始化3D轮播
  setTimeout(() => {
    rotateTrack()
    startAutoRotate()
  }, 500)
})

onUnmounted(() => {
  stopAutoRotate()
})
</script>

<style scoped>
.dashboard-container {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  width: 104%;
  height: calc(100vh - 52px);
  color: #2c3e50;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f0ebff 0%, #e7e2ff 100%);
  margin-top: -26px;
  margin-bottom: -26px;
  margin-left: -22px;
  padding: 0;
}

/* 移除原有的线性渐变背景，改用发光线条 */
.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(2px 100px at 60% 60%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(2px 100px at 30% 40%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
    radial-gradient(100px 2px at 40% 25%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(100px 2px at 70% 75%, rgba(255, 255, 255, 0.9) 0%, transparent 50%);
  filter: blur(1px);
  opacity: 0.7;
  z-index: 0;
  animation: glowLines 10s ease-in-out infinite alternate;
}

.dashboard-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(1px 80px at 20% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(1px 80px at 80% 30%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
    radial-gradient(80px 1px at 50% 50%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(80px 1px at 30% 80%, rgba(255, 255, 255, 0.9) 0%, transparent 50%);
  filter: blur(1px);
  opacity: 0.5;
  z-index: 0;
  animation: glowLines 15s ease-in-out infinite alternate-reverse;
}

@keyframes glowLines {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2) rotate(5deg);
    opacity: 0.7;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.5;
  }
}

/* 增强内容层级，确保在发光线条上方 */
.content-layout {
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  position: relative;
  z-index: 2;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  flex: 0 0 auto;
  margin-bottom: 24px;
  margin-left: -32px;
  margin-right: -32px;
  padding: 0 32px;
  position: relative;
  z-index: 2;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0; /* 重要：允许grid容器在flex布局中收缩 */
}

.grid-item {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 8px 32px rgba(124, 58, 237, 0.1),
    0 2px 8px rgba(124, 58, 237, 0.05);
  border-radius: 24px;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-header {
  flex: 0 0 auto;
  margin-bottom: 16px;
}

/* 班级管理区域 */
.carousel-container {
  flex: 1;
  position: relative;
  margin: 0;
  height: 360px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.carousel-3d {
  width: 100%;
  height: 280px;
  position: relative;
  perspective: 1400px;
}

.carousel-track {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateY(0deg);
  transition: transform 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.carousel-item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 250px;
  margin: -125px 0 0 -150px;
  transform-style: preserve-3d;
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.carousel-item.active {
  z-index: 10;
}

.carousel-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
  z-index: 20;
  position: relative;
}

.carousel-indicators {
  display: flex;
  gap: 10px;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(124, 58, 237, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: rgba(124, 58, 237, 0.8);
  transform: scale(1.3);
}

.carousel-control {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(139, 92, 246, 0.3));
  border: 1px solid rgba(124, 58, 237, 0.3);
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.15);
}

.carousel-control:hover {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(139, 92, 246, 0.4));
  transform: scale(1.1);
  box-shadow: 0 6px 15px rgba(124, 58, 237, 0.25);
}

.control-icon {
  font-size: 24px;
  font-style: normal;
  color: #6d28d9;
}

.course-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 
    0 1px 2px rgba(235, 235, 255, 0.03),
    0 2px 4px rgba(220, 220, 240, 0.03);
  padding: 24px;
  border: 1px solid rgba(124, 58, 237, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
  transform-style: preserve-3d;
  overflow: hidden;
}

.carousel-item:hover .course-card {
  box-shadow: 
    0 2px 4px rgba(210, 210, 240, 0.05),
    0 4px 8px rgba(200, 200, 230, 0.04);
  transform: translateZ(10px);
}

.course-card:hover {
  box-shadow: 0 4px 8px rgba(210, 210, 240, 0.06);
}

.course-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.carousel-item:hover .course-card::before {
  opacity: 1;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(124, 58, 237, 0.1);
  margin-bottom: 12px;
}

.course-header h3 {
  margin: 0;
  color: #6d28d9;
  font-size: 20px;
  font-weight: 600;
}

.course-code {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(168, 85, 247, 0.12));
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.15);
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.course-info p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 15px;
  color: #4b5563;
}

.info-label {
  color: #7c3aed;
  font-weight: 500;
  min-width: 48px;
}

.info-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(124, 58, 237, 0.1),
    rgba(124, 58, 237, 0.05) 50%,
    transparent
  );
}

.course-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid rgba(124, 58, 237, 0.1);
}

.course-actions .btn.primary {
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-actions .btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.course-actions .btn.primary i {
  font-size: 16px;
}

/* 项目管理区域 */
.project-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(124, 58, 237, 0.3) transparent;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 修改为固定两列 */
  gap: 16px;
  padding-bottom: 16px; /* 添加底部间距防止最后一行被截断 */
}

.project-list::-webkit-scrollbar {
  width: 6px;
}

.project-list::-webkit-scrollbar-track {
  background: transparent;
}

.project-list::-webkit-scrollbar-thumb {
  background-color: rgba(124, 58, 237, 0.3);
  border-radius: 3px;
}

/* 快捷操作区域 */
.quick-actions {
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(124, 58, 237, 0.3) transparent;
}

.quick-actions::-webkit-scrollbar {
  width: 6px;
}

.quick-actions::-webkit-scrollbar-track {
  background: transparent;
}

.quick-actions::-webkit-scrollbar-thumb {
  background-color: rgba(124, 58, 237, 0.3);
  border-radius: 3px;
}

/* 统计信息区域 */
.stats-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #bda6f7, #d1c4e9);
  border: none !important;
  padding: 0 !important;
}

/* 创建抽象几何背景 */
.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    linear-gradient(45deg, 
      rgba(124, 58, 237, 0.8) 0%,
      rgba(147, 51, 234, 0.8) 100%
    );
  opacity: 0.9;
  z-index: 1;
}

/* 添加动态光效 */
.stats-section::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: 
    radial-gradient(circle at center, 
      rgba(255, 255, 255, 0.1) 0%,
      transparent 70%
    );
  animation: rotateGradient 15s linear infinite;
  z-index: 2;
}

@keyframes rotateGradient {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.stats-grid {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 32px;
  gap: 24px;
  height: 100%;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.25);
}

.stat-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  color: #ffffff;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.stat-value .number {
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
  background: linear-gradient(135deg, #ffffff, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-value .unit {
  font-size: 14px;
  opacity: 0.8;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .stats-grid {
    flex-direction: column;
    padding: 24px;
  }

  .stat-card {
    width: 100%;
  }
}

.page-title {
  color: #6d28d9;
  font-weight: 600;
  margin: 0;
  font-size: 24px;
  position: relative;
  text-shadow: 0 2px 4px rgba(124, 58, 237, 0.1);
  background: linear-gradient(135deg, #6d28d9, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-right: 32px;
  border-right: 1px solid rgba(124, 58, 237, 0.15);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow: 0 2px 4px rgba(124, 58, 237, 0.1);
  }
  50% {
    text-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
  }
}

.user-area {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  padding: 20px 32px;
  box-shadow: 
    0 4px 15px rgba(124, 58, 237, 0.08),
    0 1px 3px rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(124, 58, 237, 0.15);
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* 添加渐变边框效果 */
.user-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(124, 58, 237, 0.05),
    rgba(124, 58, 237, 0.2) 50%,
    rgba(124, 58, 237, 0.05)
  );
}

/* 添加光晕效果 */
.user-area::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 50% 0%,
    rgba(124, 58, 237, 0.03),
    transparent 70%
  );
  pointer-events: none;
}

.user-info {
  text-align: right;
  flex: 1;
}

.welcome-text {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 6px;
  opacity: 0.9;
}

.user-name {
  font-weight: 600;
  color: #7c3aed;
  background: linear-gradient(135deg, #6d28d9, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(168, 85, 247, 0.12));
  color: #7c3aed;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid rgba(124, 58, 237, 0.15);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

@media (max-width: 768px) {
  .user-area {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 24px;
  }

  .page-title {
    border-right: none;
    border-bottom: 1px solid rgba(124, 58, 237, 0.15);
    padding-right: 0;
    padding-bottom: 16px;
    width: 100%;
  }

  .user-info {
    text-align: left;
  }
}

.course-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.5s ease;
  transform: rotate(30deg);
  pointer-events: none;
}

.course-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 28px rgba(124, 58, 237, 0.15);
}

.course-card:hover::after {
  opacity: 0.4;
  animation: shine 1.5s ease-out;
}

@keyframes shine {
  from {
    transform: rotate(30deg) translateX(-100%);
  }
  to {
    transform: rotate(30deg) translateX(100%);
  }
}

.project-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.08);
  padding: 20px;
  border: 1px solid rgba(124, 58, 237, 0.1);
  transition: all 0.3s ease;
}

.project-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.15);
}

.project-item.rejected {
  border-left: 4px solid #ff7675;
  background: rgba(255, 240, 240, 0.8);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.project-header h4 {
  margin: 0;
  color: #6d28d9;
  font-size: 18px;
}

.project-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.project-status.draft {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(124, 58, 237, 0.2));
  color: #7c3aed;
}

.project-status.pending {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(234, 179, 8, 0.2));
  color: #ca8a04;
}

.project-status.approved {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.2));
  color: #16a34a;
}

.project-status.rejected {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2));
  color: #dc2626;
}

.project-info p {
  margin: 10px 0;
  color: #6b7280;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  font-size: 13px;
  color: #9333ea;
}

.meta-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 5px;
  vertical-align: middle;
  opacity: 0.8;
}

.project-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(124, 58, 237, 0.1);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.action-icon {
  width: 40px;
  height: 40px;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.text-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-text {
  font-size: 16px;
  font-weight: 600;
  color: #6d28d9;
}

.wave-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
}

.wave-dots .dot {
  width: 4px;
  height: 4px;
  background-color: #9333ea;
  border-radius: 50%;
  opacity: 0.6;
  animation: waveDot 1.5s ease-in-out infinite;
}

.wave-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.wave-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes waveDot {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.action-desc {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
  background: rgba(124, 58, 237, 0.05);
}

.action-btn.light-purple {
  background: rgba(209, 196, 233, 0.5);
  border: 1px solid rgba(156, 39, 176, 0.2);
}

.action-btn.light-purple:hover {
  background: rgba(209, 196, 233, 0.8);
  box-shadow: 0 8px 24px rgba(156, 39, 176, 0.2);
}

.action-btn:hover .action-icon {
  transform: scale(1.1);
  background: rgba(124, 58, 237, 0.2);
}

.student-dialog-custom {
  border-radius: 16px;
  overflow: hidden;
}

.student-dialog-custom .el-dialog__header {
  background: linear-gradient(90deg, #7c3aed, #a855f7);
  color: white;
  padding: 16px 20px;
}

.student-dialog-custom .el-dialog__title {
  color: white;
  font-weight: 600;
}

.student-table-custom {
  border-radius: 8px;
  overflow: hidden;
}

.student-dialog-close-btn {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: none;
  color: white;
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .quick-actions {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
}

.btn.primary:hover {
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  transform: translateY(-2px);
}

.btn.primary:hover::before {
  opacity: 0.4;
  animation: shine 1.5s ease-out;
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.btn.secondary:hover {
  background: rgba(124, 58, 237, 0.1);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
  transform: translateY(-2px);
}

.btn.danger {
  background: linear-gradient(135deg, #ff7675, #fab1a0);
  color: white;
}

.btn.danger:hover {
  box-shadow: 0 4px 12px rgba(255, 118, 117, 0.3);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none;
}

.stats-header {
  position: relative;
  z-index: 3;
  padding: 24px 32px 0;
}

.stats-title {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-title-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 38px;
  font-weight: 800;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  animation: glowText 2s ease-in-out infinite alternate;
}

.stats-title-bg {
  position: absolute;
  left: 70px;
  top: -20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.1);
  z-index: 1;
  user-select: none;
  white-space: nowrap;
  animation: floatText 6s ease-in-out infinite;
}

@keyframes glowText {
  0% {
    filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2));
  }
  100% {
    filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.4));
  }
}

@keyframes floatText {
  0%, 100% {
    transform: translateY(0) rotate(-2deg);
    opacity: 0.08;
  }
  50% {
    transform: translateY(-5px) rotate(-2deg);
    opacity: 0.12;
  }
}

.stats-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  animation: iconPulse 2s ease-in-out infinite;
}

.stats-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  animation: iconGlow 2s ease-in-out infinite alternate;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes iconGlow {
  0% {
    opacity: 0.5;
    transform: rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: rotate(360deg);
  }
}

.class-section {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(147, 51, 234, 0.12)) !important;
  border: 1px solid rgba(124, 58, 237, 0.15);
}

.action-section {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1), 0 2px 8px rgba(124, 58, 237, 0.05);
  border-radius: 24px;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.action-section .section-title {
  color: #6d28d9;
}
</style>