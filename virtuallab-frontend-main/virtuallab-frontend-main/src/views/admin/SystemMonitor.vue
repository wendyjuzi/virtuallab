<template>
  <div class="system-monitor">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>系统监控中心</h1>
      <p>实时监控系统运行状态和用户操作行为</p>
    </div>

    <!-- 实时状态卡片 -->
    <el-row :gutter="20" class="status-cards">
      <el-col :span="6">
        <el-card class="status-card online-users">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-number">{{ systemStatus.onlineUsers }}</div>
              <div class="card-label">在线用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card active-experiments">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-number">{{ systemStatus.activeExperiments }}</div>
              <div class="card-label">活跃实验</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card system-load">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-number">{{ systemStatus.systemLoad }}%</div>
              <div class="card-label">系统负载</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="status-card today-operations">
          <div class="card-content">
            <div class="card-icon">
              <el-icon><Operation /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-number">{{ systemStatus.todayOperations }}</div>
              <div class="card-label">今日操作</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 监控内容区域 -->
    <el-row :gutter="20" class="monitor-content">
      <!-- 实时操作监控 -->
      <el-col :span="16" :offset="4">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <span>实时操作监控</span>
              <el-button type="primary" size="small" @click="refreshOperations">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <div class="operations-list">
            <div 
              v-for="operation in realtimeOperations" 
              :key="operation.id" 
              class="operation-item"
              :class="getOperationClass(operation.type)"
            >
              <div class="operation-icon">
                <el-icon><component :is="getOperationIcon(operation.type)" /></el-icon>
              </div>
              <div class="operation-content">
                <div class="operation-title">{{ operation.title }}</div>
                <div class="operation-details">
                  <span class="user">{{ operation.username }}</span>
                  <span class="time">{{ formatTime(operation.createTime) }}</span>
                </div>
                <div class="operation-desc">
                  <span>描述: {{ operation.description || '-' }}</span>
                </div>
                <el-collapse>
                  <el-collapse-item title="更多详情" name="1">
                    <div class="operation-meta">
                      <div>权限码: {{ operation.permissionCode || '-' }}</div>
                      <div>执行耗时: {{ operation.executionTime ? operation.executionTime + 'ms' : '-' }}</div>
                      <div>浏览器: <span style="word-break:break-all;">{{ operation.userAgent || '-' }}</span></div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
              <div class="operation-status">
                <el-tag :type="getStatusType(operation.status)" size="small">
                  {{ getStatusText(operation.status) }}
                </el-tag>
              </div>
            </div>
            <div v-if="realtimeOperations.length === 0" class="empty-operations">
              <el-empty description="暂无实时操作记录" />
            </div>
          </div>
        </el-card>
      </el-col>


    </el-row>



    <!-- Redis 监控信息 -->
    <el-row :gutter="20" class="redis-monitor" style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <span>Redis 监控信息</span>
              </div>
          </template>
          <div class="redis-info-grid">
            <div class="redis-info-item"><span class="label">连接数：</span><span class="value">{{ redisInfo.redisConnectedClients }}</span></div>
            <div class="redis-info-item"><span class="label">已用内存：</span><span class="value">{{ redisInfo.redisUsedMemoryHuman }}</span></div>
            <div class="redis-info-item"><span class="label">总命令数：</span><span class="value">{{ redisInfo.redisTotalCommandsProcessed }}</span></div>
            <div class="redis-info-item"><span class="label">运行时长：</span><span class="value">{{ redisInfo.redisUptimeInSeconds }} 秒</span></div>
            <div class="redis-info-item"><span class="label">命中次数：</span><span class="value">{{ redisInfo.redisKeyspaceHits }}</span></div>
            <div class="redis-info-item"><span class="label">未命中次数：</span><span class="value">{{ redisInfo.redisKeyspaceMisses }}</span></div>
            <div class="redis-info-item"><span class="label">Key总数：</span><span class="value">{{ redisInfo.redisTotalKeys }}</span></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

      <!-- 用户行为分析 -->
    <el-row :gutter="20" class="user-behavior-section" style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <span>用户行为分析</span>
              <el-select v-model="selectedTimeRange" size="small" style="width: 120px" @change="handleTimeRangeChange">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
            </div>
          </template>
          
          <el-row :gutter="20">
            <!-- 用户活跃度热力图 -->
            <el-col :span="10" :offset="1">
              <div class="chart-container">
                <h4>用户活跃度热力图 (24小时)</h4>
                <div class="user-activity-heatmap" ref="userActivityHeatmap"></div>
              </div>
            </el-col>
            
            <!-- 用户角色分布 -->
            <el-col :span="10" :offset="1">
              <div class="chart-container">
                <h4>用户角色分布</h4>
                <div class="user-role-pie" ref="userRolePie"></div>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" style="margin-top: 20px;">
            <!-- 用户地域分布 -->
            <el-col :span="10" :offset="1">
              <div class="chart-container">
                <h4>用户地域分布</h4>
                <div class="user-region-map" ref="userRegionMap"></div>
              </div>
            </el-col>
            
            <!-- 用户学习路径 -->
            <el-col :span="10" :offset="1">
              <div class="chart-container">
                <h4>用户学习路径</h4>
                <div class="user-learning-sankey" ref="userLearningSankey"></div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

      <!-- 系统性能监控 -->
    <el-row :gutter="20" class="system-performance-section" style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <span>系统性能监控</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <!-- 实时性能仪表盘 -->
            <el-col :span="6">
              <div class="chart-container">
                <h4>CPU使用率</h4>
                <div class="cpu-gauge" ref="cpuGauge"></div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="chart-container">
                <h4>内存使用率</h4>
                <div class="memory-gauge" ref="memoryGauge"></div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="chart-container">
                <h4>磁盘使用率</h4>
                <div class="disk-gauge" ref="diskGauge"></div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="chart-container">
                <h4>网络使用率</h4>
                <div class="network-gauge" ref="networkGauge"></div>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" style="margin-top: 20px;">
            <!-- 网络流量监控 -->
            <el-col :span="12">
              <div class="chart-container">
                <h4>网络流量监控</h4>
                <div class="network-traffic-chart" ref="networkTrafficChart"></div>
              </div>
            </el-col>
            
            <!-- 响应时间分析 -->
            <el-col :span="12">
              <div class="chart-container">
                <h4>接口响应时间分布</h4>
                <div class="response-time-boxplot" ref="responseTimeBoxplot"></div>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" style="margin-top: 20px;">
            <!-- 错误率监控 -->
            <el-col :span="24">
              <div class="chart-container">
                <h4>系统错误率趋势</h4>
                <div class="error-rate-chart" ref="errorRateChart"></div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 教育资源分析 -->
    <el-row :gutter="20" class="resource-analysis-section" style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="monitor-card">
      <template #header>
        <div class="card-header">
              <span>教育资源分析</span>
            </div>
              </template>
          
          <el-row :gutter="20">
            <!-- 资源使用统计 -->
            <el-col :span="12">
              <div class="chart-container">
                <h4>资源使用统计</h4>
                <div class="resource-usage-chart" ref="resourceUsageChart"></div>
          </div>
            </el-col>
            
            <!-- 资源评分分布 -->
            <el-col :span="12">
              <div class="chart-container">
                <h4>资源评分分布</h4>
                <div class="resource-rating-histogram" ref="resourceRatingHistogram"></div>
        </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" style="margin-top: 20px;">
            <!-- 资源下载趋势 -->
            <el-col :span="12">
              <div class="chart-container">
                <h4>资源下载趋势</h4>
                <div class="resource-download-trend" ref="resourceDownloadTrend"></div>
              </div>
            </el-col>
            
            <!-- 热门资源标签 -->
            <el-col :span="12">
              <div class="chart-container">
                <h4>热门资源标签</h4>
                <div class="resource-tags-wordcloud" ref="resourceTagsWordcloud"></div>
      </div>
            </el-col>
          </el-row>
    </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User, Monitor, DataAnalysis, Operation, Refresh, Search,
  View, Edit, Delete, Check, Warning, InfoFilled
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import chinaJson from '@/../public/files/other/city.json'
import {
  getSystemStatus,
  getSystemStatusCompat,
  getRealtimeOperations,
  getPermissionStats,
  getOperationLogs,
  getOperationLogDetail
} from '@/api/request'
import { useUserStore } from '@/store/user'
import axios from 'axios'

