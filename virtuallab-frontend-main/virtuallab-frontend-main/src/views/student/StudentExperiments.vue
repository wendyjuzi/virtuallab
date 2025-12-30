<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <AppNavbar />

    <div class="main-layout">
      <!-- 左侧边栏 -->
      <AppSidebar />

      <!-- 主内容区 -->
      <div class="content-wrapper">
        <div class="experiment-management-container">
          <!-- 返回按钮 -->
          <div class="back-button-container">
            <el-button 
              class="back-button" 
              @click="goBack" 
              type="default"
              :icon="ArrowLeft"
            >
              返回
            </el-button>
          </div>
          
          <div class="page-header">
            <h1>我的实验项目</h1>
            <p>管理您参与的所有实验项目</p>
          </div>

          <!-- 搜索和操作栏 -->
          <el-card class="search-card">
            <div class="search-bar">
              <el-input
                  v-model="searchForm.experimentName"
                  placeholder="搜索实验名称"
                  style="width: 300px"
                  clearable
                  @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="handleSearch" :loading="loading">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch">重置</el-button>
            </div>
          </el-card>

          <!-- 实验项目列表 -->
          <el-card class="list-card">
            <el-table
                :data="experimentList"
                v-loading="loading"
                stripe
                border
                style="width: 100%"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="实验名称" min-width="200" />
              <el-table-column prop="category" label="类别" width="120">
                <template #default="{ row }">
                  <el-tag :type="getCategoryTag(row.category)">
                    {{ getCategoryLabel(row.category) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="进度" width="150">
                <template #default="{ row }">
                  <el-progress
                      :percentage="row.progress"
                      :status="getProgressStatus(row.status)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getStatusTag(row.status)">
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="成绩" width="100">
                <template #default="{ row }">
                  <span v-if="row.score">{{ row.score }}分</span>
                  <span v-else>未评分</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <!-- 状态为未开始、进行中或其他未知状态时显示开始按钮 -->
                  <!-- 状态为已完成或已批改时显示查看按钮 -->
                  <el-button
                      v-if="row.status === 'completed' || row.status === 'graded' "
                      size="small"
                      type="info"
                      @click="viewExperiment(row)"
                  >
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button
                      v-else
                      size="small"
                      type="primary"
                      @click="viewExperiment(row)"
                  >
                    <el-icon><VideoPlay /></el-icon>
                    开始
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                  v-model:current-page="pagination.current"
                  v-model:page-size="pagination.size"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="pagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, VideoPlay, Document } from '@element-plus/icons-vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { useUserStore } from '@/store/user'
import { getStudentExperiments } from '@/api/request' // 导入API方法
import router from "@/router"

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  experimentName: '',
  status: '',
  category: ''
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 实验项目列表
const experimentList = ref<any[]>([])

// 查看实验详情
const viewExperiment = (experiment: any) => {
  router.push(`/experiment/${experiment.id}`)
}

// 状态映射
const statusLabels: Record<string, string> = {
  'not_started': '未开始',
  'in_progress': '进行中',
  'completed': '已完成',
  'graded': '已批改'
}

const statusTags: Record<string, string> = {
  'not_started': 'info',
  'in_progress': 'primary',
  'completed': 'success',
  'graded': 'success'
}

// 方法
const categoryLabels: Record<string, string> = {
  'basic': '基础实验',
  'advanced': '进阶实验',
  'comprehensive': '综合实验'
}

const categoryTags: Record<string, string> = {
  'basic': 'success',
  'advanced': 'primary',
  'comprehensive': 'warning'
}

// 方法
const getCategoryLabel = (category: string) => {
  return categoryLabels[category] || category
}

const getCategoryTag = (category: string) => {
  return categoryTags[category] || 'info'
}

const getStatusLabel = (status: string) => {
  return statusLabels[status] || '未知'
}

const getStatusTag = (status: string) => {
  return statusTags[status] || 'info'
}

const getProgressByStatus = (status: string) => {
  const progressMap: Record<string, number> = {
    'not_started': 0,
    'in_progress': 50,
    'completed': 80,
    'graded': 100
  }
  return progressMap[status] || 0
}

const getProgressStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'not_started': 'exception',
    'in_progress': 'primary',
    'completed': 'warning',
    'graded': 'success'
  }
  return statusMap[status] || 'exception'
}

// 获取实验项目列表（调用后端API）
// const fetchExperimentList = async () => {
//   loading.value = true
//   console.log("正在获取实验数据")
//   try {
//     const userId = userStore.user?.id
//     if (!userId) {
//       ElMessage.error('用户信息获取失败')
//       return
//     }
//
//     const response = await getStudentExperiments({
//       userId,
//       keyword: searchForm.experimentName,
//       pageNum: pagination.current,
//       pageSize: pagination.size
//     }) as any
//
//     if (response.code === 200) {
//       // 处理返回的数据
//       const data = response.data
//       experimentList.value = data.records.map((item: any) => ({
//         id: item.id,
//         name: item.name,
//         category: item.category,
//         status: item.progressStatus || 'not_started',
//         score: item.score,
//         createTime: formatDateTime(item.createdAt),
//         deadline: item.deadline ? formatDateTime(item.deadline) : '无',
//         // 根据状态计算进度
//         progress: getProgressByStatus(item.progressStatus || 'not_started')
//       }))
//
//       pagination.total = data.total || 0
//     } else {
//       ElMessage.error(response.message || '获取实验列表失败')
//     }
//   } catch (error) {
//     console.error('获取实验列表失败:', error)
//     ElMessage.error('请求失败，请稍后重试')
//   } finally {
//     loading.value = false
//   }
// }


