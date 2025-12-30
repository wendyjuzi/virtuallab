<template>
  <div class="experiment-report-template-manage-bg">
    <div class="frosted-wrapper">
      <!-- 实验项目筛选与选择 -->
      <el-card class="mb-3">
        <div class="gradient-title" style="margin-bottom: 18px;">实验报告模板管理</div>
        <el-form :inline="true" :model="projectQuery" class="mb-2">
          <el-form-item label="类别">
            <el-input v-model="projectQuery.category" placeholder="实验类别" clearable style="width: 120px;" />
          </el-form-item>
          <el-form-item label="级别">
            <el-input v-model="projectQuery.level" placeholder="实验级别" clearable style="width: 120px;" />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="projectQuery.keyword" placeholder="名称/描述" clearable style="width: 180px;" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onProjectSearch">搜索</el-button>
          </el-form-item>
        </el-form>
        <div style="display: flex; align-items: center; gap: 16px;">
          <el-select v-model="selectedProjectId" filterable placeholder="请选择实验项目" style="width: 300px;" @change="onProjectChange">
            <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-pagination
            background
            layout="prev, pager, next"
            :total="projectTotal"
            :page-size="projectPageSize"
            :current-page="projectPage"
            @current-change="onProjectPageChange"
          />
        </div>
        <div v-if="projectDetail" class="mt-2">
          <el-descriptions title="实验项目信息" :column="2" border>
            <el-descriptions-item label="名称">{{ projectDetail.name }}</el-descriptions-item>
            <el-descriptions-item label="类别">{{ projectDetail.category }}</el-descriptions-item>
            <el-descriptions-item label="级别">{{ projectDetail.level }}</el-descriptions-item>
            <el-descriptions-item label="创建人">{{ projectDetail.creatorName }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ projectDetail.description }}</el-descriptions-item>
          </el-descriptions>
          <!-- 新增：实验原始数据展示 -->
          <el-card class="mt-2" shadow="never">
            <template #header>实验数据库原始内容</template>
            <pre style="max-height:300px;overflow:auto;background:#f8f8f8;padding:12px;border-radius:4px;">{{ projectDetail && JSON.stringify(projectDetail, null, 2) }}</pre>
          </el-card>
        </div>
      </el-card>

      <!-- 报告模板表格 -->
      <el-card>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-weight: bold;">报告模板列表</span>
          <div>
            <el-button type="primary" @click="onCreateTemplate">新建模板</el-button>
            <el-button @click="onAIGenerate" :disabled="!selectedProjectId">AI生成模板</el-button>
          </div>
        </div>
        <el-table :data="templateList" border stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="模板标题" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="createdAt" label="创建时间" width="160" />
          <el-table-column prop="updatedAt" label="更新时间" width="160" />
          <el-table-column label="操作" width="220">
            <template #default="scope">
              <el-button size="small" @click="onViewTemplate(scope.row)">预览</el-button>
              <el-button size="small" type="primary" @click="onEditTemplate(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="onDeleteTemplate(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 模板编辑/新建/AI生成弹窗 -->
      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="editForm.title" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="editForm.description" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input type="textarea" v-model="editForm.content" :rows="8" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSaveTemplate">保存</el-button>
        </template>
      </el-dialog>

      <!-- 模板预览弹窗 -->
      <el-dialog v-model="viewDialogVisible" title="模板预览" width="600px">
        <div style="white-space: pre-wrap;">{{ viewTemplate?.content }}</div>
        <template #footer>
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import type { Ref } from 'vue'

interface ProjectListItem {
  id: number
  name: string
  category?: string
  level?: string
  creatorName?: string
  description?: string
}

interface TemplateItem {
  id: number
  title: string
  description: string
  content: string
  createdAt: string
  updatedAt: string
}

const projectQuery = reactive({ category: '', level: '', keyword: '' })
const projectList: Ref<ProjectListItem[]> = ref([])
const projectTotal = ref(0)
const projectPage = ref(1)
const projectPageSize = ref(10)
const selectedProjectId = ref<number|null>(null)
const projectDetail = ref<ProjectListItem|null>(null)
const projectLoading = ref(false)

const templateList = ref<TemplateItem[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editForm = reactive({ id: 0, title: '', description: '', content: '' })
const viewDialogVisible = ref(false)
const viewTemplate = ref<TemplateItem|null>(null)

// 分页+条件获取实验项目
const fetchProjectList = async () => {
  projectLoading.value = true
  try {
    const { data } = await axios.get('/experiment/project/query', {
      params: { ...projectQuery, page: projectPage.value, size: projectPageSize.value }
    })
    projectList.value = data?.records || []
    projectTotal.value = data?.total || 0
  } finally {
    projectLoading.value = false
  }
}

// 获取实验项目详情
const fetchProjectDetail = async (id: number) => {
  const { data } = await axios.get(`/experiment/project/${id}`)
  projectDetail.value = data
  fetchTemplateList(id)
}

// 获取报告模板列表
const fetchTemplateList = async (projectId: number) => {
  const { data } = await axios.get(`/experiment/report-template/list`, { params: { projectId } })
  templateList.value = data || []
}

// 搜索实验项目
const onProjectSearch = () => {
  projectPage.value = 1
  fetchProjectList()
}
const onProjectPageChange = (page: number) => {
  projectPage.value = page
  fetchProjectList()
}
const onProjectChange = (id: number) => {
  fetchProjectDetail(id)
}

// 新建模板
const onCreateTemplate = () => {
  dialogTitle.value = '新建报告模板'
  Object.assign(editForm, { id: 0, title: '', description: '', content: '' })
  dialogVisible.value = true
}
// 编辑模板
const onEditTemplate = (row: TemplateItem) => {
  dialogTitle.value = '编辑报告模板'
  Object.assign(editForm, row)
  dialogVisible.value = true
}
// 预览模板
const onViewTemplate = (row: TemplateItem) => {
  viewTemplate.value = row
  viewDialogVisible.value = true
}
// 删除模板
const onDeleteTemplate = (row: TemplateItem) => {
  ElMessageBox.confirm('确定要删除该模板吗？', '提示', { type: 'warning' })
    .then(async () => {
      await axios.delete(`/experiment/report-template/${row.id}`)
      ElMessage.success('删除成功')
      if (selectedProjectId.value) fetchTemplateList(selectedProjectId.value)
    })
}
// 保存模板
const onSaveTemplate = async () => {
  if (!editForm.title || !editForm.content) {
    ElMessage.warning('标题和内容不能为空')
    return
  }
  if (editForm.id) {
    await axios.put(`/experiment/report-template/${editForm.id}`, { ...editForm, projectId: selectedProjectId.value })
    ElMessage.success('修改成功')
  } else {
    await axios.post(`/experiment/report-template`, { ...editForm, projectId: selectedProjectId.value })
    ElMessage.success('新建成功')
  }
  dialogVisible.value = false
  if (selectedProjectId.value) fetchTemplateList(selectedProjectId.value)
}
// AI生成模板
const onAIGenerate = async () => {
  if (!selectedProjectId.value) {
    ElMessage.warning('请先选择实验项目')
    return
  }
  dialogTitle.value = 'AI生成报告模板'
  dialogVisible.value = true
  editForm.title = 'AI生成模板'
  editForm.description = ''
  editForm.content = '正在生成中...'
  // 调用AI生成接口
  const { data } = await axios.post(`/experiment/report-template/ai-generate`, { projectId: selectedProjectId.value })
  editForm.content = data?.content || ''
}

onMounted(() => {
  fetchProjectList()
})
</script>
<style scoped>
.experiment-report-template-manage-bg {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
.frosted-wrapper {
  background: rgba(236, 236, 255, 0.92);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 32px;
  max-width: 1200px;
  width: 96vw;
  margin: 40px auto 0 auto;
  padding: 36px 32px 32px 32px;
  backdrop-filter: blur(12px);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gradient-title {
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
}
.el-card {
  border-radius: 20px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(8px);
  margin-bottom: 24px;
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
.el-dialog {
  border-radius: 18px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(8px);
}
.el-dialog__header {
  font-size: 20px;
  font-weight: 800;
  color: #7C3AED;
  letter-spacing: 1px;
}
.el-dialog__footer .el-button[type="primary"] {
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px #a18fff44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-dialog__footer .el-button[type="primary"]:hover {
  background: linear-gradient(90deg, #a18fff 0%, #7C3AED 100%);
  box-shadow: 0 6px 24px #7c3aed55;
  transform: scale(1.04);
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
@media (max-width: 900px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  .gradient-title {
    font-size: 20px;
  }
}
</style> 