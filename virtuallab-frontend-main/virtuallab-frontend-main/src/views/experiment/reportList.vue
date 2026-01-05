<template>
  <div class="report-list-container">
    <!-- 头部导航栏 -->
    <div class="report-navbar">
      <!-- 返回按钮 -->
      <div class="back-button-container">
        <button class="back-button" @click="goBack">
          <i class="back-icon">←</i>
          返回
        </button>
      </div>
      <div class="navbar-brand">
        <i class="icon-lab"></i>
        <span>虚拟实验室管理系统</span>
      </div>
      <div class="navbar-actions">
        <el-button type="primary" @click="refreshList">
          <i class="icon-refresh"></i> 刷新列表
        </el-button>
      </div>
    </div>

    <!-- 报告列表主体 -->
    <div class="list-container">
      <div class="list-header">
        <h2>我的实验报告</h2>
        <div class="list-meta">
          <span>共 {{ reports.length }} 份报告</span>
          <el-select
            v-model="filterStatus"
            placeholder="筛选状态"
            style="width: 120px"
          >
            <el-option label="全部" value="all"></el-option>
            <el-option label="草稿" value="DRAFT"></el-option>
            <el-option label="已保存" value="SAVED"></el-option>
            <el-option label="已提交" value="SUBMITTED"></el-option>
            <el-option label="已评分" value="GRADED"></el-option>
          </el-select>
        </div>
      </div>

      <!-- 报告列表 -->
      <div class="report-cards">
        <el-card
          v-for="report in filteredReports"
          :key="report.id"
          class="report-card"
          @click="viewReport(report.sessionId)"
        >
          <div class="card-header">
            <h3>{{ report.title }}</h3>
            <el-tag :type="getStatusTagType(report.status)">
              {{ formatStatus(report.status) }}
            </el-tag>
          </div>
          <div class="card-content">
            <div class="content-meta">
              <div class="meta-item">
                <i class="icon-calendar"></i>
                <span>创建时间: {{ formatDate(report.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <i class="icon-update"></i>
                <span>更新时间: {{ formatDate(report.updatedAt) }}</span>
              </div>
            </div>
            <div class="content-preview">
              {{ truncateContent(report.description) }}
            </div>
          </div>
          <div class="card-footer">
            <el-button
              type="primary"
              size="small"
              @click.stop="viewReport(report.sessionId)"
            >
              查看详情
            </el-button>
          </div>
        </el-card>

        <!-- 空状态 -->
        <div v-if="filteredReports.length === 0" class="empty-state">
          <i class="icon-empty"></i>
          <p>暂无实验报告</p>
          <el-button type="primary" @click="createNewReport">
            创建新报告
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getSubmittedAndGradedReports, getReportList } from "@/api/experiment";

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const studentId = ref(route.params.studentId);
    const filterStatus = ref("all");
    const loading = ref(false);
    const reports = ref([]);

    console.log("当前studentId:", studentId.value);

    // 获取学生信息
    const fetchStudentInfo = async () => {
      const res = await fetch("/user/profile");
      console.log("API响应状态:", res.status);
      const data = await res.json();
      console.log("完整API响应", data);
      if (data.code === 200) {
        studentInfo.value = data.data;
        console.log("获取到的学生信息:", studentInfo.value);
      } else {
        console.error("API返回错误:", data.message);
      }
    };

    // 从API中获取报告列表
    const fetchReports = async () => {
      loading.value = true;
      try {
        let apiResponse;

        if (studentId.value) {
          // 如果有studentId，获取该学生的报告
          apiResponse = await getReportList(studentId.value);
          console.log("获取特定学生报告:", apiResponse);
        } else {
          // 如果没有studentId，获取所有已提交的报告
          apiResponse = await getSubmittedAndGradedReports();
          console.log("获取所有已提交报告:", apiResponse);
        }

        reports.value = apiResponse || [];
        ElMessage.success(
          studentId.value ? "学生报告列表加载成功" : "所有已提交报告加载成功"
        );
      } catch (error) {
        console.error("加载报告列表失败:", error);
        ElMessage.error("加载报告列表失败:" + (error.message || "未知错误"));
        reports.value = [];
      } finally {
        loading.value = false;
      }
    };

    // 过滤后的报告列表
    const filteredReports = computed(() => {
      if (filterStatus.value === "all") {
        return reports.value;
      }
      return reports.value.filter(
        (report) => report.status === filterStatus.value
      );
    });

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return "未知";
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-CN");
    };

    // 格式化状态
    const formatStatus = (status) => {
      const statusMap = {
        DRAFT: "草稿",
        SAVED: "已保存",
        SUBMITTED: "已提交",
        GRADED: "已评分",
      };
      return statusMap[status] || status;
    };

    // 获取状态标签类型
    const getStatusTagType = (status) => {
      const typeMap = {
        DRAFT: "info",
        SAVED: "",
        SUBMITTED: "warning",
        GRADED: "success",
      };
      return typeMap[status] || "";
    };

    // 截断内容预览
    const truncateContent = (content) => {
      if (!content) return "暂无内容";
      return content.length > 100 ? content.substring(0, 100) + "..." : content;
    };

    // 查看报告详情
    const viewReport = (sessionId) => {
      router.push(`/experiment/report/${sessionId}`);
    };
    // 刷新列表
    const refreshList = () => {
      ElMessage.success("报告列表已刷新");
    };

    // 创建新报告
    const createNewReport = () => {
      ElMessage.info("创建新报告功能待实现");
    };
    const goBack = () => router.back();
    // 初始化加载数据
    onMounted(() => {
      fetchReports();
    });

    return {
      fetchStudentInfo,
      reports,
      filteredReports,
      filterStatus,
      formatDate,
      formatStatus,
      getStatusTagType,
      truncateContent,
      viewReport,
      refreshList,
      createNewReport,
      fetchReports,
      getSubmittedAndGradedReports,
      goBack,
    };
  },
};
</script>

