<template>
  <div class="system-admin-dashboard department-admin-new sysadmin-frosted-bg">
    <div class="frosted-float-bg"></div>
    <div class="header-glass sysadmin-glass">
      <h1>系统管理员控制台</h1>
      <div class="user-info">
        <span>欢迎，{{ userStore.userName }}</span>
        <span class="role">系统管理员</span>
      </div>
    </div>
    <div class="dashboard-main sysadmin-main-frosted new-admin-grid">
      <!-- 左列 -->
      <div class="admin-col admin-col-left">
        <div class="stats-group-card stats-grid sysadmin-frosted-card">
          <!-- 总用户数、院系数量、今日登录次数 -->
          <div class="stat-card">
            <h3>总用户数</h3>
            <div class="stat-number">{{ statistics.totalUsers }}</div>
            <div class="stat-label">系统注册用户</div>
          </div>
          <div class="stat-card">
            <h3>院系数量</h3>
            <div class="stat-number">{{ statistics.totalDepartments }}</div>
            <div class="stat-label">系统院系</div>
          </div>
          <div class="stat-card">
            <h3>今日登录次数</h3>
            <div class="stat-number">{{ statistics.todayLoginCount }}</div>
            <div class="stat-label">今日所有登录行为</div>
          </div>
        </div>
      </div>
      <!-- 中列 -->
      <div class="admin-col admin-col-center">
        <div class="dashboard-card sysadmin-chart-card">
          <div class="chart-decoration"></div>
          <h3>实验类型分布</h3>
          <div ref="experimentTypeChart" class="dashboard-chart"></div>
        </div>
      </div>
      <!-- 右列 -->
      <div class="admin-col admin-col-right">
        <div class="dashboard-card sysadmin-chart-card log-sankey-full">
          <div class="chart-decoration"></div>
          <h3>日志操作流向分析</h3>
          <div ref="logSankeyChart" class="dashboard-chart log-sankey-chart-full"></div>
        </div>
        <div class="dashboard-card sysadmin-chart-card">
          <div class="chart-decoration"></div>
          <h3>用户身份分布</h3>
          <div ref="userRoleChart" class="dashboard-chart user-role-chart-large"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import * as echarts from 'echarts'
import { getStatistics } from '@/api/request'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

// 统计数据
const statistics = reactive({
  totalUsers: 0,
  activeUsers: 0,
  totalDepartments: 0,
  todayLogins: 0,
  todayLoginCount: 0 // 今日所有登录行为总次数
})


// 图表ref
const experimentTypeChart = ref<HTMLElement | null>(null)
const experimentFinishChart = ref<HTMLElement | null>(null)
const experimentTopChart = ref<HTMLElement | null>(null)
const logSankeyChart = ref<HTMLElement | null>(null)
const userRoleChart = ref<HTMLElement | null>(null)

let experimentTypeChartInstance: echarts.ECharts | null = null
let experimentFinishChartInstance: echarts.ECharts | null = null
let experimentTopChartInstance: echarts.ECharts | null = null
let logSankeyChartInstance: echarts.ECharts | null = null
let userRoleChartInstance: echarts.ECharts | null = null

// 实验统计数据
interface NameValue { name: string; value: number }
const typeData = ref<NameValue[]>([])
const finishData = ref<NameValue[]>([])
const topData = ref<NameValue[]>([])

const userRoleData = ref<any[]>([])

const logSankeyData = ref<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] })

