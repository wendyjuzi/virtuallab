<template>
  <nav class="app-navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <div class="logo">
          <el-icon class="logo-icon"><Monitor /></el-icon>
          <span class="logo-text">虚拟实验室管理系统</span>
          <el-button type="text" class="home-link" @click="goRoleHome">主页</el-button>
        </div>
      </div>
      
      <div class="navbar-right">
        <!-- 引入通知徽章组件 -->
        <NotificationBadge />
        <div class="user-menu">
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleCommand" trigger="click">
              <div class="user-info">
                <el-avatar :size="32" class="user-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ userStore.userName || '用户' }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人信息
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" @click="$router.push('/login')" class="login-btn">
              登录系统
            </el-button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, User, ArrowDown, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import NotificationBadge from '@/components/NotificationBadge.vue' // 引入独立组件
import ResourceShare from '@/components/ResourceShare.vue'
import { ref } from 'vue'
const showShareDialog = ref(false)
// 这里举例用全局resourceId，实际可根据业务传递
const globalResourceId = 1

const router = useRouter()
const userStore = useUserStore()

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        await userStore.doLogout()
        router.push('/login')
        ElMessage.success('已退出登录')
      } catch {
        // 用户取消退出
      }
      break
  }
}

const goRoleHome = () => {
  if (!userStore.token) {
    router.push('/login')
    return
  }
  const role = userStore.userRole
  if (role === 'STUDENT') {
    router.push('/student')
  } else if (role === 'TEACHER') {
    router.push('/teacher')
  } else if (role === 'DEPARTMENT_ADMIN') {
    router.push('/department')
  } else if (role === 'SYSTEM_ADMIN') {
    router.push('/admin')
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.app-navbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
  position: relative;
}
.home-link {
  margin-left: 16px;
  color: #6366f1;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
}
.home-link:hover {
  color: #7c3aed;
  text-decoration: underline;
}

.logo-icon {
  font-size: 24px;
  color: #6366f1;
}

.logo-text {
  font-size: 18px;
}

/* 为通知组件添加特定定位 */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px; /* 添加组件间距 */
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f3f4f6;
}

.user-avatar {
  background: #6366f1;
}

.username {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #6b7280;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 0;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
  }
  
  .logo-text {
    display: none;
  }
  
  .username {
    display: none;
  }
}
</style> 