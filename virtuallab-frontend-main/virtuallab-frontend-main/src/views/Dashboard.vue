<template>
  <div class="dashboard">
    <el-container>
      <el-header class="dashboard-header">
        <div class="logo">
          <el-icon size="24" color="#6366f1"><Monitor /></el-icon>
          <span class="logo-text">VirtualLab 仪表盘</span>
        </div>
        <el-button type="primary" @click="goToExperiments" style="margin-right: 16px">
          实验一览
        </el-button>

        <div class="user-info">
          <el-avatar :size="32">
            {{ userStore.userName?.charAt(0) }}
          </el-avatar>
          <span class="username">{{ userStore.userName }}</span>
        </div>
      </el-header>
      <el-main class="dashboard-main">
        <div class="welcome-section">
          <h1>欢迎回来，{{ userStore.userName }}！</h1>
          <p>当前角色：{{ getRoleName(userStore.userRole) }}</p>
        </div>
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-title">实验室总数</div>
              <div class="stat-value">12</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-title">进行中实验</div>
              <div class="stat-value">8</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-title">今日访问</div>
              <div class="stat-value">156</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-title">数据报告</div>
              <div class="stat-value">24</div>
            </el-card>
          </el-col>
        </el-row>
        <div class="modules-section">
          <h2>功能模块</h2>
          <el-row :gutter="20">
            <el-col :span="8" v-for="module in availableModules" :key="module.key">
                <el-card
                  class="module-card"
                  shadow="hover"
                  @click="goToModule(module.key)"
                  style="cursor: pointer;"
                >
                <div class="module-title">
                  <el-icon :size="24" :color="module.color">
                    <component :is="module.icon" />
                  </el-icon>
                  <span>{{ module.title }}</span>
                </div>
                <div class="module-desc">{{ module.description }}</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Monitor, User, OfficeBuilding, Collection, DataAnalysis, Document, Setting as SettingIcon } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router';
const router = useRouter();
const userStore = useUserStore()

const allModules = [
  { key: 'lab', title: '实验室管理', description: '管理实验室资源、设备、预约等', icon: OfficeBuilding, color: '#6366f1', permissions: ['lab:manage', 'lab:view'] },
  { key: 'experiment', title: '实验管理', description: '创建、编辑、管理实验项目', icon: Collection, color: '#10b981', permissions: ['experiment:manage', 'experiment:create', 'experiment:view'] },
  { key: 'user', title: '用户管理', description: '管理系统用户和权限', icon: User, color: '#f59e0b', permissions: ['user:manage', 'user:view'] },
  { key: 'data', title: '数据分析', description: '查看实验数据和统计报告', icon: DataAnalysis, color: '#ef4444', permissions: ['data:view'] },
  { key: 'report', title: '报告管理', description: '生成和管理实验报告', icon: Document, color: '#8b5cf6', permissions: ['report:manage', 'report:create', 'report:view'] },
  { key: 'system', title: '系统设置', description: '系统配置和参数设置', icon: SettingIcon, color: '#6b7280', permissions: ['system:config'] }
]

const availableModules = computed(() => {
  return allModules.filter(module => {
    return module.permissions.some(permission => userStore.hasPermission(permission))
  })
})

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

const goToModule = (key: string) => {
  if (key === 'experiment') {
    router.push('/experiment/create');
  }
}
const goToExperiments = () => {
  router.push('/experiments'); // ✅ 跳转路径
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8fafc;
}
.dashboard-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.username {
  font-size: 14px;
  color: #374151;
}
.dashboard-main {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.welcome-section {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 32px;
}
.stats-row {
  margin-bottom: 32px;
}
.stat-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}
.modules-section {
  margin-top: 32px;
}
.module-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}
.module-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}
.module-desc {
  font-size: 14px;
  color: #6b7280;
}
</style> 