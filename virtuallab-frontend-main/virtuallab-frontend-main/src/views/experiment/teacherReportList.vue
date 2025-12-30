<template>
  <div class="report-list-bg">
    <div class="report-list-container">
      <!-- 头部导航栏 -->
      <div class="report-navbar navbar-grid">
        <div class="navbar-left">
          <el-button class="back-btn" type="primary" @click="goBack" circle>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 16L7 10L13 4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </el-button>
        </div>
        <div class="navbar-center">
          <span>虚拟实验室管理系统</span>
        </div>
        <div class="navbar-right">
          <el-button type="primary" @click="refreshList">
            <i class="icon-refresh"></i> 刷新列表
          </el-button>
        </div>
      </div>

      <!-- 报告列表主体 -->
      <div class="list-container">
        <div class="list-header">
          <h2>我的实验报告</h2>
          <div class="list-meta">
            <span>共 {{ reports.length }} 份报告</span>
            <el-select v-model="filterStatus" placeholder="筛选状态" style="width: 120px">
              <el-option label="全部" value="all"></el-option>
              <el-option label="已提交" value="SUBMITTED"></el-option>
              <el-option label="已评分" value="GRADED"></el-option>
            </el-select>
          </div>
        </div>

        <!-- 报告列表 -->
        <div class="report-cards">
          <el-card
              v-for="report in filteredReports"
              :key="report.id"
              class="report-card"
              @click="viewReport(report.sessionId)"
          >
            <div class="card-header">
              <h3>{{ report.title }}</h3>
              <el-tag :type="getStatusTagType(report.status)">
                {{ formatStatus(report.status) }}
              </el-tag>
            </div>
            <div class="card-content">
              <div class="content-meta">
                <div class="meta-item">
                  <i class="icon-calendar"></i>
                  <span>创建时间: {{ formatDate(report.createdAt) }}</span>
                </div>
                <div class="meta-item">
                  <i class="icon-update"></i>
                  <span>更新时间: {{ formatDate(report.updatedAt) }}</span>
                </div>
              </div>
              <div class="content-preview">
                {{ truncateContent(report.description) }}
              </div>
            </div>
            <div class="card-footer">
              <el-button type="primary" size="small" @click.stop="viewReport(report.sessionId)">
                查看详情
              </el-button>
            </div>
          </el-card>

          <!-- 空状态 -->
          <div v-if="filteredReports.length === 0" class="empty-state">
            <i class="icon-empty"></i>
            <p>暂无实验报告</p>
            <el-button type="primary" @click="createNewReport">
              创建新报告
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { ElMessage } from 'element-plus'
import {getSubmittedAndGradedReports, getReportList} from "@/api/experiment";
import teacherReport from "@/views/experiment/teacherReport.vue";

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const studentId = ref(route.params.studentId)
    const filterStatus = ref('all')
    const loading = ref(false)
    const reports = ref([])

    console.log('当前studentId:', studentId.value)

    // 获取学生信息
    const fetchStudentInfo = async () => {
      const res = await fetch('/user/profile')
      console.log("API响应状态:",res.status)
      const data = await res.json()
      console.log("完整API响应",data)
      if (data.code === 200) {
        studentInfo.value = data.data
        console.log("获取到的学生信息:",studentInfo.value)
      }else{
        console.error("API返回错误:",data.message)
      }
    }

    // 从API中获取报告列表
    const fetchReports = async () => {
      loading.value = true
      try {
        let apiResponse;

        if (studentId.value) {
          // 如果有studentId，获取该学生的报告
          apiResponse = await getReportList(studentId.value)
          console.log('获取特定学生报告:', apiResponse)
        } else {
          // 如果没有studentId，获取所有已提交的报告
          apiResponse = await getSubmittedAndGradedReports()
          console.log('获取所有已提交报告:', apiResponse)
        }

        reports.value = apiResponse || []
        ElMessage.success(studentId.value
            ? '学生报告列表加载成功'
            : '所有已提交报告加载成功')

      } catch (error) {
        console.error('加载报告列表失败:', error)
        ElMessage.error('加载报告列表失败:' + (error.message || '未知错误'))
        reports.value = []
      } finally {
        loading.value = false
      }
    }


    // 过滤后的报告列表
    const filteredReports = computed(() => {
      if (filterStatus.value === 'all') {
        return reports.value
      }
      return reports.value.filter(report => report.status === filterStatus.value)
    })

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }

    // 格式化状态
    const formatStatus = (status) => {
      const statusMap = {
        'DRAFT': '草稿',
        'SAVED': '已保存',
        'SUBMITTED': '已提交',
        'GRADED': '已评分'
      }
      return statusMap[status] || status
    }

    // 获取状态标签类型
    const getStatusTagType = (status) => {
      const typeMap = {
        'DRAFT': 'info',
        'SAVED': '',
        'SUBMITTED': 'warning',
        'GRADED': 'success'
      }
      return typeMap[status] || ''
    }

    // 截断内容预览
    const truncateContent = (content) => {
      if (!content) return '暂无内容'
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    }

    // 查看报告详情
    const viewReport = (sessionId) => {
      router.push(`/experiment/teacherReport/${sessionId}`)
    }

    // 刷新列表
    const refreshList = () => {
      ElMessage.success('报告列表已刷新')
    }

    // 创建新报告
    const createNewReport = () => {
      ElMessage.info('创建新报告功能待实现')
    }

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 初始化加载数据
    onMounted(() => {
      fetchReports()
    })

    return {
      fetchStudentInfo,
      reports,
      filteredReports,
      filterStatus,
      formatDate,
      formatStatus,
      getStatusTagType,
      truncateContent,
      viewReport,
      refreshList,
      createNewReport,
      fetchReports,
      getSubmittedAndGradedReports,
      goBack
    }
  }
}
</script>