const fetchExperimentStatistics = async () => {
  try {
    // 实验类型分布
    const typeRes = await axios.get('/system-admin/statistics/experiment-type')
    if (Array.isArray(typeRes.data)) {
      typeData.value = typeRes.data
    } else if (typeRes.data && Array.isArray(typeRes.data.data)) {
      typeData.value = typeRes.data.data
    } else {
      typeData.value = []
    }
    // 实验完成率排行
    const finishRes = await axios.get('/system-admin/statistics/experiment-finish-rate')
    if (Array.isArray(finishRes.data)) {
      finishData.value = finishRes.data.length > 0 ? finishRes.data : [
        { name: '实验A', value: 95 },
        { name: '实验B', value: 88 },
        { name: '实验C', value: 80 },
        { name: '实验D', value: 75 },
        { name: '实验E', value: 60 }
      ]
    } else if (finishRes.data && Array.isArray(finishRes.data.data)) {
      finishData.value = finishRes.data.data.length > 0 ? finishRes.data.data : [
        { name: '实验A', value: 95 },
        { name: '实验B', value: 88 },
        { name: '实验C', value: 80 },
        { name: '实验D', value: 75 },
        { name: '实验E', value: 60 }
      ]
    } else {
      finishData.value = [
  { name: '实验A', value: 95 },
  { name: '实验B', value: 88 },
  { name: '实验C', value: 80 },
  { name: '实验D', value: 75 },
  { name: '实验E', value: 60 }
]
    }
    // 实验参与人数Top5
    const topRes = await axios.get('/system-admin/statistics/experiment-top-participants')
    if (Array.isArray(topRes.data)) {
      topData.value = topRes.data.length > 0 ? topRes.data : [
        { name: '实验A', value: 120 },
        { name: '实验B', value: 110 },
        { name: '实验C', value: 90 },
        { name: '实验D', value: 80 },
        { name: '实验E', value: 70 }
      ]
    } else if (topRes.data && Array.isArray(topRes.data.data)) {
      topData.value = topRes.data.data.length > 0 ? topRes.data.data : [
        { name: '实验A', value: 120 },
        { name: '实验B', value: 110 },
        { name: '实验C', value: 90 },
        { name: '实验D', value: 80 },
        { name: '实验E', value: 70 }
      ]
    } else {
      topData.value = [
  { name: '实验A', value: 120 },
  { name: '实验B', value: 110 },
  { name: '实验C', value: 90 },
  { name: '实验D', value: 80 },
  { name: '实验E', value: 70 }
]
    }
  } catch (e) {
    ElMessage.error('获取实验统计数据失败')
  }
}

const renderExperimentTypeChart = () => {
  if (!experimentTypeChart.value) return
  // 销毁旧实例
  if (experimentTypeChartInstance) {
    experimentTypeChartInstance.dispose()
  }
  experimentTypeChartInstance = echarts.init(experimentTypeChart.value)
  // 兼容各种类型，确保为数组
  const arr = Array.isArray(typeData.value) ? typeData.value : []
  const filteredData = arr.filter(d => typeof d.name === 'string' && d.name.trim() !== '')
  if (filteredData.length === 0) {
    experimentTypeChartInstance.setOption({
      title: { text: '暂无有效数据', left: 'center', top: 'middle', textStyle: { color: '#aaa', fontSize: 14 } },
      series: []
    })
    experimentTypeChartInstance.resize()
    return
  }
  experimentTypeChartInstance.setOption({
    tooltip: { trigger: 'item', textStyle: { fontSize: 12, color: '#666' } },
    legend: { bottom: 0, textStyle: { fontSize: 12, color: '#888' } },
    color: [
      '#6b4fff', '#a18fff', '#b3c6ff', '#e0e7ff', '#4f8cff', '#8e9fff', '#c7d2fe', '#7c3aed', '#43e97b', '#38f9d7'
    ],
    series: [
      {
        name: '实验类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 12,
          shadowColor: 'rgba(107,79,255,0.10)'
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c} ({d}%)',
          fontWeight: 'bold',
          fontSize: 13,
          color: '#6b4fff',
          textShadowColor: '#b3c6ff',
          textShadowBlur: 4
        },
        labelLine: {
          length: 14,
          length2: 8,
          lineStyle: { color: '#a18fff', width: 1 }
        },
        data: filteredData
      }
    ]
  })
  experimentTypeChartInstance.resize()
}

