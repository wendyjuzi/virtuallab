<template>
  <div class="home">
    <!-- 直接显示首页内容，无论是否登录 -->
    <el-button
      class="back-btn"
      @click="router.back()"
      circle
      plain
      type="primary"
      title="返回上一页"
    >
      <el-icon><ArrowLeft /></el-icon>
    </el-button>
    <!-- 实验项目轮播图 -->
    <div class="experiment-carousel-container">
      <div class="experiment-carousel fancy-carousel">
        <div class="carousel-track-3d">
          <div
              v-for="(experiment, idx) in carouselExperiments"
              :key="experiment.id"
              class="carousel-item-3d"
              :class="{ active: idx === carouselIndex, left: idx === leftIndex, right: idx === rightIndex, farleft: idx === farLeftIndex, farright: idx === farRightIndex }"
              @click="viewExperiment(experiment)"
              :style="get3DStyle(idx)"
          >
            <img :src="experiment.imageUrl || experiment.image || '/images/experiments/experiment1.png'" :alt="experiment.title || experiment.name" class="carousel-img-3d" />
            <div class="carousel-caption-3d">
              <h3>{{ experiment.title || experiment.name }}</h3>
            </div>
          </div>
        </div>
        <button
          class="carousel-control prev fancy-btn"
          @click="prevCarousel"
          aria-label="上一张"
        >
          <i class="el-icon-arrow-left"></i>
        </button>
        <button
          class="carousel-control next fancy-btn"
          @click="nextCarousel"
          aria-label="下一张"
        >
          <i class="el-icon-arrow-right"></i>
        </button>
        <div class="carousel-indicators">
          <span
              v-for="(item, idx) in carouselExperiments"
              :key="item.id"
              :class="['indicator', { active: idx === carouselIndex }]"
              @click="goToCarousel(idx)"
          ></span>
        </div>
      </div>
    </div>
    <!-- 主要内容区域 -->
    <el-container>
      <el-main class="main">
        <!-- 分类筛选 -->
        <!-- 排序选项 -->
        <div class="sort-options">
          <el-radio-group
            v-model="sort"
            @change="handleSortChange"
            class="sort-group"
          >
            <el-radio-button value="hot">热门</el-radio-button>
            <el-radio-button value="newest">最新</el-radio-button>
            <el-radio-button value="views">浏览</el-radio-button>
            <el-radio-button value="likes">点赞</el-radio-button>
            <el-radio-button value="favorites">收藏</el-radio-button>
          </el-radio-group>
        </div>
        <!-- 实验项目展示 -->
        <div class="experiments-grid">
          <el-row :gutter="24" v-loading="loading">
            <el-col
              :span="6"
              v-for="experiment in filteredExperiments"
              :key="experiment.id"
            >
              <el-card
                class="experiment-card"
                @click="viewExperiment(experiment)"
              >
                <div class="experiment-image">
                  <img :src="experiment.imageUrl || experiment.image || '/images/experiments/experiment1.png'" :alt="experiment.title || experiment.name">
                  <div class="experiment-overlay">
                    <el-icon class="view-icon"><View /></el-icon>
                  </div>
                </div>
                <div class="experiment-info">
                  <h3 class="experiment-title">
                    {{ experiment.title || experiment.name }}
                  </h3>
                  <div class="experiment-stats"></div>
                  <!-- 点赞收藏按钮 -->
                  <div class="experiment-actions" @click.stop>
                    <LikeFavoriteButton
                        :experiment-id="experiment.id"
                        :initial-like-count="experiment.likes || 0"
                        :initial-favorite-count="experiment.favorites || 0"
                    />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <!-- 空状态 -->
          <div
            v-if="!loading && filteredExperiments.length === 0"
            class="empty-state"
          >
            <el-empty description="暂无实验数据" />
          </div>
        </div>
        <!-- 系统介绍 -->
        <div class="system-intro">
          <h2>系统特色</h2>
          <div class="features-grid">
            <div class="feature-item">
              <el-icon class="feature-icon"><Monitor /></el-icon>
              <h3>实验管理</h3>
              <p>完整的实验项目管理，支持多种实验类型</p>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><User /></el-icon>
              <h3>用户管理</h3>
              <p>完善的权限管理系统，支持多角色分配</p>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><DataAnalysis /></el-icon>
              <h3>数据分析</h3>
              <p>强大的数据分析和可视化功能</p>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <span>© 2024 虚拟实验室管理系统 VirtualLab</span>
        <div class="footer-links">
          <a
            href="https://www.flaticon.com/free-stickers/study"
            title="study stickers"
            target="_blank"
            rel="noopener noreferrer"
          >
            Study stickers created by Stickers - Flaticon
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { View, Star, Collection, Monitor, User, DataAnalysis, ArrowLeft, Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import LikeFavoriteButton from '@/components/LikeFavoriteButton.vue'
import { getExperimentList } from '@/api/experiment'
import { useUserStore } from '@/store/user'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter();
const userStore = useUserStore();
const isLogin = computed(() => !!userStore.token);

function goLogin() {
  router.push("/login");
}

// 响应式数据
const activeCategory = ref("all");
const sort = ref("hot");
const loading = ref(false);

// 实验数据
const experiments = ref<any[]>([]);

// 获取实验列表
const fetchExperiments = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: 1,
      size: 20,
    };

    // 添加分类筛选
    if (activeCategory.value !== "all") {
      params.category = activeCategory.value;
    }

    // 添加排序
    if (sort.value) {
      params.sort = sort.value;
    }

    const res: any = await getExperimentList(params);
    if (res.code === 200) {
      experiments.value = res.data.records || res.data.list || res.data || [];
    } else {
      ElMessage.error(res?.message || "获取实验列表失败");
    }
  } catch (error: any) {
    console.error("获取实验列表失败:", error);
    ElMessage.error("获取实验列表失败");
  } finally {
    loading.value = false;
  }
};

