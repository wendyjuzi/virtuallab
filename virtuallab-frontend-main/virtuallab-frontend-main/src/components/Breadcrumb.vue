<template>
  <div class="breadcrumb-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item 
        v-for="(item, index) in breadcrumbItems" 
        :key="item.key"
        :to="index < breadcrumbItems.length - 1 ? item.path : undefined"
      >
        <el-icon v-if="item.icon" class="breadcrumb-icon">
          <component :is="item.icon" />
        </el-icon>
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getBreadcrumb } from '@/config/menu'

const route = useRoute()
const userStore = useUserStore()

const breadcrumbItems = computed(() => {
  return getBreadcrumb(route.path, userStore.userRole)
})
</script>

<style scoped>
.breadcrumb-container {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb-icon {
  margin-right: 4px;
  font-size: 14px;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-weight: 500;
}

:deep(.el-breadcrumb__inner:hover) {
  color: #6366f1;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #1f2937;
  font-weight: 600;
}
</style> 