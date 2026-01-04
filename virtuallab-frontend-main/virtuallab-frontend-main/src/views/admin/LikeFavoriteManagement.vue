<template>
  <div class="like-favorite-management-bg">
    <div class="frosted-wrapper">
      <div class="page-header">
        <h1>点赞收藏管理</h1>
        <p>管理系统内所有用户的点赞和收藏数据</p>
        <el-alert
          title="管理员功能"
          description="管理系统内所有用户的点赞和收藏数据，包括统计、记录管理和数据导出功能。"
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 16px;"
        />
        <!-- 测试按钮 -->
        <div style="margin-top: 16px;">
          <el-button type="primary" @click="testApiConnection" :loading="testLoading">
            测试接口连接
          </el-button>
          <el-button type="success" @click="loadMockData" v-if="!hasRealData">
            加载模拟数据
          </el-button>
          <el-button type="info" @click="showDataStatus">
            查看数据状态
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon like-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalLikes }}</div>
              <div class="stat-label">总点赞数</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon favorite-icon">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalFavorites }}</div>
              <div class="stat-label">总收藏数</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">活跃用户数</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon resource-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalResources }}</div>
              <div class="stat-label">被交互资源数</div>
            </div>
          </div>
        </el-card>
      </div>

      <el-tabs v-model="activeTab" class="content-tabs">
        <!-- 用户统计 -->
        <el-tab-pane label="用户统计" name="stats">
          <div class="tab-header">
            <div class="search-filters">
              <el-input
                v-model="userSearch"
                placeholder="搜索用户名..."
                style="width: 200px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select v-model="userSortBy" placeholder="排序方式" style="width: 150px">
                <el-option label="点赞数" value="likeCount" />
                <el-option label="收藏数" value="favoriteCount" />
                <el-option label="总交互数" value="totalInteractions" />
              </el-select>
              <el-button @click="refreshUserStats" :loading="statsLoading">刷新</el-button>
              <el-button type="success" @click="exportData">导出数据</el-button>
            </div>
          </div>
          
          <el-table 
            :data="filteredUserStats" 
            style="width: 100%" 
            v-loading="statsLoading"
            @selection-change="handleUserSelectionChange"
            :empty-text="userStats.length === 0 ? '暂无数据' : '搜索无结果'"
            :key="userStats.length"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="userId" label="用户ID" width="100" />
            <el-table-column prop="username" label="用户名" width="180" />
            <el-table-column prop="likeCount" label="点赞数" width="120" sortable />
            <el-table-column prop="favoriteCount" label="收藏数" width="120" sortable />
            <el-table-column label="总交互数" width="120">
              <template #default="{ row }">
                {{ row.likeCount + row.favoriteCount }}
              </template>
            </el-table-column>
            <el-table-column prop="lastActivity" label="最后活动" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="viewUserDetails(row)">查看详情</el-button>
                <el-button size="small" type="warning" @click="resetUserStats(row)">重置统计</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 点赞记录 -->
        <el-tab-pane label="点赞记录" name="likes">
          <div class="tab-header">
            <div class="search-filters">
              <el-input
                v-model="likeSearch"
                placeholder="搜索用户ID或资源ID..."
                style="width: 250px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-date-picker
                v-model="likeDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 300px"
              />
              <el-button @click="refreshLikes" :loading="likeLoading">刷新</el-button>
            </div>
            <div class="batch-actions" v-if="selectedLikeRecords.length > 0">
              <el-button type="danger" @click="batchDeleteLikes">批量删除</el-button>
            </div>
          </div>

          <el-table 
            :data="filteredLikeRecords" 
            style="width: 100%" 
            v-loading="likeLoading"
            @selection-change="handleLikeSelectionChange"
            :empty-text="likeRecords.length === 0 ? '暂无数据' : '搜索无结果'"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="userId" label="用户ID" width="100" />
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="resourceId" label="资源ID" width="100" />
            <el-table-column prop="resourceName" label="资源名称" width="200" />
            <el-table-column prop="createTime" label="点赞时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewLikeDetail(row)">查看详情</el-button>
                <el-button size="small" type="danger" @click="deleteLikeRecord(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="likePage"
            v-model:page-size="likeSize"
            :total="likeTotal"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleLikeSizeChange"
            @current-change="handleLikeCurrentChange"
            class="pagination"
          />
        </el-tab-pane>

        <!-- 收藏记录 -->
        <el-tab-pane label="收藏记录" name="favorites">
          <div class="tab-header">
            <div class="search-filters">
              <el-input
                v-model="favoriteSearch"
                placeholder="搜索用户ID或资源ID..."
                style="width: 250px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-date-picker
                v-model="favoriteDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 300px"
              />
              <el-button @click="refreshFavorites" :loading="favoriteLoading">刷新</el-button>
            </div>
            <div class="batch-actions" v-if="selectedFavoriteRecords.length > 0">
              <el-button type="danger" @click="batchDeleteFavorites">批量删除</el-button>
            </div>
          </div>

          <el-table 
            :data="filteredFavoriteRecords" 
            style="width: 100%" 
            v-loading="favoriteLoading"
            @selection-change="handleFavoriteSelectionChange"
            :empty-text="favoriteRecords.length === 0 ? '暂无数据' : '搜索无结果'"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="userId" label="用户ID" width="100" />
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="resourceId" label="资源ID" width="100" />
            <el-table-column prop="resourceName" label="资源名称" width="200" />
            <el-table-column prop="createTime" label="收藏时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewFavoriteDetail(row)">查看详情</el-button>
                <el-button size="small" type="danger" @click="deleteFavoriteRecord(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="favoritePage"
            v-model:page-size="favoriteSize"
            :total="favoriteTotal"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleFavoriteSizeChange"
            @current-change="handleFavoriteCurrentChange"
            class="pagination"
          />
        </el-tab-pane>

        <!-- 资源统计 -->
        <el-tab-pane label="资源统计" name="resources">
          <div class="tab-header">
            <div class="search-filters">
              <el-input
                v-model="resourceSearch"
                placeholder="搜索资源名称..."
                style="width: 250px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select v-model="resourceSortBy" placeholder="排序方式" style="width: 150px">
                <el-option label="点赞数" value="likeCount" />
                <el-option label="收藏数" value="favoriteCount" />
                <el-option label="总交互数" value="totalInteractions" />
              </el-select>
              <el-button @click="refreshResourceStats" :loading="resourceStatsLoading">刷新</el-button>
            </div>
          </div>

          <el-table 
            :data="filteredResourceStats" 
            style="width: 100%" 
            v-loading="resourceStatsLoading"
            :empty-text="resourceStats.length === 0 ? '暂无数据' : '搜索无结果'"
            :key="resourceStats.length"
          >
            <el-table-column prop="resourceId" label="资源ID" width="100" />
            <el-table-column prop="resourceName" label="资源名称" width="200" />
            <el-table-column prop="likeCount" label="点赞数" width="120" sortable />
            <el-table-column prop="favoriteCount" label="收藏数" width="120" sortable />
            <el-table-column label="总交互数" width="120">
              <template #default="{ row }">
                {{ row.likeCount + row.favoriteCount }}
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewResourceDetails(row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 详情对话框 -->
      <el-dialog v-model="detailDialogVisible" title="详细信息" width="600px">
        <div v-if="currentDetail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户ID">{{ currentDetail.userId }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ currentDetail.username }}</el-descriptions-item>
            <el-descriptions-item label="资源ID">{{ currentDetail.resourceId }}</el-descriptions-item>
            <el-descriptions-item label="资源名称">{{ currentDetail.resourceName }}</el-descriptions-item>
            <el-descriptions-item label="操作时间">{{ currentDetail.createTime }}</el-descriptions-item>
            <el-descriptions-item label="操作类型">{{ currentDetail.type }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Star, Collection, User, Document, Search, 
  Delete, View, Refresh, Warning 
} from '@element-plus/icons-vue'
import * as likeFavoriteApi from '@/api/likeFavorite'