const fetchExperimentList = async () => {
  loading.value = true;
  console.log("[DEBUG] 开始获取实验数据，加载状态:", loading.value);

  try {
    const userId = userStore.user?.id;
    console.log("[DEBUG] 当前用户ID:", userId);

    if (!userId) {
      console.error("[ERROR] 用户ID为空，终止请求");
      ElMessage.error('用户信息获取失败');
      return;
    }

    const requestParams = {
      userId,
      keyword: searchForm.experimentName,
      pageNum: pagination.current,
      pageSize: pagination.size
    };
    console.log("[DEBUG] 请求参数:", requestParams);

    // 发送请求
    const response = await getStudentExperiments(requestParams);
    console.log("[DEBUG] 完整API响应:", response);

    if (response.code === 200 && response.data) {
      console.log("[DEBUG] 请求成功，开始处理数据");

      // 从新的数据结构中获取分页数据
      const pageData = response.data.pageData;
      const records = pageData?.records || [];

      console.log("[DEBUG] 原始分页数据:", {
        records: records,
        total: pageData?.total,
        current: pageData?.current,
        size: pageData?.size
      });

      // 处理实验列表数据
      experimentList.value = records.map((item: any) => ({
        id: item.id,
        name: item.name || item.projectName, // 兼容不同字段名
        category: item.category,
        status: item.progressStatus || item.status || 'not_started', // 兼容不同字段名
        score: item.score,
        createTime: formatDateTime(item.createdAt || item.createTime), // 兼容不同字段名
        deadline: item.deadline ? formatDateTime(item.deadline) : '无',
        progress: getProgressByStatus(item.progressStatus || item.status || 'not_started')
      }));

      console.log("[DEBUG] 处理后的实验列表:", experimentList.value);

      // 更新分页信息
      pagination.total = pageData?.total || 0;
      pagination.current = pageData?.current || 1;
      pagination.size = pageData?.size || 10;

      console.log("[DEBUG] 更新后的分页信息:", {
        total: pagination.total,
        current: pagination.current,
        size: pagination.size
      });

    } else {
      const errorMsg = response.message || '获取实验列表失败';
      console.error("[ERROR] API请求失败:", errorMsg);
      ElMessage.error(errorMsg);
    }
  } catch (error: any) {
    console.error('[ERROR] 获取实验列表异常:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    ElMessage.error(`请求失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
    console.log("[DEBUG] 请求结束，加载状态:", loading.value);
  }
};

// 日期格式化辅助函数
const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchExperimentList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    experimentName: '',
    status: '',
    category: ''
  })
  pagination.current = 1
  fetchExperimentList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchExperimentList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchExperimentList()
}
const enterLab = () => {
  ElMessage.success('正在跳转到实验选择页面...')
  router.push('/student/LabReservation')
}
// 开始新实验
const startNewExperiment = () => {
  ElMessage.success('正在跳转到实验选择页面...')
  // 实际项目中：router.push('/student/available-experiments')
}

// 开始实验
const startExperiment = (row: any) => {
  ElMessage.success(`开始实验: ${row.name}`)
  // 实际项目中：router.push(`/experiment/${row.id}`)
}

// 查看报告
const viewReport = (row: any) => {
  ElMessage.success(`查看实验报告: ${row.name}`)
  // 实际项目中：router.push(`/student/report/${row.id}`)
}

// 返回按钮
const goBack = () => router.back()


