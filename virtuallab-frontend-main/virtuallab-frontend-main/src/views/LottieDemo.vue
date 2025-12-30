<template>
  <div class="lottie-demo">
    <div class="demo-header">
      <h1>🎨 Lottie 动画演示</h1>
      <p>展示 IconScout 贴纸动画包的应用效果</p>
    </div>

    <div class="demo-grid">
      <!-- 欢迎动画 -->
      <div class="demo-card">
        <h3>欢迎动画</h3>
        <div class="animation-container">
          <LottieAnimation 
            :animation-data="welcomeAnimation"
            width="200px"
            height="200px"
            :loop="true"
            :autoplay="true"
          />
        </div>
        <p>适用于登录成功或页面欢迎场景</p>
      </div>

      <!-- 成功动画 -->
      <div class="demo-card">
        <h3>成功动画</h3>
        <div class="animation-container">
          <LottieAnimation 
            :animation-data="successAnimation"
            width="200px"
            height="200px"
            :loop="false"
            :autoplay="false"
            ref="successAnimRef"
          />
        </div>
        <el-button @click="playSuccessAnimation" type="success">
          播放成功动画
        </el-button>
        <p>适用于操作成功反馈</p>
      </div>

      <!-- 加载动画 -->
      <div class="demo-card">
        <h3>加载动画</h3>
        <div class="animation-container">
          <LottieAnimation 
            :animation-data="loadingAnimation"
            width="150px"
            height="150px"
            :loop="true"
            :autoplay="true"
            :speed="0.8"
          />
        </div>
        <p>适用于数据加载状态</p>
      </div>

      <!-- 庆祝动画 -->
      <div class="demo-card">
        <h3>庆祝动画</h3>
        <div class="animation-container">
          <LottieAnimation 
            :animation-data="celebrationAnimation"
            width="200px"
            height="200px"
            :loop="false"
            :autoplay="false"
            ref="celebrationAnimRef"
          />
        </div>
        <el-button @click="playCelebrationAnimation" type="warning">
          播放庆祝动画
        </el-button>
        <p>适用于成就解锁或特殊时刻</p>
      </div>
    </div>

    <div class="integration-examples">
      <h2>集成示例</h2>
      
      <div class="example-section">
        <h3>在个人信息页面中的应用</h3>
        <div class="example-card">
          <div class="profile-header">
            <div class="avatar-section">
              <div class="avatar">
                <img src="/images/experiments/experiment1.png" alt="用户头像" />
                <div class="avatar-decoration">
                  <LottieAnimation 
                    :animation-data="userAnimation"
                    width="60px"
                    height="60px"
                    :loop="true"
                    :autoplay="true"
                  />
                </div>
              </div>
            </div>
            <div class="profile-info">
              <h4>张三</h4>
              <p>学生 | 计算机科学与技术</p>
            </div>
          </div>
        </div>
      </div>

      <div class="example-section">
        <h3>在操作反馈中的应用</h3>
        <div class="example-card">
          <el-button @click="simulateOperation" type="primary">
            模拟操作
          </el-button>
          <div v-if="showFeedback" class="feedback-animation">
            <LottieAnimation 
              :animation-data="feedbackAnimation"
              width="100px"
              height="100px"
              :loop="false"
              :autoplay="true"
            />
            <p>操作成功！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LottieAnimation from '@/components/LottieAnimation.vue'

// 这里需要导入实际的动画JSON文件
// 您需要从IconScout下载这些动画文件并放在assets目录中
const welcomeAnimation = ref(null)
const successAnimation = ref(null)
const loadingAnimation = ref(null)
const celebrationAnimation = ref(null)
const userAnimation = ref(null)
const feedbackAnimation = ref(null)

const successAnimRef = ref()
const celebrationAnimRef = ref()
const showFeedback = ref(false)

const playSuccessAnimation = () => {
  successAnimRef.value?.goToAndPlay(0)
}

const playCelebrationAnimation = () => {
  celebrationAnimRef.value?.goToAndPlay(0)
}

const simulateOperation = () => {
  showFeedback.value = true
  setTimeout(() => {
    showFeedback.value = false
  }, 3000)
}
</script>

<style scoped>
.lottie-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  color: #6366f1;
  margin-bottom: 10px;
}

.demo-header p {
  color: #6b7280;
  font-size: 16px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.demo-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.demo-card:hover {
  transform: translateY(-2px);
}

.demo-card h3 {
  color: #374151;
  margin-bottom: 16px;
}

.animation-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.demo-card p {
  color: #6b7280;
  margin-top: 16px;
}

.integration-examples {
  margin-top: 50px;
}

.integration-examples h2 {
  color: #6366f1;
  margin-bottom: 30px;
  text-align: center;
}

.example-section {
  margin-bottom: 40px;
}

.example-section h3 {
  color: #374151;
  margin-bottom: 20px;
}

.example-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-section {
  position: relative;
}

.avatar {
  position: relative;
  width: 80px;
  height: 80px;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-decoration {
  position: absolute;
  top: -10px;
  right: -10px;
}

.profile-info h4 {
  color: #374151;
  margin-bottom: 8px;
}

.profile-info p {
  color: #6b7280;
  margin: 0;
}

.feedback-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  background: #f0f9ff;
  border-radius: 8px;
}

.feedback-animation p {
  margin-top: 10px;
  color: #059669;
  font-weight: 500;
}
</style> 