// 响应式数据
const activeTab = ref('stats')
const stats = ref({ 
  totalLikes: 0, 
  totalFavorites: 0, 
  totalUsers: 0, 
  totalResources: 0 
})

// 用户统计
const userStats = ref<any[]>([])
const statsLoading = ref(false)
const userSearch = ref('')
const userSortBy = ref('totalInteractions')

// 点赞记录
const likeRecords = ref<any[]>([])
const likeLoading = ref(false)
const likePage = ref(1)
const likeSize = ref(20)
const likeTotal = ref(0)
const likeSearch = ref('')
const likeDateRange = ref<[Date, Date] | null>(null)
const selectedLikeRecords = ref<any[]>([])

// 收藏记录
const favoriteRecords = ref<any[]>([])
const favoriteLoading = ref(false)
const favoritePage = ref(1)
const favoriteSize = ref(20)
const favoriteTotal = ref(0)
const favoriteSearch = ref('')
const favoriteDateRange = ref<[Date, Date] | null>(null)
const selectedFavoriteRecords = ref<any[]>([])

// 资源统计
const resourceStats = ref<any[]>([])
const resourceStatsLoading = ref(false)
const resourceSearch = ref('')
const resourceSortBy = ref('totalInteractions')

// 详情对话框
const detailDialogVisible = ref(false)
const currentDetail = ref<any>(null)