// 生命周期
onMounted(() => {
  // 确保用户信息已加载
  if (!userStore.user) {
    userStore.fetchCurrentUser().then(() => {
      fetchExperimentList()
    })
  } else {
    fetchExperimentList()
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(135deg, #f3e8ff 0%, #faf5ff 50%, #f0f9ff 100%);
  position: relative;
  min-height: 100vh;
}

.content-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(192, 132, 252, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(216, 180, 254, 0.05) 0%, transparent 70%),
    url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPGRlZnM+CiAgICA8cGF0dGVybiBpZD0icGF0dGVybiIgeD0iMCIgeT0iMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHBhdGggZD0iTTAgMGw2MCA2MG0wLTYwTC02MCA2MCIgc3Ryb2tlPSJyZ2JhKDIxNiwgMTgwLCAyNTQsIDAuMSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz4KPC9zdmc+');
  opacity: 0.8;
  z-index: 0;
  animation: gradientMove 20s ease-in-out infinite;
}

.content-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(6px 6px at 40px 40px, rgba(192, 132, 252, 0.2) 50%, transparent 50%),
    radial-gradient(6px 6px at 120px 120px, rgba(147, 51, 234, 0.15) 50%, transparent 50%),
    radial-gradient(6px 6px at 200px 200px, rgba(216, 180, 254, 0.1) 50%, transparent 50%);
  background-size: 240px 240px;
  z-index: 0;
  opacity: 0.5;
  animation: floatingDots 60s linear infinite;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

@keyframes floatingDots {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 240px 240px;
  }
}

.experiment-management-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
  width: 100%;
  position: relative;
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 32px rgba(192, 132, 252, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.page-header::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(135deg, rgba(192, 132, 252, 0.2), rgba(147, 51, 234, 0.2));
  border-radius: 25px;
  z-index: -1;
  opacity: 0.5;
  filter: blur(20px);
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #c084fc, #9333ea, #c084fc);
  border-radius: 2px;
  animation: gradientShift 3s linear infinite;
  background-size: 200% 100%;
}

@keyframes gradientShift {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #9333ea, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 12px 0;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 1px;
}

.page-header p {
  font-size: 16px;
  color: #7c3aed;
  margin: 0;
  opacity: 0.8;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(216, 180, 254, 0.2);
  box-shadow: 0 4px 20px rgba(192, 132, 252, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(192, 132, 252, 0.15);
}

.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}

.list-card {
  margin-bottom: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(216, 180, 254, 0.2);
  box-shadow: 0 4px 20px rgba(192, 132, 252, 0.1);
  padding: 24px;
  transition: all 0.3s ease;
}

.list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(192, 132, 252, 0.15);
}

.el-table {
  --el-table-header-bg-color: #f3e8ff;
  --el-table-border-color: #e9d5ff;
  --el-table-header-text-color: #7c3aed;
  background: transparent !important;
}

.el-table th {
  background: rgba(243, 232, 255, 0.8) !important;
  color: #7c3aed !important;
  font-weight: 600;
  font-size: 15px;
  padding: 16px 12px;
}

.el-table td {
  padding: 16px 12px;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: rgba(243, 232, 255, 0.3);
}

.el-button--primary {
  background: #c084fc;
  border-color: #c084fc;
}

.el-button--primary:hover {
  background: #a855f7;
  border-color: #a855f7;
}

.el-input__wrapper {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(216, 180, 254, 0.3);
  box-shadow: 0 2px 6px rgba(192, 132, 252, 0.1);
}

.el-input__wrapper:hover {
  border-color: #c084fc;
}

.el-input__wrapper.is-focus {
  border-color: #9333ea;
  box-shadow: 0 0 0 1px #9333ea;
}

.el-tag {
  border-radius: 6px;
  padding: 4px 8px;
  font-weight: 500;
}

.el-tag--success {
  background: rgba(167, 243, 208, 0.2);
  border-color: rgba(167, 243, 208, 0.4);
  color: #059669;
}

.el-tag--primary {
  background: rgba(192, 132, 252, 0.2);
  border-color: rgba(192, 132, 252, 0.4);
  color: #7c3aed;
}

.el-tag--warning {
  background: rgba(253, 230, 138, 0.2);
  border-color: rgba(253, 230, 138, 0.4);
  color: #d97706;
}

.el-progress-bar__outer {
  background: rgba(216, 180, 254, 0.2) !important;
}

.el-progress-bar__inner {
  background: linear-gradient(90deg, #c084fc, #9333ea) !important;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 20px 0;
}

.el-pagination.is-background .el-pager li:not(.is-disabled).is-active {
  background: #c084fc;
}

.el-pagination.is-background .el-pager li:not(.is-disabled):hover {
  color: #9333ea;
}

@media (max-width: 900px) {
  .page-header h1 {
    font-size: 28px;
  }
  
  .search-bar {
    padding: 16px;
  }
  
  .list-card {
    padding: 16px;
  }
}

@media (max-width: 1300px) {
  .list-card, .search-card {
    max-width: 100vw;
    min-width: 0;
  }
}

@media (max-width: 900px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-bar .el-input,
  .search-bar .el-select {
    width: 100% !important;
  }
  .search-bar .el-button {
    width: 100%;
  }
  .list-card {
    padding: 4px;
  }
  .el-table {
    font-size: 13px;
  }
}

@media (max-width: 600px) {
  .list-card, .search-card {
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .el-table {
    font-size: 12px;
  }
  .pagination-container {
    padding: 8px 0;
  }
  .page-header h1 {
    font-size: 20px;
  }
}

/* 表格横向滚动（小屏） */
.el-card__body {
  overflow-x: auto;
  height:520px;
}

/* 进度条样式 */
.el-progress {
  width: 90%;
}

.back-button-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}

.back-button {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(192, 132, 252, 0.3);
  color: #7c3aed;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(192, 132, 252, 0.1);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(192, 132, 252, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(192, 132, 252, 0.15);
}

.back-button:active {
  transform: translateY(0);
}
</style>