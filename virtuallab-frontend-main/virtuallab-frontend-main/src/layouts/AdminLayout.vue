<template>
  <div class="admin-layout">
    <AppNavbar />
    <div class="layout-body">
      <AppSidebar />
      <div class="main-content-wrapper">
        <!-- <Breadcrumb /> -->
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-body {
  display: flex;
  flex: 1;
}

.main-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;

}


.main-content {
  flex: 1;
  padding: 24px;
  background: #f8fafc;
}
</style> 