// 测试相关
const testLoading = ref(false)
const hasRealData = ref(true) // 假设有真实数据

// 计算属性 - 过滤后的数据
const filteredUserStats = computed(() => {
  let filtered = userStats.value
  console.log('filteredUserStats - 原始数据:', userStats.value)
  
  if (userSearch.value) {
    filtered = filtered.filter(user => 
      user.username?.toLowerCase().includes(userSearch.value.toLowerCase())
    )
  }
  
  // 排序
  filtered = [...filtered].sort((a, b) => {
    const aValue = a[userSortBy.value] || 0
    const bValue = b[userSortBy.value] || 0
    return bValue - aValue
  })
  
  console.log('filteredUserStats - 过滤后数据:', filtered)
  return filtered
})

const filteredLikeRecords = computed(() => {
  let filtered = likeRecords.value
  
  if (likeSearch.value) {
    filtered = filtered.filter(record => 
      record.userId?.toString().includes(likeSearch.value) ||
      record.resourceId?.toString().includes(likeSearch.value) ||
      record.username?.toLowerCase().includes(likeSearch.value.toLowerCase())
    )
  }
  
  if (likeDateRange.value) {
    const [start, end] = likeDateRange.value
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.createTime)
      return recordDate >= start && recordDate <= end
    })
  }
  
  return filtered
})

const filteredFavoriteRecords = computed(() => {
  let filtered = favoriteRecords.value
  
  if (favoriteSearch.value) {
    filtered = filtered.filter(record => 
      record.userId?.toString().includes(favoriteSearch.value) ||
      record.resourceId?.toString().includes(favoriteSearch.value) ||
      record.username?.toLowerCase().includes(favoriteSearch.value.toLowerCase())
    )
  }
  
  if (favoriteDateRange.value) {
    const [start, end] = favoriteDateRange.value
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.createTime)
      return recordDate >= start && recordDate <= end
    })
  }
  
  return filtered
})

const filteredResourceStats = computed(() => {
  let filtered = resourceStats.value
  console.log('filteredResourceStats - 原始数据:', resourceStats.value)
  
  if (resourceSearch.value) {
    filtered = filtered.filter(resource => 
      resource.resourceName?.toLowerCase().includes(resourceSearch.value.toLowerCase())
    )
  }
  
  // 排序
  filtered = [...filtered].sort((a, b) => {
    const aValue = a[resourceSortBy.value] || 0
    const bValue = b[resourceSortBy.value] || 0
    return bValue - aValue
  })
  
  console.log('filteredResourceStats - 过滤后数据:', filtered)
  return filtered
})

