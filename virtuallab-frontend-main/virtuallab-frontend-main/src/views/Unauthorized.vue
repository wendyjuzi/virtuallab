<template>
  <div class="unauthorized">
    <div class="unauth-card">
      <div class="unauth-icon">🚫</div>
      <div class="unauth-title">未授权访问</div>
      <div class="unauth-desc">您没有权限访问此页面，请联系管理员或切换账号。</div>
      <div class="unauth-actions">
        <el-button type="primary" size="large" @click="$router.push('/')">返回首页</el-button>
        <el-button size="large" @click="$router.push('/login')">重新登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.unauthorized {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 60%, #ffeaea 100%);
}
.unauth-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(231,76,60,0.10);
  padding: 48px 40px 36px 40px;
  text-align: center;
  animation: fadeInDown 0.8s;
}
.unauth-icon {
  font-size: 64px;
  margin-bottom: 18px;
  color: #e74c3c;
  animation: shake 1.2s infinite alternate;
}
.unauth-title {
  font-size: 32px;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 12px;
}
.unauth-desc {
  font-size: 18px;
  color: #888;
  margin-bottom: 32px;
}
.unauth-actions {
  display: flex;
  gap: 24px;
  justify-content: center;
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shake {
  0% { transform: rotate(-6deg); }
  100% { transform: rotate(6deg); }
}
</style> 