// 响应式数据
const selectedTimeRange = ref('today')

// 系统状态
const systemStatus = reactive({
  onlineUsers: 0,
  activeExperiments: 0,
  systemLoad: 0,
  todayOperations: 0
})

// 实时操作
const realtimeOperations = ref<any[]>([])



// 图表实例

// 新增图表实例
const userActivityHeatmap = ref<HTMLElement | null>(null)
const userRolePie = ref<HTMLElement | null>(null)
const userRegionMap = ref<HTMLElement | null>(null)
const userLearningSankey = ref<HTMLElement | null>(null)
const cpuGauge = ref<HTMLElement | null>(null)
const memoryGauge = ref<HTMLElement | null>(null)
const diskGauge = ref<HTMLElement | null>(null)
const networkGauge = ref<HTMLElement | null>(null)
const networkTrafficChart = ref<HTMLElement | null>(null)
const responseTimeBoxplot = ref<HTMLElement | null>(null)
const errorRateChart = ref<HTMLElement | null>(null)
const resourceUsageChart = ref<HTMLElement | null>(null)
const resourceRatingHistogram = ref<HTMLElement | null>(null)
const resourceDownloadTrend = ref<HTMLElement | null>(null)
const resourceTagsWordcloud = ref<HTMLElement | null>(null)