// 根据分类筛选实验
const filteredExperiments = computed(() => {
  let filtered = experiments.value;

  // 前端二次筛选（如果后端不支持）
  if (activeCategory.value !== "all") {
    filtered = filtered.filter((exp) => exp.category === activeCategory.value);
  }

  // 前端排序（如果后端不支持）
  switch (sort.value) {
    case "hot":
      return filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    case "newest":
      return filtered.sort(
        (a, b) =>
          new Date(b.createTime || 0).getTime() -
          new Date(a.createTime || 0).getTime()
      );
    case "views":
      return filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    case "likes":
      return filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    case "favorites":
      return filtered.sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
    default:
      return filtered;
  }
});

// 事件处理
const handleCategoryChange = () => {
  fetchExperiments();
};

const handleSortChange = () => {
  fetchExperiments();
};

const viewExperiment = (experiment: any) => {
  router.push(`/experiment/${experiment.id}`);
};

// 轮播图相关逻辑
const carouselIndex = ref(0);
const carouselExperiments = computed(() => experiments.value.slice(0, 5));
let carouselTimer: any = null;

const nextCarousel = () => {
  carouselIndex.value =
    (carouselIndex.value + 1) % carouselExperiments.value.length;
};
const prevCarousel = () => {
  carouselIndex.value =
    (carouselIndex.value - 1 + carouselExperiments.value.length) %
    carouselExperiments.value.length;
};
const goToCarousel = (idx: number) => {
  carouselIndex.value = idx;
};
const startCarouselAuto = () => {
  stopCarouselAuto();
  carouselTimer = setInterval(() => {
    nextCarousel();
  }, 3500);
};
const stopCarouselAuto = () => {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = null;
};

// 3D轮播索引计算
const leftIndex = computed(
  () =>
    (carouselIndex.value - 1 + carouselExperiments.value.length) %
    carouselExperiments.value.length
);
const rightIndex = computed(
  () => (carouselIndex.value + 1) % carouselExperiments.value.length
);
const farLeftIndex = computed(
  () =>
    (carouselIndex.value - 2 + carouselExperiments.value.length) %
    carouselExperiments.value.length
);
const farRightIndex = computed(
  () => (carouselIndex.value + 2) % carouselExperiments.value.length
);