const renderExperimentFinishChart = () => {
  if (!experimentFinishChart.value) return
  experimentFinishChartInstance = echarts.init(experimentFinishChart.value)
  experimentFinishChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: finishData.value.map(d => d.name) },
    yAxis: { type: 'value', max: 100 },
    series: [
      {
        name: '完成率',
        type: 'bar',
        data: finishData.value.map(d => d.value),
        barWidth: 32,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: '#43e97b'
        },
        label: { show: true, position: 'top', formatter: '{c}%' }
      }
    ]
  })
}

const renderExperimentTopChart = () => {
  if (!experimentTopChart.value) return
  experimentTopChartInstance = echarts.init(experimentTopChart.value)
  experimentTopChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: topData.value.map(d => d.name) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '参与人数',
        type: 'bar',
        data: topData.value.map(d => d.value),
        barWidth: 32,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: '#6b4fff'
        },
        label: { show: true, position: 'top' }
      }
    ]
  })
}

const fetchLogSankeyData = async () => {
  try {
    // 获取全部日志（可根据需要分页或筛选）
    const res = await axios.get('/system/logs/simple/list')
    let logs = []
    if (Array.isArray(res.data)) {
      logs = res.data
    } else if (res.data && Array.isArray(res.data.data)) {
      logs = res.data.data
    } else {
      logs = []
    }
    // 构造桑基图数据：操作类型-模块-状态
    const nodesSet = new Set<string>()
    const links: any[] = []
    logs.forEach((log: any) => {
      const op = log.operation || '未知操作'
      const mod = log.module || '未知模块'
      const status = log.status === 1 ? '成功' : '失败'
      nodesSet.add(op)
      nodesSet.add(mod)
      nodesSet.add(status)
      // 操作类型 -> 模块
      links.push({ source: op, target: mod, value: 1 })
      // 模块 -> 状态
      links.push({ source: mod, target: status, value: 1 })
    })
    const nodes = Array.from(nodesSet).map(name => ({ name }))
    logSankeyData.value = { nodes, links }
  } catch (e) {
    ElMessage.error('获取日志数据失败')
  }
}

const renderLogSankeyChart = () => {
  if (!logSankeyChart.value || !logSankeyData.value.nodes) return
  if (!logSankeyChartInstance) {
    logSankeyChartInstance = echarts.init(logSankeyChart.value)
  }
  logSankeyChartInstance.setOption({
    backgroundColor: 'rgba(255,255,255,0)',
    tooltip: { trigger: 'item', formatter: '{b}: {c}', textStyle: { fontSize: 12, color: '#666' } },
    series: [
      {
        type: 'sankey',
        data: logSankeyData.value.nodes,
        links: logSankeyData.value.links,
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            shadowBlur: 32,
            shadowColor: 'rgba(107,79,255,0.25)',
            borderColor: '#6b4fff',
            borderWidth: 4
          },
          lineStyle: {
            color: 'rgba(107,79,255,0.5)',
            shadowBlur: 16,
            shadowColor: '#a18fff',
            opacity: 1
          },
          label: {
            color: '#b3c6ff',
            fontSize: 12,
            fontWeight: 'normal',
            textShadowColor: '#e0e7ff',
            textShadowBlur: 2
          }
        },
        lineStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#6b4fff' },
              { offset: 1, color: '#a18fff' }
            ]
          },
          opacity: 0.6,
          width: 16,
          shadowBlur: 8,
          shadowColor: '#b3c6ff'
        },
        itemStyle: {
          borderRadius: 12,
          shadowBlur: 18,
          shadowColor: 'rgba(107,79,255,0.12)',
          borderColor: '#e0e7ff',
          borderWidth: 2,
          color: '#6b4fff'
        },
        label: {
          color: '#b3c6ff',
          fontSize: 12,
          fontWeight: 'normal',
          textShadowColor: '#e0e7ff',
          textShadowBlur: 2
        },
        nodeGap: 24,
        nodeWidth: 32,
        layoutIterations: 0
      }
    ]
  })
}

const fetchUserRoleData = async () => {
  try {
    const res = await axios.get('/system-admin/statistics/user-role-distribution')
    if (Array.isArray(res.data)) {
      userRoleData.value = res.data
    } else if (res.data && Array.isArray(res.data.data)) {
      userRoleData.value = res.data.data
    }
  } catch (e) {
    ElMessage.error('获取用户身份分布失败')
  }
}