// 获取统计数据
const fetchStats = async () => {
  statsLoading.value = true
  try {
    const res = await likeFavoriteApi.getAllUsersLikeFavoriteStats() as any
    // 响应拦截器返回的是CommonResult对象，需要提取data字段
    console.log('统计数据原始响应:', res)
    const data = res?.data
    console.log('提取的data字段:', data)
    userStats.value = data?.topUsers || []
    stats.value = {
      totalLikes: data?.totalLikes || 0,
      totalFavorites: data?.totalFavorites || 0,
      totalUsers: data?.totalUsers || 0,
      totalResources: data?.totalResources || 0
    }
    console.log('处理后的统计数据:', { userStats: userStats.value, stats: stats.value })
    console.log('用户统计数组详情:', userStats.value)
    hasRealData.value = true
  } catch (error: any) {
    console.error('获取统计数据失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '获取统计数据失败'
    ElMessage.error(errorMsg)
    hasRealData.value = false
    // 设置默认值，避免页面显示错误
    userStats.value = []
    stats.value = {
      totalLikes: 0,
      totalFavorites: 0,
      totalUsers: 0,
      totalResources: 0
    }
  } finally {
    statsLoading.value = false
  }
}

// 获取点赞记录
const fetchLikes = async () => {
  likeLoading.value = true
  try {
    const res = await likeFavoriteApi.getAllLikes(likePage.value, likeSize.value) as any
    // 响应拦截器返回的是CommonResult对象，需要提取data字段
    console.log('点赞记录原始响应:', res)
    const data = res?.data
    likeRecords.value = data?.records || []
    likeTotal.value = data?.total || 0
    console.log('处理后的点赞记录:', { records: likeRecords.value, total: likeTotal.value })
  } catch (error: any) {
    console.error('获取点赞记录失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '获取点赞记录失败'
    ElMessage.error(errorMsg)
    // 设置默认值
    likeRecords.value = []
    likeTotal.value = 0
  } finally {
    likeLoading.value = false
  }
}

// 获取收藏记录
const fetchFavorites = async () => {
  favoriteLoading.value = true
  try {
    const res = await likeFavoriteApi.getAllFavorites(favoritePage.value, favoriteSize.value) as any
    // 响应拦截器返回的是CommonResult对象，需要提取data字段
    const data = res?.data
    favoriteRecords.value = data?.records || []
    favoriteTotal.value = data?.total || 0
  } catch (error: any) {
    console.error('获取收藏记录失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '获取收藏记录失败'
    ElMessage.error(errorMsg)
    // 设置默认值
    favoriteRecords.value = []
    favoriteTotal.value = 0
  } finally {
    favoriteLoading.value = false
  }
}

// 获取资源统计
const fetchResourceStats = async () => {
  resourceStatsLoading.value = true
  try {
    const res = await likeFavoriteApi.getResourceLikeFavoriteStats() as any
    // 响应拦截器返回的是CommonResult对象，需要提取data字段
    console.log('资源统计原始响应:', res)
    const data = res?.data
    console.log('资源统计data字段:', data)
    resourceStats.value = data?.topResources || []
    console.log('处理后的资源统计:', resourceStats.value)
  } catch (error: any) {
    console.error('获取资源统计失败:', error)
    const errorMsg = error?.response?.data?.message || error?.message || '获取资源统计失败'
    ElMessage.error(errorMsg)
    // 设置默认值
    resourceStats.value = []
  } finally {
    resourceStatsLoading.value = false
  }
}

// 刷新方法
const refreshUserStats = () => {
  fetchStats()
  // 强制重新计算
  setTimeout(() => {
    console.log('强制刷新后的用户统计:', userStats.value)
  }, 100)
}

const refreshLikes = () => fetchLikes()
const refreshFavorites = () => fetchFavorites()

const refreshResourceStats = () => {
  fetchResourceStats()
  // 强制重新计算
  setTimeout(() => {
    console.log('强制刷新后的资源统计:', resourceStats.value)
  }, 100)
}

// 分页处理
const handleLikeSizeChange = (size: number) => {
  likeSize.value = size
  likePage.value = 1
  fetchLikes()
}

const handleLikeCurrentChange = (page: number) => {
  likePage.value = page
  fetchLikes()
}

const handleFavoriteSizeChange = (size: number) => {
  favoriteSize.value = size
  favoritePage.value = 1
  fetchFavorites()
}

const handleFavoriteCurrentChange = (page: number) => {
  favoritePage.value = page
  fetchFavorites()
}

// 选择处理
const handleUserSelectionChange = (selection: any[]) => {
  // 用户统计暂不支持批量操作
}

const handleLikeSelectionChange = (selection: any[]) => {
  selectedLikeRecords.value = selection
}

const handleFavoriteSelectionChange = (selection: any[]) => {
  selectedFavoriteRecords.value = selection
}

// 查看详情
const viewUserDetails = (user: any) => {
  currentDetail.value = {
    ...user,
    type: '用户统计'
  }
  detailDialogVisible.value = true
}

const viewLikeDetail = (record: any) => {
  currentDetail.value = {
    ...record,
    type: '点赞记录'
  }
  detailDialogVisible.value = true
}

const viewFavoriteDetail = (record: any) => {
  currentDetail.value = {
    ...record,
    type: '收藏记录'
  }
  detailDialogVisible.value = true
}

const viewResourceDetails = (resource: any) => {
  currentDetail.value = {
    ...resource,
    type: '资源统计'
  }
  detailDialogVisible.value = true
}

// 删除操作
const deleteLikeRecord = async (record: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${record.username} 对资源 ${record.resourceId} 的点赞记录吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await likeFavoriteApi.adminDeleteLike(record.id)
    ElMessage.success('删除成功')
    fetchLikes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const deleteFavoriteRecord = async (record: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${record.username} 对资源 ${record.resourceId} 的收藏记录吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await likeFavoriteApi.adminDeleteFavorite(record.id)
    ElMessage.success('删除成功')
    fetchFavorites()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const batchDeleteLikes = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入删除原因（可选）',
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '删除原因...',
        inputValidator: (value) => {
          return true // 允许空值
        }
      }
    )
    
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedLikeRecords.value.length} 条点赞记录吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const likeIds = selectedLikeRecords.value.map(record => record.id)
    await likeFavoriteApi.adminBatchDeleteLikes(likeIds, reason)
    
    ElMessage.success('批量删除成功')
    selectedLikeRecords.value = []
    fetchLikes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const batchDeleteFavorites = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入删除原因（可选）',
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '删除原因...',
        inputValidator: (value) => {
          return true // 允许空值
        }
      }
    )
    
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFavoriteRecords.value.length} 条收藏记录吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const favoriteIds = selectedFavoriteRecords.value.map(record => record.id)
    await likeFavoriteApi.adminBatchDeleteFavorites(favoriteIds, reason)
    
    ElMessage.success('批量删除成功')
    selectedFavoriteRecords.value = []
    fetchFavorites()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 重置用户统计