// 图表实例变量
let userActivityHeatmapInstance: echarts.ECharts | null = null
let userRolePieInstance: echarts.ECharts | null = null
let userRegionMapInstance: echarts.ECharts | null = null
let userLearningSankeyInstance: echarts.ECharts | null = null
let cpuGaugeInstance: echarts.ECharts | null = null
let memoryGaugeInstance: echarts.ECharts | null = null
let diskGaugeInstance: echarts.ECharts | null = null
let networkGaugeInstance: echarts.ECharts | null = null
let networkTrafficChartInstance: echarts.ECharts | null = null
let responseTimeBoxplotInstance: echarts.ECharts | null = null
let errorRateChartInstance: echarts.ECharts | null = null
let resourceUsageChartInstance: echarts.ECharts | null = null
let resourceRatingHistogramInstance: echarts.ECharts | null = null
let resourceDownloadTrendInstance: echarts.ECharts | null = null
let resourceTagsWordcloudInstance: echarts.ECharts | null = null

// 表格数据的响应式变量

const redisInfo = reactive({
  redisConnectedClients: '-',
  redisUsedMemoryHuman: '-',
  redisTotalCommandsProcessed: '-',
  redisUptimeInSeconds: '-',
  redisKeyspaceHits: '-',
  redisKeyspaceMisses: '-',
  redisTotalKeys: '-'
})

// 方法
const getOperationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    view: 'View',
    create: 'Edit',
    edit: 'Edit',
    delete: 'Delete',
    approve: 'Check'
  }
  return iconMap[type] || 'InfoFilled'
}

const getOperationClass = (type: string) => {
  return `operation-${type}`
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    success: 'success',
    failed: 'danger',
    pending: 'warning'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    pending: '待处理'
  }
  return statusMap[status] || '未知'
}

const formatTime = (time: any) => {
  if (!time) return '-'
  let date: Date
  if (typeof time === 'string' || typeof time === 'number') {
    date = new Date(time)
  } else if (time instanceof Date) {
    date = time
  } else {
    return '-'
  }
  if (isNaN(date.getTime())) return '-'
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  return date.toLocaleString()
}

// 获取系统状态
const fetchSystemStatus = async () => {
    const res: any = await getSystemStatus()
    if (res.code === 200) {
      Object.assign(systemStatus, res.data)
  }
}

// 获取实时操作
const fetchRealtimeOperations = async () => {
  try {
    const res: any = await getRealtimeOperations({ limit: 10 })
    if (res.code === 200) {
      realtimeOperations.value = res.data || []
    }
  } catch (error) {
    console.error('获取实时操作失败：', error)
  }
}






const fetchRedisInfo = async () => {
  const res = await axios.get('/monitor/performance')
  if(res.data && res.data.code === 200 && res.data.data) {
    const d = res.data.data
    redisInfo.redisConnectedClients = d.redisConnectedClients || '-'
    redisInfo.redisUsedMemoryHuman = d.redisUsedMemoryHuman || '-'
    redisInfo.redisTotalCommandsProcessed = d.redisTotalCommandsProcessed || '-'
    redisInfo.redisUptimeInSeconds = d.redisUptimeInSeconds || '-'
    redisInfo.redisKeyspaceHits = d.redisKeyspaceHits || '-'
    redisInfo.redisKeyspaceMisses = d.redisKeyspaceMisses || '-'
    redisInfo.redisTotalKeys = d.redisTotalKeys || '-'
  }
}

// 获取用户行为分析数据
const fetchUserBehaviorData = async () => {
  try {
    // 模拟数据 - 实际项目中应该从后端获取
    const userActivityData = generateUserActivityData()
    const userRoleData = generateUserRoleData()
    const userRegionData = generateUserRegionData()
    const userLearningData = generateUserLearningData()
    
    // 更新图表
    updateUserActivityHeatmap(userActivityData)
    updateUserRolePie(userRoleData)
    updateUserRegionMap(userRegionData)
    updateUserLearningSankey(userLearningData)
  } catch (error) {
    console.error('获取用户行为数据失败：', error)
  }
}

