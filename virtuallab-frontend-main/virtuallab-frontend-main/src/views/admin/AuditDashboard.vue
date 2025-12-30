<template>
  <div class="audit-dashboard">
    <div class="header">
      <h1>审核管理仪表盘</h1>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ stats.pendingProjects }}</div>
          <div class="stat-label">待审核项目</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.approvedProjects }}</div>
          <div class="stat-label">已通过项目</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.rejectedProjects }}</div>
          <div class="stat-label">已驳回项目</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.publishedProjects }}</div>
          <div class="stat-label">已发布项目</div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="chart-container">
        <div class="chart-card">
          <h3>项目审核状态分布</h3>
          <div ref="statusChart" class="chart"></div>
        </div>
        <div class="chart-card">
          <h3>每周审核趋势</h3>
          <div ref="trendChart" class="chart"></div>
        </div>
      </div>

      <div class="recent-audits">
        <h2>最近审核记录</h2>
        <el-table :data="recentAudits" stripe style="width: 100%">
          <el-table-column prop="projectName" label="项目名称" width="180" />
          <el-table-column prop="submitter" label="提交人" width="120" />
          <el-table-column prop="auditor" label="审核人" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="auditTime" label="审核时间" width="180" />
          <el-table-column prop="comment" label="审核意见" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" @click="viewDetails(row.projectId)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { getPendingProjects } from '@/api/audit'

const router = useRouter()

// 统计数据
const stats = ref({
  pendingProjects: 12,
  approvedProjects: 56,
  rejectedProjects: 8,
  publishedProjects: 42
})

// 最近审核记录
const recentAudits = ref([
  {
    projectId: 101,
    projectName: '计算机网络实验',
    submitter: '张老师',
    auditor: '李管理员',
    status: 'approved',
    auditTime: '2024-06-28 14:30',
    comment: '项目设计合理，符合要求'
  },
  {
    projectId: 102,
    projectName: '数据结构实验',
    submitter: '王老师',
    auditor: '李管理员',
    status: 'rejected',
    auditTime: '2024-06-27 16:45',
    comment: '实验内容需要补充更多细节'
  },
  {
    projectId: 103,
    projectName: '操作系统实验',
    submitter: '赵老师',
    auditor: '陈管理员',
    status: 'approved',
    auditTime: '2024-06-26 10:20',
    comment: '实验设计完整，通过审核'
  },
  {
    projectId: 104,
    projectName: '数据库实验',
    submitter: '孙老师',
    auditor: '陈管理员',
    status: 'pending',
    auditTime: '2024-06-25 09:15',
    comment: '等待审核中'
  }
])

// 图表引用
const statusChart = ref()
const trendChart = ref()

// 获取状态标签样式
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
  }
  return texts[status] || status
}

// 查看项目详情
const viewDetails = (projectId: number) => {
  router.push(`/teacher/project-audit/${projectId}`)
}

// 初始化图表
const initCharts = () => {
  // 状态分布饼图
  const statusChartInstance = echarts.init(statusChart.value)
  statusChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: ['待审核', '已通过', '已驳回', '已发布']
    },
    series: [
      {
        name: '审核状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: stats.value.pendingProjects, name: '待审核', itemStyle: { color: '#e6a23c' } },
          { value: stats.value.approvedProjects, name: '已通过', itemStyle: { color: '#67c23a' } },
          { value: stats.value.rejectedProjects, name: '已驳回', itemStyle: { color: '#f56c6c' } },
          { value: stats.value.publishedProjects, name: '已发布', itemStyle: { color: '#409eff' } }
        ]
      }
    ]
  })

  // 审核趋势折线图
  const trendChartInstance = echarts.init(trendChart.value)
  trendChartInstance.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['提交数量', '审核数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['6/24', '6/25', '6/26', '6/27', '6/28', '6/29', '今天']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '提交数量',
        type: 'line',
        stack: 'Total',
        data: [5, 8, 7, 10, 9, 6, 4],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '审核数量',
        type: 'line',
        stack: 'Total',
        data: [3, 6, 8, 9, 11, 7, 5],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#67C23A'
        },
        symbolSize: 8,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  })

  // 响应式调整
  window.addEventListener('resize', () => {
    statusChartInstance.resize()
    trendChartInstance.resize()
  })
}

// 加载待审核项目
const loadPendingProjects = async () => {
  try {
    const res = await getPendingProjects()
    stats.value.pendingProjects = res.data.length
  } catch (error) {
    console.error('获取待审核项目失败', error)
  }
}

onMounted(() => {
  loadPendingProjects()
  initCharts()
})
</script>

<style scoped>
.audit-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #303133;
}

.stats {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.stat-item {
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 400px;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.chart {
  height: 340px;
  width: 100%;
}

.recent-audits {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.recent-audits h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
}

@media (max-width: 1200px) {
  .chart-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats {
    flex-direction: column;
  }

  .chart-card {
    height: 300px;
  }

  .chart {
    height: 240px;
  }
}
</style>