const resetUserStats = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 ${user.username} 的点赞收藏统计吗？`,
      '重置统计',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await likeFavoriteApi.adminResetUserStats(user.userId)
    ElMessage.success('重置成功')
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置失败')
    }
  }
}

// 导出数据
const exportData = async () => {
  try {
    const format = 'excel' // 简化导出，直接使用excel格式
    
    const response = await likeFavoriteApi.exportLikeFavoriteData(format as 'excel' | 'csv') as any
    
    // 创建下载链接
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `点赞收藏数据_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 测试接口连接
const testApiConnection = async () => {
  testLoading.value = true
  try {
    // 测试统计数据接口
    await likeFavoriteApi.getAllUsersLikeFavoriteStats()
    ElMessage.success('接口连接成功！后端服务正常运行。')
    hasRealData.value = true
  } catch (error) {
    console.error('接口连接失败:', error)
    ElMessage.error('接口连接失败，请检查后端服务。')
    hasRealData.value = false
  } finally {
    testLoading.value = false
  }
}

// 加载模拟数据
const loadMockData = () => {
  userStats.value = [
    { userId: 'mock1', username: '模拟用户1', likeCount: 10, favoriteCount: 5, totalInteractions: 15, lastActivity: '2023-10-26 10:00' },
    { userId: 'mock2', username: '模拟用户2', likeCount: 20, favoriteCount: 10, totalInteractions: 30, lastActivity: '2023-10-26 11:00' },
    { userId: 'mock3', username: '模拟用户3', likeCount: 5, favoriteCount: 2, totalInteractions: 7, lastActivity: '2023-10-26 12:00' },
  ]
  stats.value = {
    totalLikes: 35,
    totalFavorites: 17,
    totalUsers: 3,
    totalResources: 0
  }
  likeRecords.value = [
    { id: 1, userId: 'mock1', username: '模拟用户1', resourceId: 'mockRes1', resourceName: '模拟资源1', createTime: '2023-10-26 10:05' },
    { id: 2, userId: 'mock2', username: '模拟用户2', resourceId: 'mockRes2', resourceName: '模拟资源2', createTime: '2023-10-26 10:10' },
    { id: 3, userId: 'mock1', username: '模拟用户1', resourceId: 'mockRes1', resourceName: '模拟资源1', createTime: '2023-10-26 10:15' },
  ]
  likeTotal.value = 3
  favoriteRecords.value = [
    { id: 1, userId: 'mock1', username: '模拟用户1', resourceId: 'mockRes1', resourceName: '模拟资源1', createTime: '2023-10-26 10:05' },
    { id: 2, userId: 'mock2', username: '模拟用户2', resourceId: 'mockRes2', resourceName: '模拟资源2', createTime: '2023-10-26 10:10' },
    { id: 3, userId: 'mock1', username: '模拟用户1', resourceId: 'mockRes1', resourceName: '模拟资源1', createTime: '2023-10-26 10:15' },
  ]
  favoriteTotal.value = 3
  resourceStats.value = [
    { resourceId: 'mockRes1', resourceName: '模拟资源1', likeCount: 10, favoriteCount: 5, totalInteractions: 15, category: '分类A' },
    { resourceId: 'mockRes2', resourceName: '模拟资源2', likeCount: 15, favoriteCount: 10, totalInteractions: 25, category: '分类B' },
    { resourceId: 'mockRes3', resourceName: '模拟资源3', likeCount: 5, favoriteCount: 2, totalInteractions: 7, category: '分类A' },
  ]
  hasRealData.value = false
  ElMessage.success('模拟数据加载成功！')
}