const get3DStyle = (idx: number) => {
  if (idx === carouselIndex.value) {
    return {
      zIndex: 3,
      transform: "translateX(0) scale(1.1) rotateY(0deg)",
      filter: "brightness(1.1) drop-shadow(0 0 24px #6366f1cc)",
      opacity: 1,
      pointerEvents: "auto" as "auto",
    };
  } else if (idx === leftIndex.value) {
    return {
      zIndex: 2,
      transform: "translateX(-60%) scale(0.85) rotateY(18deg)",
      filter: "blur(1px) brightness(0.9)",
      opacity: 0.7,
      pointerEvents: "auto" as "auto",
    };
  } else if (idx === rightIndex.value) {
    return {
      zIndex: 2,
      transform: "translateX(60%) scale(0.85) rotateY(-18deg)",
      filter: "blur(1px) brightness(0.9)",
      opacity: 0.7,
      pointerEvents: "auto" as "auto",
    };
  } else if (idx === farLeftIndex.value) {
    return {
      zIndex: 1,
      transform: "translateX(-120%) scale(0.7) rotateY(30deg)",
      filter: "blur(2.5px) brightness(0.7)",
      opacity: 0.3,
      pointerEvents: "auto" as "auto",
    };
  } else if (idx === farRightIndex.value) {
    return {
      zIndex: 1,
      transform: "translateX(120%) scale(0.7) rotateY(-30deg)",
      filter: "blur(2.5px) brightness(0.7)",
      opacity: 0.3,
      pointerEvents: "auto" as "auto",
    };
  } else {
    return {
      zIndex: 0,
      opacity: 0,
      pointerEvents: "none" as "none",
      transform: "scale(0.5)",
    };
  }
};

// 生命周期
onMounted(() => {
  fetchExperiments();
  startCarouselAuto();
});
onUnmounted(() => {
  stopCarouselAuto();
});
</script>

<style scoped>
.home {
  background: #f8fafc;
  min-height: 100vh;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #6366f1;
}

.login-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}

.main {
  width: 96vw;
  max-width: 1500px;
  margin: 0 auto;
  padding: 40px 32px 56px 32px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 32px 0 rgba(124, 58, 237, 0.04);
}
@media (max-width: 1500px) {
  .main {
    max-width: 96vw;
    padding: 24px 2vw 40px 2vw;
  }
}

.category-filter {
  margin-bottom: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(60, 60, 120, 0.04);
  padding: 12px 24px 0 24px;
}

.category-tabs {
  --el-tabs-header-height: 48px;
  --el-tabs-header-bg-color: transparent;
  font-size: 18px;
}

.sort-options {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(124, 58, 237, 0.04);
  border: 1.5px solid #a5b4fc;
  padding: 16px 32px;
  margin-bottom: 32px;
}
.sort-group .el-radio-button__inner {
  border-radius: 18px !important;
  background: #f6f7fb;
  color: #6366f1;
  border: 1.5px solid #a5b4fc;
  font-weight: 600;
  transition:
    background 0.2s,
    color 0.2s;
}
.sort-group .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background: linear-gradient(135deg, #a5b4fc 0%, #7c3aed 100%);
  color: #fff;
  border-color: #7c3aed;
}

.experiments-grid {
  margin-bottom: 40px;
}

.el-row {
  border-radius: 32px;
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.07) 0%,
    rgba(99, 102, 241, 0.09) 100%
  );
  backdrop-filter: blur(18px) saturate(1.15);
  -webkit-backdrop-filter: blur(18px) saturate(1.15);
  padding: 24px 12px;
  margin-bottom: 40px;
}

.experiment-card {
  border-radius: 28px;
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.08);
  background: rgba(255, 255, 255, 0.75);
  border: 1.5px solid #a5b4fc;
  transition:
    box-shadow 0.3s,
    border 0.2s,
    background 0.3s,
    transform 0.2s;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 32px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(18px) saturate(1.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.2);
}
.experiment-card:hover {
  box-shadow: 0 12px 48px rgba(124, 58, 237, 0.18);
  border: 1.5px solid #7c3aed;
  transform: translateY(-6px) scale(1.04);
  background: rgba(255, 255, 255, 0.92);
}

.experiment-image {
  width: 100%;
  height: 160px;
  background: #e0e7ef;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.experiment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px 20px 0 0;
  transition: transform 0.3s;
}

.experiment-card:hover .experiment-image img {
  transform: scale(1.06);
}

.experiment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.08) 0%,
    rgba(0, 0, 0, 0.18) 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.experiment-card:hover .experiment-overlay {
  opacity: 1;
}