const renderUserRoleChart = () => {
  if (!userRoleChart.value || !userRoleData.value.length) return
  if (!userRoleChartInstance) {
    userRoleChartInstance = echarts.init(userRoleChart.value)
  }
  userRoleChartInstance.setOption({
    backgroundColor: 'rgba(255,255,255,0)',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', textStyle: { fontSize: 14, color: '#666' } },
    legend: undefined,
    series: [
      {
        type: 'sunburst',
        data: userRoleData.value.map((item: any) => ({ name: item.name, value: item.value })),
        radius: ['0%', '100%'], // 放大图形
        center: ['50%', '50%'],
        label: {
          rotate: 'radial',
          fontSize: 18, // 放大字体
          fontWeight: 'bold',
          color: '#6b4fff',
          textShadowColor: '#b3c6ff',
          textShadowBlur: 4
        },
        emphasis: {
          focus: 'ancestor',
          itemStyle: {
            shadowBlur: 40,
            shadowColor: 'rgba(107,79,255,0.4)',
            borderColor: '#a18fff',
            borderWidth: 4
          },
          label: {
            color: '#fff',
            fontSize: 24, // 高亮时更大
            textShadowColor: '#6b4fff',
            textShadowBlur: 8
          }
        },
        itemStyle: {
          borderRadius: 16,
          shadowBlur: 20,
          shadowColor: 'rgba(107,79,255,0.12)',
          borderColor: '#e0e7ff',
          borderWidth: 2
        },
        levels: [
          {},
          { r0: '0%', r: '40%', label: { rotate: 0 } },
          { r0: '40%', r: '70%' },
          { r0: '70%', r: '100%', label: { position: 'outside', padding: 3, silent: false } }
        ],
        color: [
          '#6b4fff', '#a18fff', '#b3c6ff', '#e0e7ff', '#4f8cff', '#8e9fff', '#c7d2fe', '#7c3aed'
        ]
      }
    ]
  })
  userRoleChartInstance.resize()
}

const initSimulationCharts = async () => {
  await nextTick()
  renderExperimentTypeChart()
  renderExperimentFinishChart()
  renderExperimentTopChart()
  await fetchUserRoleData()
  renderUserRoleChart()
  await fetchLogSankeyData()
  renderLogSankeyChart()
}

// 方法
const loadStatistics = async () => {
  try {
    // 1. 获取总用户数、活跃用户、院系数量、今日登录用户数
    const res = await axios.get('/system-admin/statistics/overview')
    console.log('后端返回 /system-admin/statistics/overview:', res.data)
    if (res.data && res.data.data) {
      statistics.totalUsers = res.data.data.totalUsers || 0
      statistics.activeUsers = res.data.data.activeUsers || 0
      statistics.totalDepartments = res.data.data.totalDepartments || 0
      statistics.todayLogins = res.data.data.todayLogins || 0
      console.log('赋值后 statistics:', statistics)
    }
    // 2. 获取今日所有登录行为总次数
    const res2 = await axios.get('/monitor/login-operation/today-count')
    console.log('后端返回 /monitor/login-operation/today-count:', res2.data)
    if (res2.data && res2.data.code === 200) {
      statistics.todayLoginCount = res2.data.data || 0
      console.log('赋值后 statistics.todayLoginCount:', statistics.todayLoginCount)
    }
  } catch (e) {
    ElMessage.error('获取统计数据失败')
  }
}

