<template>
  <div class="main-layout">
    <AppNavbar />
    
      <div class="main-content-wrapper">
       
    <!-- 直接显示首页内容，无论是否登录 -->
        <!-- <Breadcrumb /> -->
        <main class="main-content">
          <router-view />
        </main>
      </div>
  
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: #f8fafc;
}
.main-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  font-size: 20px;
  font-weight: bold;
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(60,60,120,0.04);
  z-index: 10;
}
.logo {
  letter-spacing: 2px;
}
.main-nav {
  display: flex;
  gap: 24px;
}
.main-content {
  max-width: 1800px;
  margin: 0 auto;
  padding: 32px 16px 48px 16px;
}
</style> 