// 获取系统性能数据
const fetchSystemPerformanceData = async () => {
  try {
    // 模拟数据 - 实际项目中应该从后端获取
    const performanceData = generatePerformanceData()
    const networkData = generateNetworkData()
    const responseTimeData = generateResponseTimeData()
    const errorRateData = generateErrorRateData()
    
    // 更新图表
    updatePerformanceGauges(performanceData)
    updateNetworkTrafficChart(networkData)
    updateResponseTimeBoxplot(responseTimeData)
    updateErrorRateChart(errorRateData)
  } catch (error) {
    console.error('获取系统性能数据失败：', error)
  }
}

// 获取教育资源数据
const fetchResourceAnalysisData = async () => {
  try {
    // 模拟数据 - 实际项目中应该从后端获取
    const resourceUsageData = generateResourceUsageData()
    const resourceRatingData = generateResourceRatingData()
    const resourceDownloadData = generateResourceDownloadData()
    const resourceTagsData = generateResourceTagsData()
    
    // 更新图表
    updateResourceUsageChart(resourceUsageData)
    updateResourceRatingHistogram(resourceRatingData)
    updateResourceDownloadTrend(resourceDownloadData)
    updateResourceTagsWordcloud(resourceTagsData)
  } catch (error) {
    console.error('获取教育资源数据失败：', error)
  }
}

const refreshOperations = async () => {
  await Promise.all([
    fetchSystemStatus(),
    fetchRealtimeOperations()
  ])
  ElMessage.success('数据已刷新')
}

// 数据生成方法
const generateUserActivityData = () => {
  const hours = Array.from({length: 24}, (_, i) => i)
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []
  
  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < hours.length; j++) {
      data.push([j, i, Math.floor(Math.random() * 100)])
    }
  }
  
  return { hours, days, data }
}

const generateUserRoleData = () => {
  return [
    { value: 65, name: '学生' },
    { value: 25, name: '教师' },
    { value: 10, name: '管理员' }
  ]
}

const generateUserRegionData = () => {
  return [
    { name: '北京', value: 120 },
    { name: '上海', value: 100 },
    { name: '广州', value: 80 },
    { name: '深圳', value: 70 },
    { name: '杭州', value: 60 },
    { name: '南京', value: 50 },
    { name: '武汉', value: 40 },
    { name: '成都', value: 35 }
  ]
}

const generateUserLearningData = () => {
  return {
    nodes: [
      { name: '登录' },
      { name: '浏览实验' },
      { name: '开始实验' },
      { name: '完成实验' },
      { name: '提交报告' },
      { name: '查看成绩' }
    ],
    links: [
      { source: '登录', target: '浏览实验', value: 100 },
      { source: '浏览实验', target: '开始实验', value: 80 },
      { source: '开始实验', target: '完成实验', value: 60 },
      { source: '完成实验', target: '提交报告', value: 50 },
      { source: '提交报告', target: '查看成绩', value: 45 }
    ]
  }
}

const generatePerformanceData = () => {
  return {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
    network: Math.floor(Math.random() * 100)
  }
}

const generateNetworkData = () => {
  const times = Array.from({length: 24}, (_, i) => `${i}:00`)
  return {
    times,
    upload: Array.from({length: 24}, () => Math.floor(Math.random() * 100)),
    download: Array.from({length: 24}, () => Math.floor(Math.random() * 200))
  }
}

const generateResponseTimeData = () => {
  return [
    [10, 20, 30, 40, 50],
    [15, 25, 35, 45, 55],
    [12, 22, 32, 42, 52],
    [18, 28, 38, 48, 58]
  ]
}

const generateErrorRateData = () => {
  const times = Array.from({length: 24}, (_, i) => `${i}:00`)
  return {
    times,
    errorRate: Array.from({length: 24}, () => Math.random() * 5)
  }
}

const generateResourceUsageData = () => {
  return [
    { name: '实验文档', value: 45 },
    { name: '视频教程', value: 35 },
    { name: '代码示例', value: 25 },
    { name: '数据集', value: 20 },
    { name: '工具软件', value: 15 }
  ]
}

const generateResourceRatingData = () => {
  return Array.from({length: 10}, (_, i) => Math.floor(Math.random() * 100))
}

const generateResourceDownloadData = () => {
  const times = Array.from({length: 7}, (_, i) => `第${i+1}天`)
  return {
    times,
    downloads: Array.from({length: 7}, () => Math.floor(Math.random() * 1000))
  }
}

const generateResourceTagsData = () => {
  return [
    { name: 'Java', value: 100 },
    { name: 'Python', value: 80 },
    { name: '数据库', value: 60 },
    { name: '算法', value: 50 },
    { name: '机器学习', value: 40 },
    { name: 'Web开发', value: 35 },
    { name: '移动开发', value: 30 },
    { name: '云计算', value: 25 }
  ]
}

