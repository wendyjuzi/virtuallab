<template>
  <aside class="app-sidebar">
    <slot>
      <nav class="sidebar-nav">
        <div v-for="menu in userMenus" :key="menu.key" class="nav-section">
          <h3 class="nav-title">{{ getSectionTitle(menu.key) }}</h3>
          <ul class="nav-list">
            <!-- 主菜单项 -->
            <li class="nav-item">
              <router-link :to="menu.path" class="nav-link">
                <el-icon><component :is="menu.icon" /></el-icon>
                <span>{{ menu.title }}</span>
              </router-link>
            </li>
            
            <!-- 子菜单项 -->
            <li v-for="child in menu.children" :key="child.key" class="nav-item nav-item-child">
              <router-link :to="child.path" class="nav-link nav-link-child">
                <el-icon><component :is="child.icon" /></el-icon>
                <span>{{ child.title }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
    </slot>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { getMenuByRole } from '@/config/menu'

const userStore = useUserStore()

// 根据用户角色获取菜单
const userMenus = computed(() => {
  return getMenuByRole(userStore.userRole)
})

// 获取分组标题
const getSectionTitle = (menuKey: string) => {
  const sectionTitles: Record<string, string> = {
    'dashboard': '主要功能',
    'experiments': '主要功能',
    'profile': '主要功能',
    'admin': '系统管理',
    'department': '院系管理',
    'teacher': '教师管理',
    'student': '学生管理'
  }
  return sectionTitles[menuKey] || '其他功能'
}
</script>

<style scoped>
.app-sidebar {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 180px !important;
  flex-shrink: 0 !important;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  min-height: calc(100vh - 56px);
  padding: 24px 0;
  overflow-y: auto;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  left: 0 !important;
  transform: none !important;
  margin-left: 0 !important;
}

.sidebar-nav {
  padding: 0 16px;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px 0;
  padding: 0 12px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-item-child {
  margin-left: 16px;
  margin-bottom: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #374151;
  text-decoration: none;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link-child {
  padding: 8px 12px;
  font-size: 13px;
  color: #6b7280;
}

.nav-link:hover {
  background-color: #f3f4f6;
  color: #6366f1;
}

.nav-link-child:hover {
  background-color: #f9fafb;
  color: #6366f1;
}

.nav-link.router-link-active {
  background-color: #6366f1;
  color: #fff;
}

.nav-link-child.router-link-active {
  background-color: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  font-weight: 500;
}

.nav-link span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-link .el-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-link-child span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-link-child .el-icon {
  font-size: 14px;
  width: 18px;
  text-align: center;
}

@media (max-width: 768px) {
  .app-sidebar {
    width: 180px !important;
    position: relative !important;
    top: auto !important;
    left: 0 !important;
    height: auto !important;
    min-height: calc(100vh - 56px);
    z-index: auto !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    margin-left: 0 !important;
  }
  
  .nav-link span,
  .nav-link-child span {
    display: none;
  }
  
  .nav-link,
  .nav-link-child {
    justify-content: center;
    padding: 16px 12px;
  }
  
  .nav-title {
    display: none;
  }
  
  .nav-item-child {
    margin-left: 0;
  }
}
</style> 