<template>
  <div class="experiments-page">
    <h2>实验一览</h2>
    <div class="search-bar">
      <el-input v-model="keyword" placeholder="请输入关键词" clearable class="search-input" />
      <el-select v-model="selectedCategory" placeholder="选择类型" clearable class="filter-select">
        <el-option label="全部类型" value=""></el-option>
        <el-option label="化学" value="化学"></el-option>
        <el-option label="物理" value="物理"></el-option>
        <el-option label="计算机" value="计算机"></el-option>
        <!-- 你可以根据实际后端类型，添加更多选项 -->
      </el-select>
      <el-select v-model="selectedLevel" placeholder="选择难度" clearable class="filter-select">
        <el-option label="全部难度" value=""></el-option>
        <el-option label="初级" value="初级"></el-option>
        <el-option label="中级" value="中级"></el-option>
        <el-option label="高级" value="高级"></el-option>
        <!-- 同样根据实际情况修改 -->
      </el-select>
      <el-button type="primary" @click="search" class="search-btn">搜索</el-button>
    </div>

    <div class="grid">
      <div
        v-for="item in projects"
        :key="item.id"
        class="card"
        @click="goToDetail(item.id)"
        role="button"
        tabindex="0"
        @keydown.enter="goToDetail(item.id)"
      >
        <div class="image-wrapper">
<img :src="getFullUrl(item.imageUrl)" alt="cover" />
        </div>
        <p class="project-name">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

interface ExperimentProject {
  id: number;
  name: string;
  imageUrl: string;
  category?: string;
  level?: string;
}

const projects = ref<ExperimentProject[]>([]);
const keyword = ref('');
const selectedCategory = ref('');
const selectedLevel = ref('');

const loadAll = async () => {
  const res = await axios.get('/api/experiment/project/list');
  projects.value = res.data;
};

const search = async () => {
  const res = await axios.get('/api/experiment/project/search', {
    params: {
      keyword: keyword.value,
      category: selectedCategory.value,
      level: selectedLevel.value,
    },
  });
  projects.value = res.data;
};
const getFullUrl = (url: string | null | undefined): string => {
  if (!url) return ''; // 防止 null 报错
  return url.startsWith('http') ? url : `http://localhost:8080${url}`;
};


const goToDetail = (id: number) => {
  router.push(`/experiment/${id}`);
};

onMounted(() => {
  loadAll();
});
</script>



<style scoped>
.experiments-page {
  padding: 40px 60px;
  background: #f9f9fb;
  min-height: 100vh;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

h2 {
  font-weight: 700;
  font-size: 2.4rem;
  margin-bottom: 30px;
  color: #4b0082; /* 深紫 */
  text-align: center;
  letter-spacing: 1.2px;
}

.search-bar {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
}

.search-input {
  width: 320px;
  border-radius: 30px;
  border: 1.5px solid #9c79ff;
  background: #fff;
  transition: border-color 0.3s ease;
}

.search-input:hover,
.search-input:focus-within {
  border-color: #6b4fff;
  box-shadow: 0 0 8px #6b4fff66;
}

.search-btn {
  border-radius: 30px;
  padding: 0 30px;
  font-weight: 600;
  background: linear-gradient(45deg, #6b4fff, #9c79ff);
  border: none;
  box-shadow: 0 6px 12px #9c79ffaa;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: linear-gradient(45deg, #9c79ff, #6b4fff);
  box-shadow: 0 8px 20px #6b4fffcc;
  transform: translateY(-2px);
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 一行最多3个 */
  gap: 30px;
  max-width: 1200px;    /* 最大宽度限制，避免太宽 */
  margin: 0 auto;       /* 容器居中 */
  padding: 0 20px;      /* 两边留点空白 */
  box-sizing: border-box;
}

/* 响应式：屏幕小于900px时变成2列 */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 屏幕小于600px时1列 */
@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 12px 24px rgba(107, 79, 255, 0.1);
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease;
  border: 3px solid transparent;
  outline-offset: 4px;
}

.card:focus-visible {
  outline: none;
  border: 3px solid #6b4fff;
  box-shadow: 0 0 12px #6b4fffaa;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 48px rgba(107, 79, 255, 0.25);
  border: 3px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(45deg, #6b4fff, #9c79ff);
}

.image-wrapper {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 14px rgba(107, 79, 255, 0.1);
  margin-bottom: 18px;
  aspect-ratio: 16 / 9;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.card:hover .image-wrapper img {
  transform: scale(1.05);
}

.project-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #4b0082;
  text-align: center;
  user-select: text;
}

.search-bar {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.filter-select {
  width: 140px;
}

.search-input {
  width: 320px;
}
</style>

