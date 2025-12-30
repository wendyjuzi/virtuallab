<template>
  <div class="student-class-select">
    <h2>我的班级</h2>
    <el-table :data="myClassDetails" style="margin-bottom: 24px;">
      <el-table-column prop="name" label="班级" />
      <el-table-column prop="department" label="院系" />
      <el-table-column prop="major" label="专业" />
      <el-table-column prop="grade" label="年级" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="danger" size="small" @click="quitClass(scope.row.id)">退出</el-button>
        </template>
      </el-table-column>
    </el-table>

    <h2>加入新班级</h2>
    <!-- 移除studentId输入框 -->
    <el-select v-model="selectedClassId" placeholder="请选择班级" filterable style="width: 300px;">
      <el-option
        v-for="item in availableClassList"
        :key="item.id"
        :label="item.department ? `${item.name}（${item.department}）` : item.name"
        :value="item.id"
      />
    </el-select>
    <el-button type="primary" @click="joinClass">加入</el-button>
   
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
// 新增studentId输入框
const studentId = computed(() => userStore.user?.studentId || userStore.user?.id)

const myClassDetails = ref<any[]>([])
const allClassList = ref<any[]>([])
const selectedClassId = ref<string | number>('')

// 获取所有班级
async function fetchAllClasses() {
  const res = await axios.get('/student/class/all')
  allClassList.value = Array.isArray(res.data.classList) ? res.data.classList : []
  if (!Array.isArray(allClassList.value)) allClassList.value = []
}

// 获取自己已选班级详细信息
async function fetchMyClassDetails() {
  if (!studentId.value) return
  const res = await axios.get('/student/class/details', { params: { studentId: studentId.value } })
  if (res.data.code === 200) {
    myClassDetails.value = res.data.classDetails || []
  } else {
    myClassDetails.value = []
  }
}

// 过滤出未加入的班级
const availableClassList = computed(() => {
  if (!Array.isArray(allClassList.value)) return []
  const joinedIds = Array.isArray(myClassDetails.value) ? myClassDetails.value.map(c => c.id) : []
  return allClassList.value.filter(c => !joinedIds.includes(c.id))
})

// 加入班级
async function joinClass() {
  if (!selectedClassId.value || !studentId.value) return
  console.log('join params:', { studentId: studentId.value, classId: selectedClassId.value })
  const res = await axios.post('/student/class/select', {
    studentId: studentId.value,
    classId: selectedClassId.value
  })
  console.log('join result:', res.data)
  if (res.data.code === 200) {
    ElMessage.success(res.data.msg)
    await fetchMyClassDetails()
    selectedClassId.value = ''
  } else {
    ElMessage.error(res.data.msg)
  }
}

// 退出班级
async function quitClass(classId: string | number) {
  if (!studentId.value) return
  const res = await axios.post('/student/class/quit', {
    studentId: studentId.value,
    classId: classId
  })
  if (res.data.code === 200) {
    ElMessage.success(res.data.msg)
    await fetchMyClassDetails()
  } else {
    ElMessage.error(res.data.msg)
  }
}

onMounted(() => {
  fetchAllClasses()
})

watch(studentId, (val) => {
  if (val) fetchMyClassDetails()
}, { immediate: true })
</script>

<style scoped>
.student-class-select {
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 0;
}
</style> 