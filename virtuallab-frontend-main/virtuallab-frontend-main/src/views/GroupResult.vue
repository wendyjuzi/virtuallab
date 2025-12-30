<template>
  <div class="group-result">
    <h2 class="title">🎲 随机分组结果</h2>
    <el-card v-for="team in teams" :key="team.id" class="team-card">
      <div class="team-name">
        <strong>{{ team.name }}</strong>
      </div>
      <ul class="member-list">
        <li v-for="member in team.members" :key="member.studentId" class="member-item">
          学号：<span class="student-id">{{ member.studentId }}</span>
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const projectId = route.query.projectId as string;
const teams = ref<any[]>([]);

onMounted(async () => {
  console.log('组件挂载了');
  const projectId = route.query.projectId;
  console.log('projectId:', projectId);

  if (!projectId) {
    console.warn('projectId 为空，终止请求');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/projectTeam/project/${projectId}/with-members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('接口返回数据:', res.data);
    teams.value = res.data;
  } catch (error) {
    console.error('请求失败:', error);
  }
});
</script>

<style scoped>
.group-result {
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(128, 0, 128, 0.1); /* 紫色阴影 */
  max-width: 800px;
  margin: 0 auto;
}

.title {
  text-align: center;
  color: #6a0dad; /* 紫色标题 */
  font-size: 28px;
  margin-bottom: 24px;
  font-weight: 600;
}

.team-card {
  border: 1px solid #d9c2f0; /* 浅紫色边框 */
  border-radius: 10px;
  transition: 0.3s ease;
}
.team-card:hover {
  box-shadow: 0 4px 12px rgba(106, 13, 173, 0.2); /* 鼠标悬停时加深阴影 */
}

.team-name {
  font-size: 20px;
  margin-bottom: 8px;
  color: #6a0dad;
}

.member-list {
  list-style: none;
  padding-left: 0;
}

.member-item {
  padding: 6px 0;
  border-bottom: 1px dashed #eaeaea;
  color: #333;
}
.member-item:last-child {
  border-bottom: none;
}

.student-id {
  color: #6a0dad;
  font-weight: bold;
}
</style>