// 图表更新方法
const updateUserActivityHeatmap = (data: any) => {
  if (userActivityHeatmapInstance) {
    userActivityHeatmapInstance.setOption({
      tooltip: { position: 'top' },
      grid: { height: '50%', top: '10%' },
      xAxis: { type: 'category', data: data.hours, splitArea: { show: true } },
      yAxis: { type: 'category', data: data.days, splitArea: { show: true } },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%'
      },
      series: [{
        name: '用户活跃度',
        type: 'heatmap',
        data: data.data,
        label: { show: true },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    })
  }
}

const updateUserRolePie = (data: any) => {
  if (userRolePieInstance) {
    userRolePieInstance.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '用户角色',
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    })
  }
}

const updateUserRegionMap = (data: any) => {
  if (userRegionMapInstance) {
    userRegionMapInstance.setOption({
      tooltip: { trigger: 'item' },
      visualMap: {
        min: 0,
        max: 120,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true
      },
      series: [{
        name: '用户分布',
        type: 'map',
        map: 'china',
        roam: true,
        emphasis: { label: { show: true } },
        data: data
      }]
    })
  }
}

const updateUserLearningSankey = (data: any) => {
  if (userLearningSankeyInstance) {
    userLearningSankeyInstance.setOption({
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [{
        type: 'sankey',
        layout: 'none',
        data: data.nodes,
        links: data.links,
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'source', curveness: 0.5 }
      }]
    })
  }
}

const updatePerformanceGauges = (data: any) => {
  // CPU仪表盘
  if (cpuGaugeInstance) {
    cpuGaugeInstance.setOption({
      series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: data.cpu, name: 'CPU使用率' }]
      }]
    })
  }
  
  // 内存仪表盘
  if (memoryGaugeInstance) {
    memoryGaugeInstance.setOption({
      series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: data.memory, name: '内存使用率' }]
      }]
    })
  }
  
  // 磁盘仪表盘
  if (diskGaugeInstance) {
    diskGaugeInstance.setOption({
      series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: data.disk, name: '磁盘使用率' }]
      }]
    })
  }
  
  // 网络仪表盘
  if (networkGaugeInstance) {
    networkGaugeInstance.setOption({
      series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: data.network, name: '网络使用率' }]
      }]
    })
  }
}

const updateNetworkTrafficChart = (data: any) => {
  if (networkTrafficChartInstance) {
    networkTrafficChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['上传流量', '下载流量'] },
      xAxis: { type: 'category', data: data.times },
      yAxis: { type: 'value' },
      series: [
        { name: '上传流量', type: 'line', data: data.upload },
        { name: '下载流量', type: 'line', data: data.download }
      ]
    })
  }
}

const updateResponseTimeBoxplot = (data: any) => {
  if (responseTimeBoxplotInstance) {
    responseTimeBoxplotInstance.setOption({
      tooltip: { trigger: 'item' },
      xAxis: { type: 'category', data: ['API1', 'API2', 'API3', 'API4'] },
      yAxis: { type: 'value' },
      series: [{
        name: '响应时间',
        type: 'boxplot',
        data: data
      }]
    })
  }
}

const updateErrorRateChart = (data: any) => {
  if (errorRateChartInstance) {
    errorRateChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.times },
      yAxis: { type: 'value' },
      series: [{
        name: '错误率',
        type: 'line',
        data: data.errorRate,
        areaStyle: {}
      }]
    })
  }
}

const updateResourceUsageChart = (data: any) => {
  if (resourceUsageChartInstance) {
    resourceUsageChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map((item: any) => item.name) },
      yAxis: { type: 'value' },
      series: [{
        name: '使用次数',
        type: 'bar',
        data: data.map((item: any) => item.value)
      }]
    })
  }
}

const updateResourceRatingHistogram = (data: any) => {
  if (resourceRatingHistogramInstance) {
    resourceRatingHistogramInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['1-2分', '2-3分', '3-4分', '4-5分', '5-6分', '6-7分', '7-8分', '8-9分', '9-10分'] },
      yAxis: { type: 'value' },
      series: [{
        name: '资源数量',
        type: 'bar',
        data: data
      }]
    })
  }
}

const updateResourceDownloadTrend = (data: any) => {
  if (resourceDownloadTrendInstance) {
    resourceDownloadTrendInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.times },
      yAxis: { type: 'value' },
      series: [{
        name: '下载量',
        type: 'line',
        data: data.downloads,
        areaStyle: {}
      }]
    })
  }
}

