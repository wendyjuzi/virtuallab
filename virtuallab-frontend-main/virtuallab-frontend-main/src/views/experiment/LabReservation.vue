<template>
  <div class="lab-reservation">
    <!-- 顶部导航 -->
    <div class="reservation-header">
      <div class="header-left">
        <button class="back-button" @click="goBack">
          <i class="back-icon">←</i>
          返回
        </button>
        <h1><i class="icon-lab"></i> 实验室预约系统</h1>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="reservation-container">
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-input
            v-model="searchQuery"
            placeholder="搜索实验室..."
            clearable
            @clear="handleSearchClear"
            @keyup.enter="handleSearch"
            class="search-input"
        >
          <template #prefix>
            <el-icon><search /></el-icon>
          </template>
        </el-input>
        <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            clearable
            @change="handleFilterChange"
            class="status-select"
        >
          <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </div>

      <!-- 可用实验室 -->
      <div class="lab-section available-labs">
        <div class="section-header">
          <h2><i class="icon-available"></i> 可用实验室</h2>
          <span class="section-count">共 {{ availableLabs.length }} 个</span>
        </div>
        <div class="lab-cards">
          <el-card
              v-for="lab in paginatedAvailableLabs"
              :key="lab.lab_id"
              class="lab-card"
              shadow="hover"
          >
            <template #header>
              <div class="card-header">
                <h3>{{ lab.lab_name }}</h3>
                <el-tag type="success" size="small">
                  {{ getStatusText(lab.status) }}
                </el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="lab-info">
                <p><i class="icon-location"></i> 位置: {{ lab.location }}</p>
                <p><i class="icon-capacity"></i> 容量: {{ lab.capacity }}人</p>
                <p><i class="icon-desc"></i> 描述: {{ lab.description || '暂无描述' }}</p>
              </div>
              <div class="card-actions">
                <el-button
                    type="primary"
                    size="small"
                    @click="showReservationDialog(lab)"
                >
                  预约
                </el-button>
                <el-button
                    type="info"
                    size="small"
                    @click="showLabDetail(lab)"
                >
                  详情
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
        <el-pagination
            v-if="availableLabs.length > 8"
            v-model:current-page="availableCurrentPage"
            :page-size="8"
            :total="availableLabs.length"
            layout="prev, pager, next"
            :small="true"
            class="section-pagination"
        />
      </div>

      <!-- 不可用实验室 -->
      <div class="lab-section unavailable-labs">
        <div class="section-header">
          <h2><i class="icon-unavailable"></i> 不可用实验室</h2>
          <span class="section-count">共 {{ unavailableLabs.length }} 个</span>
        </div>
        <div class="lab-cards">
          <el-card
              v-for="lab in paginatedUnavailableLabs"
              :key="lab.lab_id"
              class="lab-card"
              shadow="hover"
          >
            <template #header>
              <div class="card-header">
                <h3>{{ lab.lab_name }}</h3>
                <el-tag
                    :type="getStatusTagType(lab.status)"
                    size="small"
                >
                  {{ getStatusText(lab.status) }}
                </el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="lab-info">
                <p><i class="icon-location"></i> 位置: {{ lab.location }}</p>
                <p><i class="icon-capacity"></i> 容量: {{ lab.capacity }}人</p>
                <p><i class="icon-desc"></i> 描述: {{ lab.description || '暂无描述' }}</p>
              </div>
              <div class="card-actions">
                <el-button
                    type="info"
                    size="small"
                    @click="showLabDetail(lab)"
                    :disabled="lab.status === 'maintenance'"
                >
                  详情
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
        <el-pagination
            v-if="unavailableLabs.length > 8"
            v-model:current-page="unavailableCurrentPage"
            :page-size="8"
            :total="unavailableLabs.length"
            layout="prev, pager, next"
            :small="true"
            class="section-pagination"
        />
      </div>
      <div class="reservation-records">
        <ReservationTable
            :data="reservations"
            :loading="loadingReservations"
            @cancel="handleCancelReservation"
            @refresh="getReservations"
        />
      </div>
      <!-- 预约表单对话框 -->
      <el-dialog
          v-model="reservationDialogVisible"
          :title="`预约实验室 - ${selectedLab?.lab_name}`"
          width="600px"
      >
        <el-form
            ref="reservationFormRef"
            :model="reservationForm"
            :rules="reservationRules"
            label-width="100px"
        >
          <el-form-item label="实验室" prop="lab_id">
            <el-input v-model="selectedLab.lab_name" disabled />
          </el-form-item>
          <el-form-item label="预约日期" prop="date">
            <el-date-picker
                v-model="reservationForm.date"
                type="date"
                placeholder="选择日期"
                :disabled-date="disabledDate"
                @change="handleDateChange"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="开始时间" prop="start_time">
            <el-time-select
                v-model="reservationForm.start_time"
                :max-time="reservationForm.end_time"
                placeholder="开始时间"
                start="08:00"
                step="00:30"
                end="22:00"
                @change="handleStartTimeChange"
            />
          </el-form-item>
          <el-form-item label="结束时间" prop="end_time">
            <el-time-select
                v-model="reservationForm.end_time"
                :min-time="reservationForm.start_time"
                placeholder="结束时间"
                start="08:30"
                step="00:30"
                end="22:30"
            />
          </el-form-item>
          <el-form-item label="预约用途" prop="purpose">
            <el-input
                v-model="reservationForm.purpose"
                type="textarea"
                :rows="3"
                placeholder="请输入预约用途"
                maxlength="200"
                show-word-limit
            />
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="reservationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReservation">提交预约</el-button>
      </span>
        </template>
      </el-dialog>

      <!-- 实验室详情对话框 -->
      <el-dialog
          v-model="labDetailVisible"
          :title="`实验室详情 - ${currentLab?.lab_name}`"
          width="700px"
      >
        <div class="lab-detail">
          <div class="detail-header">
            <el-image
                :src="currentLab.image || 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png'"
                fit="cover"
                class="lab-image"
            />
            <div class="detail-info">
              <h3>{{ currentLab.lab_name }}</h3>
              <el-tag :type="getStatusTagType(currentLab.status)" size="medium">
                {{ getStatusText(currentLab.status) }}
              </el-tag>
              <p><i class="icon-location"></i> 位置: {{ currentLab.location }}</p>
              <p><i class="icon-capacity"></i> 容量: {{ currentLab.capacity }}人</p>
            </div>
          </div>
          <div class="detail-content">
            <h4>实验室描述</h4>
            <p>{{ currentLab.description || '暂无详细描述' }}</p>

            <h4>预约记录</h4>
            <el-timeline>
              <el-timeline-item
                  v-for="(reservation, index) in currentLab.reservations"
                  :key="index"
                  :timestamp="formatReservationTime(reservation)"
              >
                {{ reservation.user_name }} 预约用于 {{ reservation.purpose }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watchEffect} from 'vue'