// 查看数据状态
const showDataStatus = () => {
  const status = {
    统计数据: {
      总点赞数: stats.value.totalLikes,
      总收藏数: stats.value.totalFavorites,
      总用户数: stats.value.totalUsers,
      总资源数: stats.value.totalResources,
      用户统计记录数: userStats.value.length
    },
    点赞记录: {
      记录数: likeRecords.value.length,
      总数: likeTotal.value,
      当前页: likePage.value,
      每页大小: likeSize.value
    },
    收藏记录: {
      记录数: favoriteRecords.value.length,
      总数: favoriteTotal.value,
      当前页: favoritePage.value,
      每页大小: favoriteSize.value
    },
    资源统计: {
      记录数: resourceStats.value.length
    }
  }
  console.log('当前数据状态:', status)
  ElMessage.info('数据状态已输出到控制台，请查看浏览器开发者工具')
}

// 组件挂载时加载数据
onMounted(async () => {
  try {
    // 并行加载所有数据，即使某个失败也不影响其他
    await Promise.allSettled([
      fetchStats().catch(err => console.error('fetchStats 失败:', err)),
      fetchLikes().catch(err => console.error('fetchLikes 失败:', err)),
      fetchFavorites().catch(err => console.error('fetchFavorites 失败:', err)),
      fetchResourceStats().catch(err => console.error('fetchResourceStats 失败:', err))
    ])
  } catch (error) {
    console.error('初始化数据加载失败:', error)
  }
})
</script>

<style scoped>
.like-favorite-management-bg {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin-top:-22px;
  
  margin-right:-22px;
}
.frosted-wrapper {
  background: rgba(236, 236, 255, 0.92);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 32px;
  max-width: 1500px;
  width: 96vw;
  margin: 40px auto 0 auto;
  padding: 36px 32px 32px 32px;
  backdrop-filter: blur(12px);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.page-header {
  text-align: center;
  margin-bottom: 32px;
  width: 100%;
}
.page-header h1 {
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin-bottom: 8px;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
}
.page-header p {
  color: #7C3AED;
  font-size: 18px;
  font-weight: 500;
}
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  width: 100%;
}
.stat-card {
  border-radius: 18px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(8px);
  transition: transform 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-2px) scale(1.03);
}
.stat-content {
  display: flex;
  align-items: center;
  padding: 24px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
}
.like-icon {
  background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
}
.favorite-icon {
  background: linear-gradient(135deg, #ffc107 0%, #f39c12 100%);
}
.user-icon {
  background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
}
.resource-icon {
  background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
}
.stat-info {
  flex: 1;
}
.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #7C3AED;
  margin-bottom: 8px;
}
.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}
.content-tabs {
  background: rgba(236, 236, 255, 0.92);
  border-radius: 18px;
  box-shadow: 0 4px 16px #a18fff22, 0 2px 8px #7c3aed11;
  margin-top: 24px;
}
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}
.search-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}
.batch-actions {
  display: flex;
  gap: 8px;
}
.pagination {
  margin: 16px 0;
  text-align: right;
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
.el-button[type="success"] {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px #43e97b44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-button[type="success"]:hover {
  background: linear-gradient(90deg, #38f9d7 0%, #43e97b 100%);
  box-shadow: 0 6px 24px #43e97b55;
  transform: scale(1.04);
}
.el-button[type="info"] {
  background: linear-gradient(90deg, #a18fff 0%, #ececff 100%);
  color: #7C3AED;
  border-radius: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px #a18fff22;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-button[type="info"]:hover {
  background: linear-gradient(90deg, #ececff 0%, #a18fff 100%);
  box-shadow: 0 6px 24px #a18fff33;
  transform: scale(1.04);
}
.el-table th {
  background: linear-gradient(90deg, #ececff 0%, #a18fff 100%);
  color: #7C3AED;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
}
.el-table tr {
  transition: background 0.2s;
}
.el-table tr:hover {
  background: #f3f0ff !important;
}
@media (max-width: 900px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .tab-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  .search-filters {
    flex-wrap: wrap;
  }
  .page-header h1 {
    font-size: 22px;
  }
}
@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
