<template>
  <div class="statistics-container">
    <div class="background-design">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>
    
    <div class="header-strip"></div>
    
    <div class="back-button" @click="goBack">
      <span class="back-icon">←</span>
      <span class="back-text">返回</span>
    </div>
    
    <div class="content-layout">
      <h2 class="page-title">评分统计分析（项目ID: {{ projectId }}）</h2>
      
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <span>加载数据中...</span>
      </div>
      
      <div v-else class="statistics-grid">
        <div class="chart-card main-chart">
          <h3>分数分布图</h3>
          <div ref="barChartRef" class="chart-container"></div>
        </div>
        
        <div class="chart-card">
          <h3>成绩等级分布</h3>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
        
        <div class="chart-card">
          <h3>分数段分布</h3>
          <div ref="histogramChartRef" class="chart-container"></div>
        </div>
        
        <div class="stats-card">
          <h3>统计指标</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ averageScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ medianScore }}</div>
              <div class="stat-label">中位数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ highestScore }}</div>
              <div class="stat-label">最高分</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ lowestScore }}</div>
              <div class="stat-label">最低分</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ passRate }}%</div>
              <div class="stat-label">及格率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ excellentRate }}%</div>
              <div class="stat-label">优秀率</div>
            </div>
          </div>
        </div>
        
        <div class="table-card">
          <h3>成绩详情</h3>
          <div class="table-container">
            <table class="grades-table">
              <thead>
                <tr>
                  <th>报告编号</th>
                  <th>分数</th>
                  <th>等级</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(score, index) in (scores || [])" :key="index">
                  <td>报告 {{ index + 1 }}</td>
                  <td>{{ score }}</td>
                  <td>{{ getGradeLevel(score) }}</td>
                  <td>
                    <span :class="'status-badge ' + getStatusClass(score)">
                      {{ getStatusText(score) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import * as echarts from 'echarts'
import { nextTick } from 'vue'

const route = useRoute()
const router = useRouter()
const projectId = route.query.projectId
const loading = ref(true)
const barChartRef = ref(null)
const pieChartRef = ref(null)
const histogramChartRef = ref(null)
const scores = ref([])
const averageScore = ref(0)
const medianScore = ref(0)
const highestScore = ref(0)
const lowestScore = ref(0)
const passRate = ref(0)
const excellentRate = ref(0)

const goBack = () => {
  router.back()
}

const getGradeLevel = (score: number) => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

const getStatusText = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '不及格'
}

const getStatusClass = (score: number) => {
  if (score >= 90) return 'status-excellent'
  if (score >= 80) return 'status-good'
  if (score >= 70) return 'status-average'
  if (score >= 60) return 'status-pass'
  return 'status-fail'
}

const calculateStatistics = (scores: number[] = []) => {
  if (!Array.isArray(scores) || scores.length === 0) return
  
  // 计算平均分
  averageScore.value = parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
  
  // 计算中位数
  const sortedScores = [...scores].sort((a, b) => a - b)
  const mid = Math.floor(sortedScores.length / 2)
  medianScore.value = sortedScores.length % 2 === 0
    ? parseFloat(((sortedScores[mid - 1] + sortedScores[mid]) / 2).toFixed(1))
    : sortedScores[mid]
  
  // 最高分和最低分
  highestScore.value = Math.max(...scores)
  lowestScore.value = Math.min(...scores)
  
  // 及格率和优秀率
  const passCount = scores.filter(score => score >= 60).length
  const excellentCount = scores.filter(score => score >= 90).length
  passRate.value = parseFloat(((passCount / scores.length) * 100).toFixed(1))
  excellentRate.value = parseFloat(((excellentCount / scores.length) * 100).toFixed(1))
}

const initBarChart = (chartRef: any, scores: number[]) => {
  const chart = echarts.init(chartRef)
  
  // 定义纯色
  const colorMap = {
    excellent: '#4caf50', // 优秀 - 绿色
    good: '#2196f3',     // 良好 - 蓝色
    average: '#03a9f4',  // 中等 - 浅蓝
    pass: '#ffc107',     // 及格 - 黄色
    fail: '#f44336'      // 不及格 - 红色
  }
  
  const option = {
    title: { 
      text: '实验报告分数分布图',
      textStyle: {
        color: '#9575cd',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}分'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: { 
      type: 'category', 
      data: scores.map((_, i) => `报告${i + 1}`),
      axisLabel: {
        color: '#5a6c7d',
        fontWeight: 500
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: { 
      type: 'value',
      axisLabel: {
        color: '#5a6c7d',
        formatter: '{value}分'
      },
      max: 100,
      splitLine: {
        lineStyle: {
          color: 'rgba(149, 117, 205, 0.1)'
        }
      }
    },
    series: [
      {
        data: scores.map(score => ({
          value: score,
          itemStyle: {
            color: score >= 90 ? colorMap.excellent : 
                  score >= 80 ? colorMap.good : 
                  score >= 70 ? colorMap.average : 
                  score >= 60 ? colorMap.pass : colorMap.fail,
            borderRadius: [5, 5, 0, 0]
          }
        })),
        type: 'bar',
        name: '得分',
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontWeight: 'bold',
          color: function(params) {
            const score = params.value;
            return score >= 90 ? colorMap.excellent : 
                  score >= 80 ? colorMap.good : 
                  score >= 70 ? colorMap.average : 
                  score >= 60 ? colorMap.pass : colorMap.fail;
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'elasticOut'
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initPieChart = (chartRef: any, scores: number[]) => {
  const chart = echarts.init(chartRef)
  
  // 计算各等级人数
  const excellent = scores.filter(score => score >= 90).length
  const good = scores.filter(score => score >= 80 && score < 90).length
  const average = scores.filter(score => score >= 70 && score < 80).length
  const pass = scores.filter(score => score >= 60 && score < 70).length
  const fail = scores.filter(score => score < 60).length
  
  // 定义纯色
  const colorList = [
    '#4caf50', // 优秀 - 绿色
    '#2196f3', // 良好 - 蓝色
    '#03a9f4', // 中等 - 浅蓝
    '#ffc107', // 及格 - 黄色
    '#f44336'  // 不及格 - 红色
  ]
  
  const option = {
    title: {
      text: '成绩等级分布',
      left: 'center',
      top: 0,
      textStyle: {
        color: '#9575cd',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#5a6c7d'
      },
      formatter: function(name) {
        const data = option.series[0].data;
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const targetIndex = data.findIndex(item => item.name === name);
        const percent = ((data[targetIndex].value / total) * 100).toFixed(1);
        return `${name} (${percent}%)`;
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
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
            fontSize: 20,
            fontWeight: 'bold',
            formatter: '{b}\n{c}人'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: excellent, name: '优秀 (90-100)', itemStyle: { color: colorList[0] } },
          { value: good, name: '良好 (80-89)', itemStyle: { color: colorList[1] } },
          { value: average, name: '中等 (70-79)', itemStyle: { color: colorList[2] } },
          { value: pass, name: '及格 (60-69)', itemStyle: { color: colorList[3] } },
          { value: fail, name: '不及格 (<60)', itemStyle: { color: colorList[4] } }
        ],
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return Math.random() * 200;
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initHistogramChart = (chartRef: any, scores: number[]) => {
  const chart = echarts.init(chartRef)
  
  // 创建分数段
  const scoreRanges = [
    '0-9', '10-19', '20-29', '30-39', '40-49',
    '50-59', '60-69', '70-79', '80-89', '90-100'
  ]
  
  // 计算每个分数段的人数
  const distribution = Array(10).fill(0)
  scores.forEach(score => {
    const index = Math.min(Math.floor(score / 10), 9)
    distribution[index]++
  })
  
  // 定义纯色
  const colorMap = {
    excellent: '#4caf50', // 优秀 - 绿色
    good: '#2196f3',     // 良好 - 蓝色
    average: '#03a9f4',  // 中等 - 浅蓝
    pass: '#ffc107',     // 及格 - 黄色
    fail: '#f44336'      // 不及格 - 红色
  }
  
  const option = {
    title: {
      text: '分数段分布',
      left: 'center',
      textStyle: {
        color: '#9575cd',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}分: {c}人'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: scoreRanges,
      axisLabel: {
        color: '#5a6c7d',
        interval: 0,
        rotate: 45,
        fontWeight: 500
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        color: '#5a6c7d',
        fontWeight: 500
      },
      axisLabel: {
        color: '#5a6c7d'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(149, 117, 205, 0.1)'
        }
      }
    },
    series: [
      {
        data: distribution.map((value, index) => ({
          value,
          itemStyle: {
            color: index >= 9 ? colorMap.excellent : 
                  index >= 8 ? colorMap.good : 
                  index >= 7 ? colorMap.average : 
                  index >= 6 ? colorMap.pass : colorMap.fail,
            borderRadius: [5, 5, 0, 0]
          }
        })),
        type: 'bar',
        name: '人数',
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontWeight: 'bold',
          color: function(params) {
            const index = params.dataIndex;
            return index >= 9 ? colorMap.excellent : 
                  index >= 8 ? colorMap.good : 
                  index >= 7 ? colorMap.average : 
                  index >= 6 ? colorMap.pass : colorMap.fail;
          }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    ],
    animationDelay: function (idx) {
      return idx * 100 + 100;
    }
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}


onMounted(async () => {
  try {
    const res = await axios.get('/api/experiment/project/statistics', {
      params: { projectId }
    })

    // 1. 接口赋值防御
    scores.value = (res.data && res.data.data && Array.isArray(res.data.data.scores)) ? res.data.data.scores : []
    calculateStatistics(scores.value)

    // 先让 loading = false，这样页面才能渲染出图表容器
    loading.value = false

    // 等待 DOM 真正渲染完成
    await nextTick()

    // 这时候 DOM 一定挂载好了
    if (barChartRef.value && pieChartRef.value && histogramChartRef.value) {
      initBarChart(barChartRef.value, scores.value)
      initPieChart(pieChartRef.value, scores.value)
      initHistogramChart(histogramChartRef.value, scores.value)
    } else {
      console.warn("部分 DOM 元素未挂载：", {
        bar: barChartRef.value,
        pie: pieChartRef.value,
        hist: histogramChartRef.value
      })
    }

  } catch (err) {
    console.error('获取评分统计失败', err)
  }
})


</script>

<style scoped>
.statistics-container {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  width: 100%;
  min-height: 100vh;
  color: #2c3e50;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #f3eaf8 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.background-design {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #ab47bc 0%, #e1bee7 100%);
  top: -100px;
  right: -50px;
  filter: blur(30px);
}

.circle-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #e1bee7 0%, #d1c4e9 100%);
  bottom: -200px;
  left: -200px;
  filter: blur(60px);
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #d1c4e9 0%, #ab47bc 100%);
  top: 40%;
  right: 10%;
  filter: blur(40px);
}

.header-strip {
  display: none;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  padding: 10px 16px;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(171, 71, 188, 0.15);
  transition: all 0.3s ease;
  z-index: 10;
  border: 1px solid rgba(171, 71, 188, 0.2);
}

.back-button:hover {
  transform: translateX(-3px);
  box-shadow: 0 6px 16px rgba(171, 71, 188, 0.25);
}

.back-icon {
  font-size: 18px;
  margin-right: 6px;
  color: #ba68c8;
}

.back-text {
  font-weight: 500;
  color: #ba68c8;
}

.content-layout {
  width: 95%;
  max-width: 1600px;
  margin: 60px auto 30px;
  position: relative;
  z-index: 1;
  padding: 20px;
}

.page-title {
  color: #9575cd;
  font-weight: 600;
  margin-bottom: 25px;
  font-size: 24px;
  position: relative;
  padding-bottom: 12px;
  text-shadow: 0 2px 4px rgba(171, 71, 188, 0.1);
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #ab47bc, #d1c4e9);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(171, 71, 188, 0.2);
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: #7b1fa2;
  font-weight: 500;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(156, 39, 176, 0.2);
  border-radius: 50%;
  border-top-color: #7b1fa2;
  animation: spin 1s ease-in-out infinite;
  margin-right: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  gap: 20px;
  grid-template-areas:
    "pie-chart histogram-chart"
    "stats-card table-card"
    "main-chart main-chart";
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(171, 71, 188, 0.15);
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.main-chart {
  background: rgba(255, 255, 255, 0.98);
  grid-area: main-chart;
}

.chart-card:nth-child(2) {
  background: rgba(250, 250, 250, 0.95);
  grid-area: pie-chart;
}

.chart-card:nth-child(3) {
  background: rgba(245, 245, 245, 0.95);
  grid-area: histogram-chart;
}

.stats-card {
  grid-area: stats-card;
  background: rgba(248, 248, 248, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(171, 71, 188, 0.15);
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.table-card {
  grid-area: table-card;
  background: rgba(252, 252, 252, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(171, 71, 188, 0.15);
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  max-height: 400px;
  overflow: hidden;
}

.chart-card:hover {
  box-shadow: 0 12px 40px rgba(171, 71, 188, 0.25);
  transform: translateY(-5px);
}

.chart-card h3, .stats-card h3, .table-card h3 {
  color: #9575cd;
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(171, 71, 188, 0.15);
}

.chart-container {
  width: 100%;
  height: 300px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  border: 1px solid rgba(171, 71, 188, 0.1);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(171, 71, 188, 0.15);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #9575cd;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #b39ddb;
}

.table-container {
  overflow-y: auto;
  max-height: 330px;
}

.grades-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.grades-table thead th {
  background: rgba(250, 250, 250, 0.95);
  color: #9575cd;
  font-weight: 600;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid rgba(171, 71, 188, 0.15);
  position: sticky;
  top: 0;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.grades-table tbody tr {
  transition: all 0.3s ease;
}

.grades-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.98);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(171, 71, 188, 0.15);
}

.grades-table tbody td {
  padding: 12px;
  border-bottom: 1px solid rgba(171, 71, 188, 0.1);
  vertical-align: middle;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 70px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.status-excellent {
  background: linear-gradient(135deg, rgba(78, 204, 163, 0.15), rgba(78, 204, 163, 0.3));
  color: #1e8a7a;
}

.status-good {
  background: linear-gradient(135deg, rgba(33, 147, 176, 0.15), rgba(33, 147, 176, 0.3));
  color: #2193b0;
}

.status-average {
  background: linear-gradient(135deg, rgba(109, 213, 237, 0.15), rgba(109, 213, 237, 0.3));
  color: #1a7489;
}

.status-pass {
  background: linear-gradient(135deg, rgba(90, 108, 125, 0.15), rgba(90, 108, 125, 0.3));
  color: #5a6c7d;
}

.status-fail {
  background: linear-gradient(135deg, rgba(229, 115, 115, 0.15), rgba(229, 115, 115, 0.3));
  color: #e57373;
}

@media (max-width: 1200px) {
  .statistics-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "pie-chart"
      "histogram-chart"
      "stats-card"
      "table-card"
      "main-chart";
  }
  
  .chart-container {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .content-layout {
    padding: 15px;
    margin-top: 70px;
  }
  
  .back-button {
    top: 15px;
    left: 15px;
    padding: 8px 12px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