<style scoped>
.report-list-container {
  overflow-y: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  padding: 20px;
  min-height: 100vh;
}

.report-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  margin-bottom: 20px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.navbar-brand i {
  margin-right: 10px;
  font-size: 24px;
}

.list-container {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.list-header h2 {
  font-size: 24px;
  color: #2c3e50;
}

.list-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
}

.report-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.report-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #409eff;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item i {
  margin-right: 8px;
  color: #409eff;
}

.content-preview {
  color: #666;
  line-height: 1.6;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  padding: 50px 0;
  color: #666;
}

.empty-state i {
  font-size: 50px;
  margin-bottom: 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  padding: 50px 0;
  color: #666;
}

.loading-state i {
  font-size: 40px;
  margin-bottom: 15px;
  color: #409eff;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 图标样式 */
[class^="icon-"] {
  font-style: normal;
}

.icon-lab:before {
  content: "🧪";
}
.icon-refresh:before {
  content: "🔄";
}
.icon-calendar:before {
  content: "📅";
}
.icon-update:before {
  content: "⏱️";
}
.icon-empty:before {
  content: "📭";
}

.back-button {
  background-color: color-mix(in srgb, #764ba2, transparent 60%);
  color: #fff;
  padding: 5px 13px;
  border: none;
  outline: none;
  border-radius: 5px;
  display: flex;
  align-content: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.back-button:hover {
  background-color: color-mix(in srgb, #764ba2, transparent 40%);
  transform: translateY(-1.5px);
  /* https://smoothshadows.com/#djEsMSwxLDAuMSwyNCwxMSwwLCMwMzA3MTIsI2YzZjRmNiwjZmZmZmZmLDI%3D */
  box-shadow: 0px 5px 10px rgba(3, 7, 18, 0.1);
}
</style>