const updateResourceTagsWordcloud = (data: any) => {
  if (resourceTagsWordcloudInstance) {
    resourceTagsWordcloudInstance.setOption({
      series: [{
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '70%',
        height: '80%',
        right: null,
        bottom: null,
        sizeRange: [12, 60],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            return 'rgb(' + [
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160)
            ].join(',') + ')'
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        data: data
      }]
    })
  }
}

// 初始化图表
const initAllCharts = () => {
  // 用户活跃度热力图
  if (userActivityHeatmap.value) {
    userActivityHeatmapInstance = echarts.init(userActivityHeatmap.value as HTMLElement)
    const heatmapData = generateUserActivityData()
    userActivityHeatmapInstance.setOption({
      tooltip: { position: 'top' },
      grid: { height: '50%', top: '10%' },
      xAxis: { type: 'category', data: heatmapData.hours, splitArea: { show: true } },
      yAxis: { type: 'category', data: heatmapData.days, splitArea: { show: true } },
      visualMap: {
        min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '15%'
      },
      series: [{
        name: '用户活跃度',
        type: 'heatmap',
        data: heatmapData.data,
        label: { show: true },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    })
  }
  // 用户角色分布饼图
  if (userRolePie.value) {
    userRolePieInstance = echarts.init(userRolePie.value as HTMLElement)
    const pieData = generateUserRoleData()
    userRolePieInstance.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        name: '用户角色',
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    })
  }
  // 用户地域分布地图
  if (userRegionMap.value) {
    echarts.registerMap('china', chinaJson)
    userRegionMapInstance = echarts.init(userRegionMap.value as HTMLElement)
    const mapData = generateUserRegionData()
    userRegionMapInstance.setOption({
      tooltip: { trigger: 'item' },
      visualMap: {
        min: 0, max: 120, left: 'left', top: 'bottom', text: ['高', '低'], calculable: true
      },
      series: [{
        name: '用户分布',
        type: 'map',
        map: 'china',
        roam: true,
        emphasis: { label: { show: true } },
        data: mapData
      }]
    })
  }
  // 用户学习路径桑基图
  if (userLearningSankey.value) {
    userLearningSankeyInstance = echarts.init(userLearningSankey.value as HTMLElement)
    const sankeyData = generateUserLearningData()
    userLearningSankeyInstance.setOption({
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [{
        type: 'sankey',
        layout: 'none',
        data: sankeyData.nodes,
        links: sankeyData.links,
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'source', curveness: 0.5 }
      }]
    })
  }
  // CPU仪表盘
  if (cpuGauge.value) {
    cpuGaugeInstance = echarts.init(cpuGauge.value as HTMLElement)
    const performanceData = generatePerformanceData()
    cpuGaugeInstance.setOption({
      series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: performanceData.cpu, name: 'CPU使用率' }]
      }]
    })
  }
  // 内存仪表盘
  if (memoryGauge.value) {
    memoryGaugeInstance = echarts.init(memoryGauge.value as HTMLElement)
    const performanceData = generatePerformanceData()
    memoryGaugeInstance.setOption({
      series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: performanceData.memory, name: '内存使用率' }]
      }]
    })
  }
  // 磁盘仪表盘
  if (diskGauge.value) {
    diskGaugeInstance = echarts.init(diskGauge.value as HTMLElement)
    const performanceData = generatePerformanceData()
    diskGaugeInstance.setOption({
      series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: performanceData.disk, name: '磁盘使用率' }]
      }]
    })
  }
  // 网络仪表盘
  if (networkGauge.value) {
    networkGaugeInstance = echarts.init(networkGauge.value as HTMLElement)
    const performanceData = generatePerformanceData()
    networkGaugeInstance.setOption({
      series: [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: performanceData.network, name: '网络使用率' }]
      }]
    })
  }
  // 网络流量图表
  if (networkTrafficChart.value) {
    networkTrafficChartInstance = echarts.init(networkTrafficChart.value as HTMLElement)
    const networkData = generateNetworkData()
    networkTrafficChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['上传流量', '下载流量'] },
      xAxis: { type: 'category', data: networkData.times },
      yAxis: { type: 'value' },
      series: [
        { name: '上传流量', type: 'line', data: networkData.upload },
        { name: '下载流量', type: 'line', data: networkData.download }
      ]
    })
  }
  // 响应时间箱线图
  if (responseTimeBoxplot.value) {
    responseTimeBoxplotInstance = echarts.init(responseTimeBoxplot.value as HTMLElement)
    const responseTimeData = generateResponseTimeData()
    responseTimeBoxplotInstance.setOption({
      tooltip: { trigger: 'item' },
      xAxis: { type: 'category', data: ['API1', 'API2', 'API3', 'API4'] },
      yAxis: { type: 'value' },
      series: [{
        name: '响应时间',
        type: 'boxplot',
        data: responseTimeData
      }]
    })
  }
  // 错误率图表
  if (errorRateChart.value) {
    errorRateChartInstance = echarts.init(errorRateChart.value as HTMLElement)
    const errorRateData = generateErrorRateData()
    errorRateChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: errorRateData.times },
      yAxis: { type: 'value' },
      series: [{
        name: '错误率',
        type: 'line',
        data: errorRateData.errorRate,
        areaStyle: {}
      }]
    })
  }
  // 资源使用图表
  if (resourceUsageChart.value) {
    resourceUsageChartInstance = echarts.init(resourceUsageChart.value as HTMLElement)
    const resourceUsageData = generateResourceUsageData()
    resourceUsageChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: resourceUsageData.map((item: any) => item.name) },
      yAxis: { type: 'value' },
      series: [{
        name: '使用次数',
        type: 'bar',
        data: resourceUsageData.map((item: any) => item.value)
      }]
    })
  }
  // 资源评分直方图
  if (resourceRatingHistogram.value) {
    resourceRatingHistogramInstance = echarts.init(resourceRatingHistogram.value as HTMLElement)
    const resourceRatingData = generateResourceRatingData()
    resourceRatingHistogramInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['1-2分', '2-3分', '3-4分', '4-5分', '5-6分', '6-7分', '7-8分', '8-9分', '9-10分'] },
      yAxis: { type: 'value' },
      series: [{
        name: '资源数量',
        type: 'bar',
        data: resourceRatingData
      }]
    })
  }
  // 资源下载趋势
  if (resourceDownloadTrend.value) {
    resourceDownloadTrendInstance = echarts.init(resourceDownloadTrend.value as HTMLElement)
    const resourceDownloadData = generateResourceDownloadData()
    resourceDownloadTrendInstance.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: resourceDownloadData.times },
      yAxis: { type: 'value' },
      series: [{
        name: '下载量',
        type: 'line',
        data: resourceDownloadData.downloads,
        areaStyle: {}
      }]
    })
  }
  // 资源标签词云
  if (resourceTagsWordcloud.value) {
    resourceTagsWordcloudInstance = echarts.init(resourceTagsWordcloud.value as HTMLElement)
    const resourceTagsData = generateResourceTagsData()
    resourceTagsWordcloudInstance.setOption({
      series: [{
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '70%',
        height: '80%',
        right: null,
        bottom: null,
        sizeRange: [12, 60],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            return 'rgb(' + [
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160)
            ].join(',') + ')'
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        data: resourceTagsData
      }]
    })
  }
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    fetchSystemStatus(),
    fetchRealtimeOperations()
  ])
  
  // 初始化图表数据
  await Promise.all([
    
    fetchRedisInfo(),
    fetchUserBehaviorData(),
    fetchSystemPerformanceData(),
    fetchResourceAnalysisData()
  ])
}

