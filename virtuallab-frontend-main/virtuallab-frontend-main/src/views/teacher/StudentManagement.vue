<!-- StudentManagement.vue -->
<template>
  <div class="student-management">
    <div class="content-container">
      <div class="glass-card">
        <div class="header-row">
          <button class="back-btn" @click="goBack">返回</button>
          <h2>学生管理</h2>
        </div>
        <div class="class-list">
          <div v-for="clazz in classes" :key="clazz.classId" class="class-block">
            <div class="class-header">
              <h3>班级：{{ clazz.className }}</h3>
              <div class="decoration-line"></div>
            </div>
            <ul class="student-list">
              <li v-for="student in clazz.students" :key="student.id" class="student-item">
                <span class="student-id">学生ID：{{ student.id }}</span>
                <div class="hover-effect"></div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const classes = ref([])

const goBack = () => {
  router.go(-1)
}

const fetchClassStudentList = async () => {
  try {
    const res = await axios.get('/api/experiment/project/class-student-list')
    classes.value = res.data  // 不再是 res.data.data
  } catch (error) {
    console.error('获取班级学生列表失败', error)
  }
}

onMounted(() => {
  fetchClassStudentList()
})
</script>

<style scoped>
.student-management {
  min-height: 100vh;
  padding: 40px 0 60px 0;
  background: linear-gradient(135deg, #f0ebff 0%, #e7e2ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 背景动态效果 */
.student-management::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(2px 100px at 60% 60%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
    radial-gradient(2px 100px at 30% 40%, rgba(147, 51, 234, 0.15) 0%, transparent 50%);
  filter: blur(1px);
  pointer-events: none;
  animation: backgroundShift 15s ease-in-out infinite alternate;
}

@keyframes backgroundShift {
  0% {
    transform: scale(1) rotate(0deg);
  }
  100% {
    transform: scale(1.1) rotate(2deg);
  }
}

.content-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

/* 大玻璃卡片容器 */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 8px 32px rgba(124, 58, 237, 0.1),
    0 2px 8px rgba(124, 58, 237, 0.05);
  padding: 32px;
  position: relative;
  overflow: hidden;
}

/* 玻璃卡片光效 */
.glass-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0) 60%
  );
  opacity: 0.5;
  animation: rotateGradient 15s linear infinite;
}

@keyframes rotateGradient {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.header-row {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.back-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #7c3aed;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.back-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.2);
}

h2 {
  margin: 0 0 0 32px;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6d28d9, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  position: relative;
}

.class-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  position: relative;
  z-index: 1;
}

.class-block {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.08);
  padding: 24px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(124, 58, 237, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.class-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.15);
  border-color: rgba(124, 58, 237, 0.2);
}

.class-header {
  position: relative;
  margin-bottom: 20px;
}

.class-block h3 {
  color: #6d28d9;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.decoration-line {
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(124, 58, 237, 0.2),
    rgba(124, 58, 237, 0.1) 50%,
    transparent
  );
  margin-top: 8px;
}

.student-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.student-item {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 0.95rem;
  color: #4b5563;
  border: 1px solid rgba(124, 58, 237, 0.08);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.student-item:hover {
  transform: translateX(5px);
  border-color: rgba(124, 58, 237, 0.2);
  background: rgba(255, 255, 255, 0.9);
}

.student-item:hover .hover-effect {
  transform: translateX(0);
  opacity: 1;
}

.hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(124, 58, 237, 0.1) 50%,
    transparent
  );
  transform: translateX(-100%);
  opacity: 0;
  transition: all 0.6s ease;
}

.student-id {
  color: #7c3aed;
  font-weight: 500;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

@media (max-width: 900px) {
  .content-container {
    padding: 0 16px;
  }
  
  .glass-card {
    padding: 24px;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-left: 20px;
  }
  
  .class-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .glass-card {
    padding: 16px;
  }
  
  .class-block {
    padding: 20px;
  }
  
  h2 {
    font-size: 1.3rem;
    margin-left: 16px;
  }
  
  .back-btn {
    padding: 8px 20px;
    font-size: 0.9rem;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