.view-icon {
  color: #fff;
  font-size: 32px;
  opacity: 0.8;
}

.experiment-info {
  padding: 18px 16px 12px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.experiment-title {
  font-size: 22px;
  font-weight: 700;
  color: #7c3aed;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.experiment-desc {
  font-size: 15px;
  color: #6c757d;
  margin-bottom: 16px;
  min-height: 40px;
}

.experiment-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.stat .el-icon {
  font-size: 16px;
  color: #6366f1;
}

.experiment-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.system-intro {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(124, 58, 237, 0.04);
  border: 1.5px solid #a5b4fc;
  padding: 48px 32px 32px 32px;
  margin-top: 48px;
}
.features-grid {
  display: flex;
  gap: 40px;
  margin-top: 24px;
  justify-content: space-between;
}
.feature-item {
  flex: 1;
  background: linear-gradient(135deg, #f8f8fe 0%, #ede9fe 100%);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.04);
  border: 1.5px solid #a5b4fc;
  padding: 36px 18px;
  text-align: center;
  transition:
    box-shadow 0.3s,
    transform 0.3s;
  color: #3b2177;
}
.feature-item:hover {
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
  transform: translateY(-4px) scale(1.04);
}
.feature-icon {
  font-size: 44px;
  color: #7c3aed;
  margin-bottom: 16px;
}
.feature-item h3 {
  font-size: 22px;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 12px;
}
.feature-item p {
  color: #7f8c8d;
  line-height: 1.7;
  font-size: 16px;
}

.footer {
  background: #fff;
  border-top: 1.5px solid #a5b4fc;
  padding: 24px 0;
  text-align: center;
  color: #6366f1;
  font-size: 16px;
  margin-top: 64px;
}
.footer-links a {
  color: #7c3aed;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}
.footer-links a:hover {
  color: #6366f1;
  text-decoration: underline;
}

.experiment-carousel-container {
  width: 96vw;
  max-width: 1500px;
  margin: 0 auto 32px auto;
  border: none;
  border-radius: 28px;
  box-shadow: none;
  padding-top: 32px;
  position: relative;
  z-index: 2;
}
.fancy-carousel {
  width: 75vw;
  max-width: 1100px;
  height: 470px;
  margin: 0 auto;
  /* background: linear-gradient(135deg, #e0e7ef 0%, #f1f5f9 100%); */
  box-shadow:
    0 8px 32px 0 #a5b4fc33,
    0 2px 8px #7c3aed22;
  position: relative;
  overflow: visible;
  border: none;
  border-radius: 28px;
}
.carousel-track-3d {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  z-index: 1;
  background: transparent;
}
.carousel-item-3d {
  position: absolute;
  top: 0;
  left: 50%;
  width: 650px;
  height: 370px;
  margin-left: -325px;
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 22px;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
  will-change: transform, filter, opacity;
  box-shadow: 0 8px 32px 0 #7c3aed22;
  filter: none !important;
}
.carousel-img-3d {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 22px;
  transition:
    box-shadow 0.4s,
    filter 0.4s;
  box-shadow: none !important;
  filter: none !important;
}
.carousel-item-3d.active .carousel-img-3d {
  box-shadow: none !important;
  filter: none !important;
}
.carousel-caption-3d {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(124, 58, 237, 0.1) 0%,
    rgba(0, 0, 0, 0.28) 100%
  );
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  border-radius: 0 0 22px 22px;
  padding: 24px 40px 18px 40px;
  letter-spacing: 1px;
  text-shadow: none !important;
  pointer-events: none;
  user-select: none;
}
.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 22px;
  color: #6366f1;
  z-index: 3;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(60, 60, 120, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.carousel-control.prev {
  left: 16px;
}
.carousel-control.next {
  right: 16px;
}
.carousel-control:hover {
  background: #6366f1;
  color: #fff;
}
.carousel-indicators {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 16px;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 4;
}
.indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e0e7ef;
  border: 2px solid #a5b4fc;
  transition:
    background 0.3s,
    border 0.3s,
    transform 0.3s;
}
.indicator.active {
  background: #7c3aed;
  border-color: #7c3aed;
  transform: scale(1.3);
}
.fancy-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px #6366f1cc;
  transition:
    background 0.2s,
    transform 0.2s;
}
.fancy-btn:hover {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: #fff;
  transform: scale(1.1);
}
.carousel-indicators .indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin: 0 6px;
  background: linear-gradient(135deg, #e0e7ef 0%, #a5b4fc 100%);
  border: 2.5px solid #a5b4fc;
  box-shadow: 0 2px 8px #a5b4fc33;
  opacity: 0.7;
  transition:
    background 0.3s,
    border 0.3s,
    transform 0.3s,
    box-shadow 0.3s,
    opacity 0.3s;
  cursor: pointer;
}
.carousel-indicators .indicator.active {
  background: linear-gradient(135deg, #7c3aed 0%, #a5b4fc 100%);
  border-color: #7c3aed;
  box-shadow:
    0 0 16px 4px #a5b4fc88,
    0 0 0 4px #fff8;
  opacity: 1;
  transform: scale(1.25);
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .experiment-carousel-container,
  .fancy-carousel {
    max-width: 98vw;
  }
  .carousel-item-3d {
    width: 80vw;
    max-width: 98vw;
    height: 320px;
    margin-left: calc(-40vw);
  }
}
@media (max-width: 1100px) {
  .experiment-carousel-container,
  .fancy-carousel {
    max-width: 75vw;
  }
  .carousel-item-3d {
    width: 60vw;
    max-width: 75vw;
    height: 280px;
    margin-left: calc(-30vw);
  }
}
@media (max-width: 1200px) {
  .carousel-item-3d {
    height: 320px;
  }
}

@media (max-width: 900px) {
  .carousel-item-3d,
  .carousel-img-3d {
    width: 350px;
    height: 200px;
    margin-left: -175px;
    border-radius: 14px;
  }
  .carousel-caption-3d {
    font-size: 15px;
    padding: 10px 16px 8px 16px;
    border-radius: 0 0 14px 14px;
  }
  .fancy-carousel {
    height: 220px;
  }
}
@media (max-width: 768px) {
  .main {
    padding: 16px;
  }

  .experiment-card {
    height: 340px;
    margin-bottom: 16px;
  }

  .experiment-image {
    height: 160px;
  }

  .experiment-info {
    padding: 16px;
  }

  .experiment-title {
    font-size: 16px;
  }

  .experiment-desc {
    font-size: 13px;
    -webkit-line-clamp: 2;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  .fancy-carousel {
    height: 180px;
  }
  .carousel-item-3d,
  .carousel-img-3d {
    width: 220px;
    height: 140px;
    margin-left: -110px;
    border-radius: 14px;
  }
  .carousel-caption-3d {
    font-size: 15px;
    padding: 10px 16px 8px 16px;
    border-radius: 0 0 14px 14px;
  }
}

@media (max-width: 600px) {
  .carousel-item-3d,
  .carousel-img-3d {
    width: 200px;
    height: 110px;
    margin-left: -100px;
    border-radius: 8px;
  }
  .carousel-caption-3d {
    font-size: 11px;
    padding: 6px 8px 4px 8px;
    border-radius: 0 0 8px 8px;
  }
  .fancy-carousel {
    height: 120px;
  }
}

@media (max-width: 480px) {
  .experiment-card {
    height: 320px;
  }

  .experiment-image {
    height: 140px;
  }

  .experiment-info {
    padding: 12px;
  }

  .experiment-title {
    font-size: 15px;
  }

  .experiment-desc {
    font-size: 12px;
  }

  .experiment-stats {
    gap: 12px;
    padding: 8px 0;
  }

  .stat {
    font-size: 12px;
  }
  .fancy-carousel {
    height: 120px;
  }
  .carousel-item-3d,
  .carousel-img-3d {
    width: 120px;
    height: 80px;
    margin-left: -60px;
    border-radius: 10px;
  }
  .carousel-caption-3d {
    font-size: 12px;
    padding: 6px 8px 4px 8px;
    border-radius: 0 0 10px 10px;
  }
}

.empty-state {
  margin: 48px 0 32px 0;
  text-align: center;
}

.back-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 200;
  background: #fff;
  box-shadow: 0 2px 8px rgba(60, 60, 120, 0.08);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    box-shadow 0.2s,
    background 0.2s;
}
.back-btn:hover {
  background: #f1f5f9;
  box-shadow: 0 4px 16px rgba(60, 60, 120, 0.16);
}
</style>