// 定时刷新
let refreshTimer: ReturnType<typeof setInterval> | null = null

const startAutoRefresh = () => {
  refreshTimer = setInterval(async () => {
    await Promise.all([
      fetchSystemStatus(),
      fetchRealtimeOperations()
    ])
  }, 10000) // 每10秒刷新一次
}

// 监听时间范围变化
const handleTimeRangeChange = async () => {
  await fetchUserBehaviorData()
}

// 生命周期
onMounted(async () => {
  await initData()
  await initAllCharts()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 清理所有图表实例
  const chartInstances = [
    userActivityHeatmapInstance,
    userRolePieInstance,
    userRegionMapInstance,
    userLearningSankeyInstance,
    cpuGaugeInstance,
    memoryGaugeInstance,
    diskGaugeInstance,
    networkGaugeInstance,
    networkTrafficChartInstance,
    responseTimeBoxplotInstance,
    errorRateChartInstance,
    resourceUsageChartInstance,
    resourceRatingHistogramInstance,
    resourceDownloadTrendInstance,
    resourceTagsWordcloudInstance
  ]
  
  chartInstances.forEach(instance => {
    if (instance) {
      instance.dispose()
    }
  })
})

const userStore = useUserStore()
userStore.initUser()
</script>

<style scoped>
.system-monitor {
  padding: 20px;
  background: linear-gradient(135deg, #ececff 0%, #f8f8ff 100%);
  min-height: 100vh;
  margin-top:-22px;
  margin-left:-22px;
  margin-right:-22px;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
}

.page-header p {
  font-size: 16px;
  color: #7C3AED;
  margin: 0;
  font-weight: 500;
}

.status-cards {
  margin-bottom: 24px;
}

.status-card, .monitor-card {
  border-radius: 18px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
}
.status-card:hover, .monitor-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 48px #a18fff33, 0 4px 16px #7c3aed22;
}
.card-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}

