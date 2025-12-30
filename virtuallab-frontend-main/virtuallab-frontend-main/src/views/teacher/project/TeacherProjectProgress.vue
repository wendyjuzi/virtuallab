<template>
  <div class="progress-container">
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
    
    <div class="layout-grid">
      <div class="sidebar left-sidebar">
        <div class="sidebar-card">
          <h3>项目统计</h3>
          <div class="stat-item">
            <span class="stat-label">总学生数</span>
            <span class="stat-value">{{ progressList.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已完成</span>
            <span class="stat-value">{{ getCompletedCount() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">进行中</span>
            <span class="stat-value">{{ getInProgressCount() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">未开始</span>
            <span class="stat-value">{{ getNotStartedCount() }}</span>
          </div>
        </div>
        
        <div class="sidebar-card">
          <h3>项目信息</h3>
          <div class="project-info">
            <div class="info-item">
              <span class="info-label">项目ID</span>
              <span class="info-value">{{ projectId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">截止日期</span>
              <span class="info-value">2025-7-31</span>
            </div>
            <div class="info-item">
              <span class="info-label">平均分</span>
              <span class="info-value">{{ getAverageScore() }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-wrapper main-content">
        <h2 class="page-title">学生项目进度</h2>
        
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <span>加载数据中...</span>
        </div>

        <div v-else class="table-container">
          <table class="progress-table">
            <thead>
              <tr>
                <th>学生ID</th>
                <th>状态</th>
                <th>提交时间</th>
                <th>评分</th>
                <th>评语</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="progress in progressList" :key="progress.id" class="progress-row">
                <td data-label="学生ID">{{ progress.studentId }}</td>
                <td data-label="状态">
                  <span :class="'status-badge ' + getStatusClass(progress.status)">
                    {{ getStatusText(progress.status) }}
                  </span>
                </td>
                <td data-label="提交时间">{{ formatTime(progress.submitTime) }}</td>
                <td data-label="评分" :class="{'highlight-score': progress.score >= 90}">
                  {{ progress.score ?? '-' }}
                </td>
                <td data-label="评语" class="comment-cell">
                  <div class="comment-content">{{ progress.comment ?? '-' }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="sidebar right-sidebar">

        
        <div class="sidebar-card">
          <h3>完成情况</h3>
          <div class="progress-chart">
            <div class="chart-bar">
              <div class="bar-segment completed" :style="{width: getCompletedPercentage() + '%'}"></div>
              <div class="bar-segment in-progress" :style="{width: getInProgressPercentage() + '%'}"></div>
              <div class="bar-segment not-started" :style="{width: getNotStartedPercentage() + '%'}"></div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color completed"></span>
                <span>已完成</span>
              </div>
              <div class="legend-item">
                <span class="legend-color in-progress"></span>
                <span>进行中</span>
              </div>
              <div class="legend-item">
                <span class="legend-color not-started"></span>
                <span>未开始</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId || 1
const progressList = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axios.get(`/api/progress/project/${projectId}`)
    progressList.value = res.data
  } catch (err) {
    console.error('获取进度失败', err)
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成',
    graded: '已批改'
  }
  return map[status] || status
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    not_started: 'status-neutral',
    in_progress: 'status-info',
    completed: 'status-warning',
    graded: 'status-success'
  }
  return map[status] || 'status-neutral'
}

const formatTime = (time: string) => {
  return time ? new Date(time).toLocaleString() : '-'
}

// 新增统计方法
const getCompletedCount = () => {
  return progressList.value.filter(p => p.status === 'completed' || p.status === 'graded').length
}

const getInProgressCount = () => {
  return progressList.value.filter(p => p.status === 'in_progress').length
}

const getNotStartedCount = () => {
  return progressList.value.filter(p => p.status === 'not_started').length
}

const getAverageScore = () => {
  const scores = progressList.value.filter(p => p.score !== null && p.score !== undefined).map(p => p.score)
  if (scores.length === 0) return '-'
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return avg.toFixed(1)
}

const getCompletedPercentage = () => {
  if (progressList.value.length === 0) return 0
  return (getCompletedCount() / progressList.value.length) * 100
}

const getInProgressPercentage = () => {
  if (progressList.value.length === 0) return 0
  return (getInProgressCount() / progressList.value.length) * 100
}

const getNotStartedPercentage = () => {
  if (progressList.value.length === 0) return 0
  return (getNotStartedCount() / progressList.value.length) * 100
}
</script>

<style scoped>
.progress-container {
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
  padding: 1rem;
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

.layout-grid {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  gap: 24px;
  padding: 32px;
  position: relative;
  z-index: 1;
  min-height: 85vh;
  margin: 20px auto;
  width: 95%;
  max-width: 1600px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 8px 32px rgba(171, 71, 188, 0.1),
    0 4px 16px rgba(171, 71, 188, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: fadeIn 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.layout-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
}

.layout-grid::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(171, 71, 188, 0.2),
    transparent
  );
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.sidebar-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 
    0 4px 12px rgba(171, 71, 188, 0.08),
    0 2px 4px rgba(171, 71, 188, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex: 1;
  min-height: 220px;
  display: flex;
  flex-direction: column;
}

.sidebar-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ce93d8, #9575cd);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-card:hover {
  box-shadow: 
    0 12px 28px rgba(171, 71, 188, 0.12),
    0 4px 8px rgba(171, 71, 188, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  transform: translateY(-3px);
}

.sidebar-card:hover::before {
  opacity: 1;
}

.sidebar-card h3 {
  color: #9575cd;
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(171, 71, 188, 0.15);
}

.stat-item, .info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(171, 71, 188, 0.2);
  flex: 1;
}

.stat-item:last-child, .info-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.stat-label, .info-label {
  color: #b39ddb;
  font-size: 15px;
}

.stat-value, .info-value {
  font-weight: 600;
  color: #9575cd;
  font-size: 16px;
}

.action-button {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:last-child {
  margin-bottom: 0;
}

.action-button.primary {
  background: linear-gradient(135deg, #ab47bc, #ce93d8);
  color: white;
  box-shadow: 0 4px 10px rgba(171, 71, 188, 0.3);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #9575cd;
  border: 1px solid rgba(171, 71, 188, 0.2);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(171, 71, 188, 0.25);
}

.progress-chart {
  margin-top: 10px;
}

.chart-bar {
  height: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
}

.bar-segment {
  height: 100%;
}

.bar-segment.completed {
  background: #ce93d8;
}

.bar-segment.in-progress {
  background: #9575cd;
}

.bar-segment.not-started {
  background: #e9ecef;
}

.chart-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 5px;
  border-radius: 2px;
}

.legend-color.completed {
  background: #ce93d8;
}

.legend-color.in-progress {
  background: #9575cd;
}

.legend-color.not-started {
  background: #e9ecef;
}

.content-wrapper {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(171, 71, 188, 0.08),
    0 4px 16px rgba(171, 71, 188, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(171, 71, 188, 0.2),
    transparent
  );
}

.content-wrapper:hover {
  box-shadow: 
    0 16px 40px rgba(171, 71, 188, 0.12),
    0 8px 16px rgba(171, 71, 188, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  transform: translateY(-5px);
}

.page-title {
  color: #9575cd;
  font-weight: 600;
  margin-bottom: 32px;
  font-size: 28px;
  position: relative;
  padding-bottom: 16px;
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
  color: #9575cd;
  font-weight: 500;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(171, 71, 188, 0.2);
  border-radius: 50%;
  border-top-color: #9575cd;
  animation: spin 1s ease-in-out infinite;
  margin-right: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-container {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 
    0 4px 16px rgba(171, 71, 188, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.progress-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
  height: 100%;
}

.progress-table thead th {
  background: rgba(255, 255, 255, 0.8);
  color: #9575cd;
  font-weight: 600;
  padding: 20px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(171, 71, 188, 0.1);
  position: sticky;
  top: 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background-color 0.3s ease;
  font-size: 15px;
}

.progress-table thead th:hover {
  background: rgba(255, 255, 255, 0.9);
}

.progress-row {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-row:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(171, 71, 188, 0.08),
    0 2px 4px rgba(171, 71, 188, 0.04);
}

.progress-table tbody td {
  padding: 16px;
  border-bottom: 1px solid rgba(171, 71, 188, 0.1);
  vertical-align: middle;
  font-size: 14px;
  line-height: 1.6;
}

.progress-table tbody tr:last-child td {
  border-bottom: none;
}

.progress-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.progress-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  min-width: 80px;
  box-shadow: 
    0 2px 6px rgba(171, 71, 188, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.status-badge:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(171, 71, 188, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.status-neutral {
  background-color: #e9ecef;
  color: #495057;
}

.status-info {
  background: linear-gradient(135deg, rgba(171, 71, 188, 0.15), rgba(171, 71, 188, 0.3));
  color: #9575cd;
}

.status-warning {
  background: linear-gradient(135deg, rgba(206, 147, 216, 0.2), rgba(206, 147, 216, 0.4));
  color: #ba68c8;
}

.status-success {
  background: linear-gradient(135deg, rgba(149, 117, 205, 0.15), rgba(149, 117, 205, 0.3));
  color: #9575cd;
}

.highlight-score {
  font-weight: 600;
  color: #9575cd;
  position: relative;
}

.highlight-score::after {
  content: '✓';
  margin-left: 5px;
  color: #ce93d8;
}

.comment-cell {
  max-width: 250px;
  position: relative;
}

.comment-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.comment-cell:hover .comment-content {
  white-space: normal;
  overflow: visible;
  background-color: white;
  position: absolute;
  z-index: 10;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(171, 71, 188, 0.2);
  min-width: 220px;
}

@media (max-width: 1200px) {
  .layout-grid {
    grid-template-columns: 220px 1fr 220px;
    gap: 15px;
    padding: 15px;
    margin: 60px auto 20px;
  }
}

@media (max-width: 992px) {
  .layout-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "main"
      "left"
      "right";
    margin: 70px auto 20px;
  }
  
  .main-content {
    grid-area: main;
  }
  
  .left-sidebar {
    grid-area: left;
  }
  
  .right-sidebar {
    grid-area: right;
  }
  
  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .sidebar-card {
    flex: 1;
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .progress-container {
    padding: 10px;
  }
  
  .layout-grid {
    padding: 10px;
    gap: 15px;
    margin: 70px auto 10px;
  }

  .sidebar {
    flex-direction: column;
  }
  
  .sidebar-card {
    width: 100%;
  }
  
  .content-wrapper {
    padding: 20px 15px;
    max-height: none;
  }
  
  .back-button {
    top: 15px;
    left: 15px;
    padding: 8px 12px;
  }
  
  .progress-table thead {
    display: none;
  }
  
  .progress-table tbody tr {
    display: block;
    margin-bottom: 20px;
    border: 1px solid rgba(171, 71, 188, 0.15);
    border-radius: 12px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    box-shadow: 0 6px 15px rgba(171, 71, 188, 0.1);
  }
  
  .progress-table tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid rgba(171, 71, 188, 0.1);
  }
  
  .progress-table tbody td:last-child {
    border-bottom: none;
  }
  
  .progress-table tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #9575cd;
    margin-right: 15px;
  }
  
  .status-badge {
    margin-left: auto;
  }
  
  .comment-cell:hover .comment-content {
    position: relative;
    box-shadow: none;
    border: none;
    padding: 0;
  }

  .bg-circle {
    opacity: 0.2;
  }
}
</style>