import { Search, ArrowDown, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ReservationTable from "@/views/experiment/ReservationTable.vue";
import {createReservation, getLaboratories, getReservations} from "@/api/LabReservation";
import {useUserStore} from "@/store/user";
import { useRouter } from 'vue-router'

const router = useRouter()
const reservationFormRef = ref();
const userStore = useUserStore()
const currentUser = computed(() => userStore.user)
// 添加监听确保用户数据加载完成
const isUserReady = ref(false)

watchEffect(() => {
  if (currentUser.value?.id) {
    console.log("获取到的用户信息:", currentUser.value)
    isUserReady.value = true
  } else {
    console.log("用户信息尚未加载")
  }
})


// 实验室数据
const laboratories = ref<any[]>([]);
// 预约记录数据
const reservations = ref<any[]>([]);
// 加载状态
const loading = ref(false)

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')
const statusOptions = [
  { value: 'available', label: '可用' },
  { value: 'maintenance', label: '维护中' },
  { value: 'unavailable', label: '不可用' }
]

// 分页相关
const availableCurrentPage = ref(1)
const unavailableCurrentPage = ref(1)

// 对话框相关
const labDetailVisible = ref(false)
const currentLab = ref<any>(null)
const reservationDialogVisible = ref(false)
const selectedLab = ref<any>(null)
const reservationForm = ref({
  lab_id: null,
  date: '',
  start_time: '',
  end_time: '',
  purpose: ''
})

// 计算属性
const availableLabs = computed(() => {
  return filteredLabs.value.filter(lab => lab.status === 'available')
})

const unavailableLabs = computed(() => {
  return filteredLabs.value.filter(lab => lab.status !== 'available')
})

const paginatedAvailableLabs = computed(() => {
  const start = (availableCurrentPage.value - 1) * 8
  const end = start + 8
  return availableLabs.value.slice(start, end)
})

const paginatedUnavailableLabs = computed(() => {
  const start = (unavailableCurrentPage.value - 1) * 8
  const end = start + 8
  return unavailableLabs.value.slice(start, end)
})

const filteredLabs = computed(() => {
  if (!laboratories.value || !Array.isArray(laboratories.value)) return [];

  return laboratories.value.filter(lab => {
    const matchesSearch = lab?.lab_name?.includes(searchQuery.value) ||
        lab?.location?.includes(searchQuery.value) ||
        lab?.description?.includes(searchQuery.value);
    const matchesStatus = statusFilter.value ? lab?.status === statusFilter.value : true;
    return matchesSearch && matchesStatus;
  });
});

// 方法定义
const showLabDetail = (lab: any) => {
  currentLab.value = lab
  labDetailVisible.value = true
}

const showReservationDialog = (lab: any) => {
  selectedLab.value = lab
  reservationForm.value.lab_id = lab.lab_id
  reservationForm.value.date = ''
  reservationForm.value.start_time = ''
  reservationForm.value.end_time = ''
  reservationForm.value.purpose = ''
  reservationDialogVisible.value = true
}

const handleSearch = () => {
  availableCurrentPage.value = 1
  unavailableCurrentPage.value = 1
}

const handleSearchClear = () => {
  searchQuery.value = ''
  availableCurrentPage.value = 1
  unavailableCurrentPage.value = 1
}

const handleFilterChange = () => {
  availableCurrentPage.value = 1
  unavailableCurrentPage.value = 1
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case 'available': return 'success'
    case 'maintenance': return 'warning'
    case 'unavailable': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return '可用'
    case 'maintenance': return '维护中'
    case 'unavailable': return '不可用'
    default: return status
  }
}