.online-users .card-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.active-experiments .card-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.system-load .card-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.today-operations .card-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-info {
  flex: 1;
}

.card-number {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.card-label {
  font-size: 14px;
  color: #909399;
}

.monitor-content {
  margin-bottom: 24px;
}

.monitor-card {
  border-radius: 18px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.el-button[type="primary"] {
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px #a18fff44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-button[type="primary"]:hover {
  background: linear-gradient(90deg, #a18fff 0%, #7C3AED 100%);
  box-shadow: 0 6px 24px #7c3aed55;
  transform: scale(1.04);
}
.operations-list {
  max-height: 400px;
  overflow-y: auto;
}

.operation-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.operation-view {
  background: rgba(103, 194, 58, 0.1);
  border-left-color: #67c23a;
}

.operation-create {
  background: rgba(64, 158, 255, 0.1);
  border-left-color: #409eff;
}

.operation-edit {
  background: rgba(230, 162, 60, 0.1);
  border-left-color: #e6a23c;
}

.operation-delete {
  background: rgba(245, 108, 108, 0.1);
  border-left-color: #f56c6c;
}

.operation-approve {
  background: rgba(103, 194, 58, 0.1);
  border-left-color: #67c23a;
}

.operation-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #6366f1;
}

.operation-content {
  flex: 1;
}

.operation-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.operation-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.operation-status {
  margin-left: 12px;
}

.empty-operations {
  text-align: center;
  padding: 40px 20px;
}

.permission-stats {
  max-height: 400px;
  overflow-y: auto;
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.permission-item:last-child {
  border-bottom: none;
}

.permission-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.permission-code {
  font-size: 12px;
  color: #909399;
}

.permission-count {
  text-align: right;
}

.count {
  font-size: 20px;
  font-weight: 700;
  color: #6366f1;
}

.unit {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.detail-monitor {
  margin-bottom: 24px;
}

.user-behavior-chart,
.performance-chart {
  height: 300px;
}

.log-table-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

.log-detail pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
}

.redis-info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 12px;
}
.redis-info-item {
  min-width: 180px;
  font-size: 16px;
  color: #333;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 18px;
  box-shadow: 0 2px 8px rgba(107, 79, 255, 0.04);
  margin-bottom: 8px;
}
.label {
  color: #6b4fff;
  font-weight: 600;
}
.value {
  margin-left: 8px;
  font-weight: 700;
}

.operation-desc {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}
.operation-meta {
  margin: 4px 0 0 0;
  color: #888;
  font-size: 13px;
  line-height: 1.7;
}

/* 新增图表样式 */
.chart-container {
  margin-bottom: 20px;
}

.chart-container h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.user-activity-heatmap,
.user-role-pie,
.user-region-map,
.user-learning-sankey,
.cpu-gauge,
.memory-gauge,
.disk-gauge,
.network-gauge,
.network-traffic-chart,
.response-time-boxplot,
.error-rate-chart,
.resource-usage-chart,
.resource-rating-histogram,
.resource-download-trend,
.resource-tags-wordcloud {
  height: 300px;
  width: 100%;
}

/* 仪表盘特殊样式 */
.cpu-gauge,
.memory-gauge,
.disk-gauge,
.network-gauge {
  height: 200px;
}

/* 词云图特殊样式 */
.resource-tags-wordcloud {
  height: 250px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .status-cards .el-col {
    width: 50% !important;
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .system-monitor {
    padding: 10px;
  }
  
  .status-cards .el-col {
    width: 100% !important;
  }
  
  .monitor-content .el-col,
  .detail-monitor .el-col {
    width: 100% !important;
    margin-bottom: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-actions .el-input,
  .header-actions .el-select {
    width: 100% !important;
  }
  
  /* 移动端图表高度调整 */
  .user-activity-heatmap,
  .user-role-pie,
  .user-region-map,
  .user-learning-sankey,
  .network-traffic-chart,
  .response-time-boxplot,
  .error-rate-chart,
  .resource-usage-chart,
  .resource-rating-histogram,
  .resource-download-trend,
  .resource-tags-wordcloud {
    height: 250px;
  }
  
  .cpu-gauge,
  .memory-gauge,
  .disk-gauge,
  .network-gauge {
    height: 150px;
  }
}
</style> 