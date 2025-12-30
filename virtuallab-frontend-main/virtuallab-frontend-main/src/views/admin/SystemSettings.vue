<template>
  <div class="system-settings-bg">
    <div class="frosted-wrapper">
      <h2>系统设置</h2>
      <el-form label-width="100px" style="max-width: 400px;" class="frosted-form">
        <el-form-item label="系统名称">
          <el-input v-model="settings.name" />
        </el-form-item>
        <el-form-item label="管理员邮箱">
          <el-input v-model="settings.email" />
        </el-form-item>
        <el-form-item label="允许注册">
          <el-switch v-model="settings.allowRegister" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const settings = ref({
  name: '虚拟实验室',
  email: 'admin@lab.com',
  allowRegister: true
})
const saveSettings = () => {
  ElMessage.success('设置已保存')
}
</script>
<style scoped>
.system-settings-bg {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
.frosted-wrapper {
  background: rgba(236, 236, 255, 0.96);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 32px;
  max-width: 900px;
  width: 99vw;
  margin: 88px auto 0 auto;
  padding: 72px 64px 64px 64px;
  backdrop-filter: blur(12px);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
h2 {
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
  text-align: center;
}
.frosted-form {
  background: rgba(236, 236, 255, 0.92);
  border-radius: 18px;
  box-shadow: 0 4px 16px #a18fff22, 0 2px 8px #7c3aed11;
  max-width: 900px;
  width: 100%;
  padding: 56px 48px 24px 48px;
  margin-bottom: 12px;
  backdrop-filter: blur(8px);
}
.el-input {
  border-radius: 12px;
  background: #f8f8ff;
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
@media (max-width: 600px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  h2 {
    font-size: 20px;
  }
}
</style> 