const reservationRules = {
  date: [
    { required: true, message: '请选择预约日期', trigger: 'change' }
  ],
  start_time: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (reservationForm.value.start_time && value) {
          const start = new Date(`${reservationForm.value.date} ${reservationForm.value.start_time}`);
          const end = new Date(`${reservationForm.value.date} ${value}`);
          if (end <= start) {
            callback(new Error('结束时间必须晚于开始时间'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  purpose: [
    { required: true, message: '请输入预约用途', trigger: 'blur' },
    { min: 5, message: '预约用途至少5个字符', trigger: 'blur' }
  ]
};

// 禁用过去日期和周末
const disabledDate = (time: Date) => {
  return (
      time.getTime() < Date.now() - 24 * 60 * 60 * 1000 || // 禁用过去日期
      [0, 6].includes(time.getDay()) // 禁用周末
  );
};

// 处理日期变化时重置时间
const handleDateChange = (date: string) => {
  reservationForm.value.start_time = '';
  reservationForm.value.end_time = '';
};

const submitReservation = async () => {
  const userId = JSON.parse(JSON.stringify(userStore.user)).id;
  try {
    console.log('原始日期:', reservationForm.value.date);
    console.log('原始开始时间:', reservationForm.value.start_time);
    console.log('原始结束时间:', reservationForm.value.end_time);
    // 构造正确的时间字符串格式 (YYYY-MM-DD HH:mm)
    const datePart = reservationForm.value.date.toString().split('T')[0]; // 获取日期部分
    const startTimeStr = `${datePart} ${reservationForm.value.start_time}`;
    const endTimeStr = `${datePart} ${reservationForm.value.end_time}`;

    // 转换为Date对象
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    // 验证时间是否有效
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error('时间格式不正确');
    }

    console.log("开始时间为:", startTime);
    console.log("结束时间为:", endTime);
    // 构造预约数据
    const reservationData = {
      laboratory: {
        labId: selectedLab.value.lab_id
      },
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      purpose: reservationForm.value.purpose,
      userId: userId
    };

    // 调用API
    const response = await createReservation(reservationData, userId);

    // 更新本地数据
    reservations.value.unshift({
      user_id: userId,
      lab_id: selectedLab.value.lab_id,
      lab_name: selectedLab.value.lab_name,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      purpose: reservationData.purpose,
      status: 'pending'
    });

    ElMessage.success('预约提交成功，等待审核');
    reservationDialogVisible.value = false;
  } catch (error) {
    console.error('预约提交失败:', error);
    ElMessage.error('预约提交失败');
  }
};

const formatReservationTime = (reservation: any) => {
  const start = new Date(reservation.start_time).toLocaleString()
  const end = new Date(reservation.end_time).toLocaleTimeString()
  return `${start} - ${end}`
}

// 返回按钮功能
const goBack = () => {
  router.back()
}

// 初始化数据
onMounted(async () => {
  try {
    const labsResponse = await getLaboratories();
    laboratories.value = labsResponse;

    const userId = JSON.parse(JSON.stringify(userStore.user)).id;
    const resResponse = await getReservations(userId);
    reservations.value = resResponse;

    console.log('实验室数据:', laboratories.value);
    console.log('预约数据:', reservations.value);
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  }
});
</script>

<style scoped lang="scss">
.lab-reservation {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 50%, #fcfaff 100%);
  position: relative;
  overflow-x: hidden;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 70px;
  background: linear-gradient(90deg, #8b5cf6, #c084fc);
  color: white;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
  position: relative;
  overflow: hidden;
  z-index: 10;
}

.reservation-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.reservation-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.reservation-header h1 i {
  margin-right: 12px;
  font-size: 26px;
}

.user-info {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
}

.el-dropdown-link .el-avatar {
  margin-right: 8px;
}

.reservation-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.search-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 0 10px;

  .search-input {
    flex: 1;
    max-width: 400px;
    
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(192, 132, 252, 0.3);
      box-shadow: 0 2px 6px rgba(192, 132, 252, 0.1);
      transition: all 0.3s ease;
      
      &:hover, &.is-focus {
        border-color: #a855f7;
        box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.2);
      }
    }
    
    :deep(.el-input__inner) {
      color: #6d28d9;
    }
  }

  .status-select {
    width: 180px;
    
    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(192, 132, 252, 0.3);
      box-shadow: 0 2px 6px rgba(192, 132, 252, 0.1);
      
      &:hover, &.is-focus {
        border-color: #a855f7;
        box-shadow: 0 0 0 1px rgba(168, 85, 247, 0.2);
      }
    }
  }
}