// 生命周期
onMounted(() => {
  loadStatistics()
  fetchExperimentStatistics().then(async () => {
    await nextTick()
    renderExperimentTypeChart()
    initSimulationCharts()
  })
  window.addEventListener('resize', renderUserRoleChart)
})
onUnmounted(() => {
  experimentTypeChartInstance?.dispose()
  experimentFinishChartInstance?.dispose()
  experimentTopChartInstance?.dispose()
  logSankeyChartInstance?.dispose()
  userRoleChartInstance?.dispose()
  window.removeEventListener('resize', renderUserRoleChart)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap');

body {
  font-family: 'Roboto Condensed', Arial, sans-serif;
}

/* 主体背景和布局 */
.system-admin-dashboard {
  position: relative;
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
}
.frosted-float-bg {
  display: none;
}
.sysadmin-main-frosted {
  display: grid;
  grid-template-columns: 380px minmax(320px, 1fr) 420px;
  gap: 24px;
  max-width: 1680px;
  margin: 0 auto;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  position: relative;
  z-index: 1;
  border: none;
  backdrop-filter: none;
}

.main-left.left-panel.sysadmin-left-float {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: linear-gradient(135deg, #f8f8ff 80%, #ececff 100%);
  border-radius: 20px;
  box-shadow: 0 2px 12px #bdbdfc22;
}

.stats-group-card, .quick-actions-row, .recent-activities-row {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;
}
.stats-group-card:hover, .quick-actions-row:hover, .recent-activities-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.stat-card {
  background: #ffffff;
  border-radius: 6px;
  box-shadow: none;
  text-align: center;
  padding: 20px;
  transition: background-color 0.2s;
  border: 1px solid #e5e7eb;
  position: relative;
}
.stat-card::before {
  display: none;
}
.stat-card:hover {
  background: #f9fafb;
}
.stat-card h3 {
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-number {
  color: #1f2937;
  font-size: 32px;
  font-weight: 600;
  margin: 8px 0;
  letter-spacing: 0;
}
.stat-label {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 400;
  margin-top: 4px;
}

.action-btn {
  background: #ffffff;
  color: #374151;
  border-radius: 6px;
  box-shadow: none;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 16px;
  margin-bottom: 8px;
  width: 100%;
  transition: all 0.2s;
  position: relative;
  text-align: left;
  justify-content: flex-start;
}
.action-btn::before {
  display: none;
}
.action-btn:hover {
  background: #f9fafb;
  color: #1f2937;
  border-color: #d1d5db;
}
.action-btn .el-icon {
  transition: none;
}
.action-btn:hover .el-icon {
  transform: none;
}

.recent-activities-row {
  min-height: 80px;
}
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px dashed rgba(161, 143, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  position: relative;
}
.activity-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(135deg, #7C3AED 0%, #a18fff 100%);
  border-radius: 0 2px 2px 0;
  transition: height 0.3s;
}
.activity-item:hover {
  background: linear-gradient(90deg, rgba(161, 143, 255, 0.08) 0%, rgba(161, 143, 255, 0.03) 100%);
  padding-left: 12px;
  transform: translateX(4px);
}
.activity-item:hover::before {
  height: 60%;
}
.activity-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.activity-icon {
  font-size: 1.4em;
  margin-right: 12px;
  filter: drop-shadow(0 2px 4px rgba(107, 79, 255, 0.2));
  transition: transform 0.3s;
}
.activity-item:hover .activity-icon {
  transform: scale(1.15) rotate(5deg);
}
.activity-title {
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
  transition: color 0.3s;
}
.activity-item:hover .activity-title {
  color: #7C3AED;
}
.activity-time {
  font-size: 12px;
  color: #a78bfa;
  opacity: 0.7;
}

/* 右侧图表区块 */
.sysadmin-charts-frosted {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.sysadmin-chart-card, .chart-wide, .log-sankey-full {
  background: linear-gradient(135deg, #ffffff 0%, #faf9ff 100%);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(107, 79, 255, 0.12), 0 2px 8px rgba(107, 79, 255, 0.08);
  padding: 24px 20px 20px 20px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border: 1px solid rgba(161, 143, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.sysadmin-chart-card::before, .chart-wide::before, .log-sankey-full::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 50%, #b3c6ff 100%);
  opacity: 0.6;
}
.sysadmin-chart-card:hover, .chart-wide:hover, .log-sankey-full:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(107, 79, 255, 0.18), 0 4px 12px rgba(107, 79, 255, 0.12);
  border-color: rgba(161, 143, 255, 0.3);
}
.sysadmin-chart-card h3, .chart-wide h3, .log-sankey-full h3 {
  color: #7C3AED;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sysadmin-chart-card h3::before, .chart-wide h3::before, .log-sankey-full h3::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #7C3AED 0%, #a18fff 100%);
  border-radius: 2px;
  }
.dashboard-chart, .log-sankey-chart-full, .user-role-chart-large {
  background: transparent;
  border-radius: 16px;
  box-shadow: 0 1px 4px #bdbdfc11;
  margin-bottom: 0;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  height: 320px;
}
.chart-wide {
  grid-column: 1 / span 2;
}

.header-glass.sysadmin-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,248,255,0.9) 100%);
  border-radius: 28px;
  box-shadow: 0 12px 48px rgba(161, 143, 255, 0.15), 0 4px 16px rgba(124, 58, 237, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 2px solid rgba(161, 143, 255, 0.25);
  margin: 0 auto 32px auto;
  padding: 42px 0 32px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.header-glass.sysadmin-glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 3s infinite;
}
@keyframes shimmer {
  0% { left: -50%; }
  100% { left: 150%; }
}
.header-glass.sysadmin-glass h1 {
  font-size: 38px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin-bottom: 12px;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
}
.header-glass.sysadmin-glass .user-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  font-size: 18px;
  margin-top: 8px;
}
.header-glass.sysadmin-glass .user-info span {
  color: #7C3AED;
  font-weight: 700;
  font-size: 18px;
}
.header-glass.sysadmin-glass .user-info .role {
  color: #a18fff;
  font-weight: 800;
  font-size: 18px;
  margin-left: 8px;
  letter-spacing: 1px;
}

.new-admin-grid {
  display: grid;
  grid-template-columns: 380px minmax(320px, 1fr) 420px;
  gap: 32px;
  align-items: start;

}
.admin-col {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.admin-col-right .quick-actions-row,
.admin-col-right .recent-activities-row {
  margin-bottom: 0;
}
.center-bottom-row {
  display: flex;
  gap: 24px;
  height: 360px;
}
.center-bottom-row > .quick-actions-row,
.center-bottom-row > .recent-activities-row {
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
@media (max-width: 1200px) {
  .sysadmin-main-frosted {
    grid-template-columns: 0.15fr 1fr;
    gap: 12px;
    padding: 12px 0;
  }
  .main-left.left-panel.sysadmin-left-float {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
    gap: 8px;
  }
  .sysadmin-charts-frosted {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .dashboard-chart, .log-sankey-chart-full, .user-role-chart-large {
    height: 220px;
  }
  .new-admin-grid {
    grid-template-columns: 1fr;
  }
  .admin-col {
    gap: 18px;
  }
  .center-bottom-row {
    flex-direction: column;
    gap: 18px;
    height: auto;
  }
  .center-bottom-row > .quick-actions-row,
  .center-bottom-row > .recent-activities-row {
    height: auto;
  }
}
.dashboard-card .user-role-chart-large {
  min-height: 320px;
  height: 320px;
}

/* 图表装饰 */
.chart-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(161, 143, 255, 0.1) 0%, transparent 70%);
  border-radius: 0 24px 0 0;
  pointer-events: none;
  opacity: 0.6;
}

/* 快捷操作标题栏 */
.action-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(161, 143, 255, 0.15);
}
.action-title {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}
.action-bar-decoration {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, rgba(161, 143, 255, 0.3) 0%, transparent 100%);
  margin-left: 12px;
  border-radius: 1px;
}

/* 响应式优化 */
@media (max-width: 1400px) {
  .sysadmin-main-frosted {
    grid-template-columns: 340px minmax(280px, 1fr) 380px;
    gap: 24px;
    padding: 32px 24px;
  }
}

/* 动画增强 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card,
.sysadmin-chart-card,
.quick-actions-row,
.recent-activities-row {
  animation: fadeInUp 0.6s ease-out backwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
</style>