<template>
  <div class="reports-container">
    <div class="header">
      <div class="header-content">
        <div class="header-row">
          <button class="back-btn" @click="$router.back()">
            <i class="fas fa-arrow-left"></i> 返回
          </button>
          <h1><i class="fas fa-chart-line"></i> 院系统计报告</h1>
        </div>
        <div class="department-info">
          <div class="info-item">
            <i class="fas fa-university"></i>
            <span>{{ userStore.userDepartment }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-user-tie"></i>
            <span>管理员: {{ userStore.userName }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar"></i>
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="overview-section">
        <h2><i class="fas fa-tachometer-alt"></i> 数据概览</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="icon-wrapper blue">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.departmentUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper green">
              <i class="fas fa-project-diagram"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.departmentProjects }}</div>
              <div class="stat-label">实验项目数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper orange">
              <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.departmentTeachers }}</div>
              <div class="stat-label">教师数量</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper purple">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.departmentStudents }}</div>
              <div class="stat-label">学生数量</div>
            </div>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-container">
          <h2><i class="fas fa-chart-bar"></i> 用户分布</h2>
          <div class="chart-wrapper">
            <canvas ref="userDistributionChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <h2><i class="fas fa-chart-pie"></i> 项目状态</h2>
          <div class="chart-wrapper">
            <canvas ref="projectStatusChart"></canvas>
          </div>
        </div>
      </div>

      <div class="data-section">
        <h2><i class="fas fa-table"></i> 审核日志详情</h2>
        <div class="controls">
          <div class="search-box">
            <input type="text" placeholder="搜索项目、审核人或意见..." v-model="searchQuery">
            <i class="fas fa-search"></i>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
            <tr>
              <th>项目名称</th>
              <th>审核人</th>
              <th>原状态</th>
              <th>新状态</th>
              <th>审核意见</th>
              <th>审核时间</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="log in auditLogs" :key="log.id">
              <td>{{ log.projectName }}</td>
              <td>{{ log.auditorName }}</td>
              <td>
              <span :class="['status-badge', getStatusClass(log.fromStatus)]">
                {{ translateStatus(log.fromStatus) }}
              </span>
              </td>
              <td>
              <span :class="['status-badge', getStatusClass(log.toStatus)]">
                {{ translateStatus(log.toStatus) }}
              </span>
              </td>
              <td>{{ log.comment || '-' }}</td>
              <td>{{ formatDate(log.createdAt) }}</td>
            </tr>

            <!-- 添加：空数据提示 -->
            <tr v-if="!isLoading && auditLogs.length === 0">
              <td colspan="6" class="empty-data">暂无审核日志数据</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>© 2025 虚拟实验室管理系统 - 院系统计报告</p>
      <p>数据更新于: {{ lastUpdated }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/store/user';
import Chart from 'chart.js/auto';
import {
  getDepartmentUserStats,
  getDepartmentTeacherCount,
  getDepartmentStudentCount,
  getDepartmentProjectCount
} from '@/api/request'
import {
  getAllProjects,
  getPendingProjects,
  getApprovedProjects,
  getRejectedProjects
} from '@/api/audit'  // 正确路径
import {
  getAuditLogsByDepartment // 新增API
} from '@/api/audit';
import {watch} from "vue"

export default {
  setup() {
    const userStore = useUserStore();
    const stats = ref({
      departmentUsers: 0,
      departmentProjects: 0,
      departmentTeachers: 0,
      departmentStudents: 0
    });

    // 新增审核日志相关状态
    const auditLogs = ref([]);
    const totalLogs = ref(0);
    const isLoading = ref(false);

    // 状态翻译
    const translateStatus = (status) => {
      const statusMap = {
        'draft': '草稿',
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已驳回',
        'published': '已发布'
      };
      return statusMap[status] || status;
    };

    // 状态样式
    const getStatusClass = (status) => {
      const classMap = {
        'draft': 'draft',
        'pending': 'pending',
        'approved': 'approved',
        'rejected': 'rejected',
        'published': 'published'
      };
      return classMap[status] || '';
    };

    // 分页计算
    const totalPages = computed(() => {
      return Math.ceil(totalLogs.value / itemsPerPage);
    });

    // 修改：优化获取审核日志函数
    const fetchAuditLogs = async () => {
      isLoading.value = true;
      try {
        const response = await getAuditLogsByDepartment(
            userStore.userDepartment,
            searchQuery.value,
            currentPage.value,
            itemsPerPage
        );

        // 适配后端Page对象结构
        auditLogs.value = response.data.records || [];
        totalLogs.value = response.data.total || 0;
      } catch (error) {
        console.error('获取审核日志失败:', error);
        auditLogs.value = [];
        totalLogs.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    // 添加项目状态统计数据
    const projectStats = ref({
      all: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    });

    // 模拟用户数据（保持不变）
    const users = ref([
      { id: 1, name: '张教授', username: 'zhang_prof', role: 'teacher', status: 'active', lastLogin: '2023-07-03T14:30:00Z' },
      // ...其他用户数据
    ]);

    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 8;
    const sortField = ref('name');
    const sortDirection = ref('asc');

    // 图表引用
    const userDistributionChart = ref(null);
    const projectStatusChart = ref(null);

    // 日期格式化
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 当前日期
    const currentDate = computed(() => {
      return new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    });

    // 最后更新时间
    const lastUpdated = computed(() => {
      return new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    // 角色名称转换
    const getRoleName = (role) => {
      const roleNames = {
        'department_admin': '院系管理员',
        'teacher': '教师',
        'student': '学生'
      };
      return roleNames[role] || role;
    };

    // 角色样式类
    const getRoleClass = (role) => {
      return role === 'department_admin' ? 'admin' :
          role === 'teacher' ? 'teacher' : 'student';
    };

    // 排序方法
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    };

    // 过滤和排序后的用户列表
    const filteredUsers = computed(() => {
      let result = [...users.value];

      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        );
      }

      // 排序
      result.sort((a, b) => {
        let modifier = 1;
        if (sortDirection.value === 'desc') modifier = -1;

        if (a[sortField.value] < b[sortField.value]) return -1 * modifier;
        if (a[sortField.value] > b[sortField.value]) return 1 * modifier;
        return 0;
      });

      return result;
    });

    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredUsers.value.slice(start, end);
    });


    // 导出数据
    const exportData = () => {
      alert('导出数据功能已触发！在实际应用中，这里会生成CSV或Excel文件下载。');
    };

    // 初始化图表
    const initCharts = () => {
      // 用户分布图表
      new Chart(userDistributionChart.value, {
        type: 'bar',
        data: {
          labels: ['教师', '学生', '管理员'],
          datasets: [{
            label: '用户数量',
            data: [
              stats.value.departmentTeachers,
              stats.value.departmentStudents,
              2 // 管理员数量假设为2
            ],
            backgroundColor: [
              'rgba(255, 159, 64, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(54, 162, 235, 0.7)'
            ],
            borderColor: [
              'rgb(255, 159, 64)',
              'rgb(153, 102, 255)',
              'rgb(54, 162, 235)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: '用户类型分布'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });

      // 项目状态图表（保持不变）
      new Chart(projectStatusChart.value, {
        type: 'doughnut',
        data: {
          labels: ['全部项目', '待审核', '已通过', '已驳回'],
          datasets: [{
            label: '项目数量',
            data: [
              projectStats.value.all,
              projectStats.value.pending,
              projectStats.value.approved,
              projectStats.value.rejected
            ],
            backgroundColor: [
              'rgba(153, 102, 255, 0.7)', // 紫色 - 全部
              'rgba(255, 205, 86, 0.7)',  // 黄色 - 待审核
              'rgba(75, 192, 192, 0.7)',  // 绿色 - 已通过
              'rgba(255, 99, 132, 0.7)'   // 红色 - 已驳回
            ],
            borderColor: [
              'rgb(153, 102, 255)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(255, 99, 132)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.raw}个`;
                }
              }
            }
          }
        }
      });
    };
    // 获取项目状态统计数据 - 新增方法
    const fetchProjectStats = async () => {
      try {
        // 获取全部项目数量
        const allRes = await getAllProjects('', userStore.userDepartment, 1, 1);
        projectStats.value.all = allRes.data.total || 0;

        // 获取待审核项目数量
        const pendingRes = await getPendingProjects('', userStore.userDepartment, 1, 1);
        projectStats.value.pending = pendingRes.data.total || 0;

        // 获取已通过项目数量
        const approvedRes = await getApprovedProjects('', userStore.userDepartment, 1, 1);
        projectStats.value.approved = approvedRes.data.total || 0;

        // 获取已驳回项目数量
        const rejectedRes = await getRejectedProjects('', userStore.userDepartment, 1, 1);
        projectStats.value.rejected = rejectedRes.data.total || 0;

        console.log('项目状态统计:', projectStats.value);
      } catch (error) {
        console.error('获取项目状态统计失败:', error);
        // 设置默认值
        projectStats.value = {
          all: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        };
      }
    };

    // 获取院系统计数据
    const fetchDepartmentStats = async () => {
      try {
        // 获取总用户数
        const userStatsRes = await getDepartmentUserStats(userStore.user?.id || 0);
        stats.value.departmentUsers = userStatsRes.data.total;

        // 获取教师数量
        const teacherRes = await getDepartmentTeacherCount(userStore.user?.id || 0);
        stats.value.departmentTeachers = teacherRes.data || 0;

        // 获取学生数量
        const studentRes = await getDepartmentStudentCount(userStore.user?.id || 0);
        stats.value.departmentStudents = studentRes.data || 0;

        // 获取项目数量
        const projectRes = await getDepartmentProjectCount(userStore.user?.id || 0);
        stats.value.departmentProjects = projectRes.data.count;

        // 获取项目状态统计
        await fetchProjectStats();

        // 初始化图表
        initCharts();
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 设置默认值
        stats.value = {
          departmentUsers: 0,
          departmentProjects: 0,
          departmentTeachers: 0,
          departmentStudents: 0
        }
      }
    };

    // 在组件挂载时获取数据
    onMounted(() => {
      fetchDepartmentStats();
      fetchAuditLogs(); // 新增
    });

    // 搜索和分页方法
    const handleSearch = () => {
      currentPage.value = 1;
      fetchAuditLogs();
    };

    // 监听搜索查询变化
    watch(searchQuery, handleSearch);

    // 分页导航
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        fetchAuditLogs();
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchAuditLogs();
      }
    };

    return {
      userStore,
      stats,
      users,
      searchQuery,
      currentPage,
      totalPages,
      paginatedUsers,
      auditLogs,
      isLoading,
      translateStatus,
      getStatusClass,
      nextPage,
      prevPage,
      sortBy,
      exportData,
      formatDate,
      currentDate,
      lastUpdated,
      getRoleName,
      getRoleClass,
      userDistributionChart,
      projectStatusChart
    };
  }
};
</script>

<style scoped>
.reports-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* 只保留header/footer渐变，其余为白色 */
  background: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  /* 毛玻璃特效+圆角+渐变 */
  background: rgba(161, 140, 209, 0.18);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  color: #4b2673;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 16px rgba(161, 140, 209, 0.12);
  border-bottom-left-radius: 32px;
  border-bottom-right-radius: 32px;
  border: 1.5px solid rgba(161, 140, 209, 0.18);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}

.header h1 {
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #6b46c1;
  letter-spacing: 2px;
  font-weight: 800;
}

.department-info {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  background: rgba(161, 140, 209, 0.08);
  padding: 0.4rem 1.1rem;
  border-radius: 20px;
  color: #6b46c1;
  font-weight: 500;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  background: #fff;
  border-radius: 0;
}

.overview-section, .charts-section, .data-section {
  margin-bottom: 2.5rem;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
}

h2 {
  font-size: 1.4rem;
  margin-bottom: 1.2rem;
  color: #2c5282;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.2rem;
  font-size: 1.5rem;
}

.icon-wrapper.blue {
  background: rgba(54, 162, 235, 0.15);
  color: #36a2eb;
}

.icon-wrapper.green {
  background: rgba(75, 192, 192, 0.15);
  color: #4bc0c0;
}

.icon-wrapper.orange {
  background: rgba(255, 159, 64, 0.15);
  color: #ff9f40;
}

.icon-wrapper.purple {
  background: rgba(153, 102, 255, 0.15);
  color: #9966ff;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c5282;
}

.stat-label {
  font-size: 0.95rem;
  color: #718096;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
}

.chart-container {
  background: linear-gradient(135deg, #ede7f6 0%, #f6f3fa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  color: #9f7aea;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.chart-container h2 {
  color: #9f7aea;
  text-align: center;
  width: 100%;
}

.chart-container .chart-wrapper,
.chart-container .chart-label,
.chart-container .chart-title {
  color: #9f7aea;
  text-align: center;
  width: 100%;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.export-btn {
  background: #2c5282;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  transition: background 0.3s;
}

.export-btn:hover {
  background: #1a3a7c;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f1f5f9;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c5282;
  cursor: pointer;
  user-select: none;
}

th i {
  margin-left: 0.3rem;
  font-size: 0.8rem;
  color: #a0aec0;
}

tbody tr {
  border-bottom: 1px solid #edf2f7;
}

tbody tr:last-child {
  border-bottom: none;
}

tbody td {
  padding: 1rem;
  color: #4a5568;
}

.role-badge, .status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(66, 153, 225, 0.15);
  color: #2b6cb0;
}

.role-badge.teacher {
  background: rgba(246, 173, 85, 0.15);
  color: #c05621;
}

.role-badge.student {
  background: rgba(159, 122, 234, 0.15);
  color: #6b46c1;
}

.status-badge {
  background: rgba(72, 187, 120, 0.15);
  color: #2f855a;
}

.status-badge.inactive {
  background: rgba(247, 184, 181, 0.15);
  color: #c53030;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
/* 添加：空数据样式 */
.empty-data {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

/* 添加：加载指示器样式 */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  color: #4a5568;
  gap: 0.5rem;
}

/* 添加：状态颜色样式 */
.status-badge.draft {
  background: rgba(159, 122, 234, 0.15);
  color: #6b46c1;
}
.pagination button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background: #2c5282;
  color: white;
  border-color: #2c5282;
}

.footer {
  background: rgba(161, 140, 209, 0.18);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  color: #6b46c1;
  padding: 1rem;
  text-align: center;
  font-size: 1rem;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  font-weight: 600;
  border: 1.5px solid rgba(161, 140, 209, 0.18);
  box-shadow: 0 -4px 16px rgba(161, 140, 209, 0.10);
}

.footer p {
  margin: 0.3rem 0;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .controls {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }
}

.back-btn {
  position: static;
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(161, 140, 209, 0.10);
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s, color 0.2s;
}
.back-btn:hover {
  background: linear-gradient(135deg, #6b46c1 0%, #a18cd1 100%);
  color: #fff;
}
</style>