.lab-section {
  margin-bottom: 30px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(139, 92, 246, 0.15);
  }

  &.available-labs {
    border-top: 4px solid #8b5cf6;
  }

  &.unavailable-labs {
    border-top: 4px solid #d8b4fe;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(192, 132, 252, 0.2);

  h2 {
    margin: 0;
    font-size: 20px;
    color: #6d28d9;
    display: flex;
    align-items: center;
    font-weight: 600;

    i {
      margin-right: 10px;
    }
  }

  .section-count {
    color: #8b5cf6;
    font-size: 14px;
    font-weight: 500;
    background: rgba(192, 132, 252, 0.1);
    padding: 4px 10px;
    border-radius: 20px;
  }
}

.lab-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .lab-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .lab-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .lab-cards {
    grid-template-columns: 1fr;
  }
}

/* 卡片样式微调 */
.lab-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  
  :deep(.el-card__header) {
    background: rgba(243, 232, 255, 0.5);
    padding: 16px;
    border-bottom: 1px solid rgba(192, 132, 252, 0.2);
  }
  
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15) !important;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    color: #6d28d9;
    font-size: 16px;
    font-weight: 600;
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-actions {
  margin-top: auto;
  padding-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  
  :deep(.el-button--primary) {
    background-color: #8b5cf6;
    border-color: #8b5cf6;
    
    &:hover, &:focus {
      background-color: #a855f7;
      border-color: #a855f7;
    }
  }
  
  :deep(.el-button--info) {
    background-color: #d8b4fe;
    border-color: #d8b4fe;
    color: #6d28d9;
    
    &:hover, &:focus {
      background-color: #e9d5ff;
      border-color: #e9d5ff;
    }
  }
}