<style scoped>
.report-list-bg {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f5f0ff 0%, #f0ebff 100%);
  overflow-x: hidden;
}
.report-list-bg::before, .report-list-bg::after {
  content: '';
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  pointer-events: none;
}
.report-list-bg::before {
  width: 420px;
  height: 420px;
  left: -140px;
  top: -140px;
  background: radial-gradient(circle at 30% 30%, #d8b4fe 0%, #c084fc 80%, transparent 100%);
}
.report-list-bg::after {
  width: 320px;
  height: 320px;
  right: -100px;
  bottom: -100px;
  background: radial-gradient(circle at 70% 70%, #e9d5ff 0%, #d8b4fe 80%, transparent 100%);
}

.report-list-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.report-navbar {
  display: grid;
  grid-template-columns: 60px 1fr 120px;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(192, 132, 252, 0.15);
  border: 1px solid rgba(192, 132, 252, 0.2);
  position: relative;
}
.navbar-grid {
  display: grid;
  grid-template-columns: 60px 1fr 120px;
  align-items: center;
  padding: 15px 20px;
}
.navbar-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.navbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #a855f7;
  letter-spacing: 1px;
  width: 100%;
  margin-left: 40px;
  background: linear-gradient(135deg, #a855f7, #d8b4fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.navbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
}
.back-btn {
  background: linear-gradient(135deg, #c084fc, #d8b4fe) !important;
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba(192, 132, 252, 0.25);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(192, 132, 252, 0.35);
}
.back-btn svg {
  display: block;
}
.navbar-brand {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #3a3a3a;
  justify-content: center;
  grid-column: 2/3;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.report-navbar .el-button {
  background: linear-gradient(135deg, #c084fc, #d8b4fe);
  color: #fff;
  border: none;
  box-shadow: 0 4px 15px rgba(192, 132, 252, 0.25);
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.report-navbar .el-button::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, #409EFF33 0%, transparent 80%);
  transform: translate(-50%, -50%) scale(0.7);
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
}
.report-navbar .el-button:hover::after {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}
.report-navbar .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(192, 132, 252, 0.35);
}

.list-container {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(192, 132, 252, 0.15);
  padding: 30px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(192, 132, 252, 0.2);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(192, 132, 252, 0.2);
}

.list-header h2 {
  font-size: 24px;
  background: linear-gradient(135deg, #a855f7, #d8b4fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.list-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
}

.report-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.report-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(.4,2,.3,1);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(192, 132, 252, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(192, 132, 252, 0.15);
}
.report-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 8px 30px rgba(192, 132, 252, 0.2);
  border-color: rgba(192, 132, 252, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #a855f7;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item i {
  margin-right: 8px;
  color: #c084fc;
}

.content-preview {
  color: #666;
  line-height: 1.6;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.report-card .el-button {
  background: linear-gradient(135deg, #c084fc, #d8b4fe);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(192, 132, 252, 0.2);
  transition: all 0.3s ease;
}
.report-card .el-button::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, #409EFF33 0%, transparent 80%);
  transform: translate(-50%, -50%) scale(0.7);
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
}
.report-card .el-button:hover::after {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}
.report-card .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(192, 132, 252, 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  padding: 50px 0;
  color: #a855f7;
  animation: fadeIn 0.8s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.empty-state i {
  font-size: 50px;
  margin-bottom: 20px;
  color: #c084fc;
  animation: floating 2.5s ease-in-out infinite alternate;
}
@keyframes floating {
  from { transform: translateY(0); }
  to { transform: translateY(-18px); }
}
.empty-state p {
  margin-bottom: 20px;
  font-size: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  padding: 50px 0;
  color: #666;
}
.loading-state i {
  font-size: 40px;
  margin-bottom: 15px;
  color: #c084fc;
  animation: rotating 2s linear infinite;
}
@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .report-list-container, .list-container {
    width: 98% !important;
    padding: 16px !important;
    border-radius: 20px !important;
  }
  .list-header h2 {
    font-size: 20px;
  }
  .navbar-grid {
    grid-template-columns: 40px 1fr 80px;
    padding: 12px 8px;
  }
  .navbar-center {
    font-size: 16px;
  }
}

/* 图标样式 */
[class^="icon-"] {
  font-style: normal;
}

.icon-lab:before { content: "🧪"; }
.icon-refresh:before { content: "🔄"; }
.icon-calendar:before { content: "📅"; }
.icon-update:before { content: "⏱️"; }
.icon-empty:before { content: "📭"; }
</style>