.lab-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #6d28d9;
}

.lab-info i {
  margin-right: 5px;
  color: #8b5cf6;
}

.section-pagination {
  margin-top: 15px;
  justify-content: center;
  
  :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
    background-color: #8b5cf6;
  }
  
  :deep(.el-pagination.is-background .el-pager li) {
    background-color: rgba(255, 255, 255, 0.8);
    
    &:hover {
      color: #8b5cf6;
    }
  }
}

/* 图标样式 */
[class^="icon-"] {
  font-style: normal;
}

.icon-lab:before { content: "🧪"; }
.icon-location:before { content: "📍"; }
.icon-capacity:before { content: "👥"; }
.icon-desc:before { content: "📝"; }
.icon-available:before { content: "✅"; }
.icon-unavailable:before { content: "⛔"; }

/* 响应式设计 */
@media (max-width: 768px) {
  .lab-cards {
    grid-template-columns: 1fr;
  }

  .search-filter {
    flex-direction: column;

    .search-input, .status-select {
      width: 100%;
      max-width: 100%;
    }
  }
}

/* 添加预约记录部分的样式 */
.reservation-records {
  margin-bottom: 30px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
  padding: 24px;
  backdrop-filter: blur(10px);
  border-top: 4px solid #a855f7;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(139, 92, 246, 0.15);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(192, 132, 252, 0.2);

    h2 {
      margin: 0;
      font-size: 20px;
      color: #6d28d9;
      display: flex;
      align-items: center;

      i {
        margin-right: 10px;
      }
    }
  }
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
  
  .el-dialog__header {
    background: linear-gradient(90deg, #8b5cf6, #c084fc);
    padding: 16px 20px;
    
    .el-dialog__title {
      color: white;
      font-weight: 600;
    }
    
    .el-dialog__headerbtn .el-dialog__close {
      color: rgba(255, 255, 255, 0.9);
      
      &:hover {
        color: white;
      }
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    border-top: 1px solid rgba(192, 132, 252, 0.2);
    padding: 16px 20px;
  }
}

/* 添加背景装饰 */
.reservation-container::before {
  content: '';
  position: absolute;
  top: 10%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, rgba(192, 132, 252, 0) 70%);
  border-radius: 50%;
  z-index: -1;
  animation: float 15s infinite ease-in-out;
}

.reservation-container::after {
  content: '';
  position: absolute;
  bottom: 5%;
  left: -5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 70%);
  border-radius: 50%;
  z-index: -1;
  animation: float 20s infinite ease-in-out reverse;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, -30px);
  }
}

.header-left {
  display: flex;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 16px;
  box-shadow: 
    0 2px 5px rgba(0, 0, 0, 0.05),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-3px);
}

.back-icon {
  margin-right: 6px;
  font-style: normal;
}
</style>
