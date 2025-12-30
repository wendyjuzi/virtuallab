<template>
  <div class="experiment-publish-admin">
    <el-form :model="form" label-width="100px" style="max-width: 600px; margin: 40px auto;">
      <el-form-item label="实验名称" required>
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="学科分类" required>
        <el-select v-model="form.category">
          <el-option label="物理" value="physics" />
          <el-option label="化学" value="chemistry" />
          <el-option label="数学" value="math" />
          <el-option label="生物" value="biology" />
        </el-select>
      </el-form-item>
      <el-form-item label="实验描述" required>
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="实验难度" required>
        <el-radio-group v-model="form.level">
          <el-radio label="easy">初级</el-radio>
          <el-radio label="medium">中级</el-radio>
          <el-radio label="hard">高级</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="实验标签">
        <el-input v-model="form.tags" placeholder="用逗号分隔多个标签" />
      </el-form-item>
      <el-form-item label="实验原理">
        <el-input v-model="form.principle" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="实验目的">
        <el-input v-model="form.purpose" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="实验方法">
        <el-input v-model="form.method" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="实验步骤">
        <el-input v-model="form.steps" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="封面图片">
        <div v-if="!form.imageUrl">
          <el-upload
              class="upload-demo"
              action="/api/experiment/project/upload/image"
              :limit="1"
              :show-file-list="false"
              name="file"
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>
        </div>
        <img v-if="form.imageUrl" :src="form.imageUrl" style="max-width: 120px; margin-left: 10px;" />
      </el-form-item>
      <el-form-item label="发布班级">
        <el-select v-model="form.classIds" multiple placeholder="选择要发布的班级">
          <el-option
              v-for="cls in mockClasses"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="publishing" @click="publish">发布实验</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const publishing = ref(false)
const form = ref({
  name: '',
  category: '',
  description: '',
  level: 'medium',
  tags: '',
  principle: '',
  purpose: '',
  method: '',
  steps: '',
  imageUrl: '',
  screenshot: '',
  experimentParams: {}, // 修正为对象
  sceneJsonPath: '',
  projectType: 'individual',
  classIds: [] as number[], // 新增，确保为数组
})

const sceneJsonPath = ref('')
const experimentName = ref('')
const experimentDesc = ref('')
const experimentDifficulty = ref('')
const experimentTags = ref('')
const subject = ref('')
const experimentParams = ref({})

onMounted(() => {
  sceneJsonPath.value = localStorage.getItem('publishSceneJsonPath') || ''
  experimentName.value = localStorage.getItem('publishExperimentName') || ''
  experimentDesc.value = localStorage.getItem('publishExperimentDesc') || ''
  experimentDifficulty.value = localStorage.getItem('publishExperimentDifficulty') || ''
  experimentTags.value = localStorage.getItem('publishExperimentTags') || ''
  subject.value = localStorage.getItem('publishExperimentSubject') || ''
  try {
    experimentParams.value = JSON.parse(localStorage.getItem('publishExperimentParams') || '{}')
  } catch (e) {
    experimentParams.value = {}
  }
})
const mockClasses = ref([
  { id: 1, name: '软件工程1班' },
  { id: 2, name: '软件工程2班' },
  { id: 3, name: '软件工程3班' },
  { id: 4, name: '软件工程4班' },
  { id: 5, name: '软件工程5班' },
  { id: 6, name: '软件工程6班' }
])

function handleImageSuccess(res: any) {
  form.value.imageUrl = res.url
}

async function publish() {
  if (!form.value.name || !form.value.category || !form.value.description) {
    ElMessage.error('请填写完整信息')
    return
  }
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.error('未登录，无法发布');
    return;
  }
  publishing.value = true
  try {
    // 保证 experimentParams 为对象
    form.value.experimentParams = experimentParams.value && typeof experimentParams.value === 'object' ? experimentParams.value : {};
    const payload = { ...form.value, sceneJsonPath: sceneJsonPath.value };
    // 关键：experimentParams 序列化为字符串
    payload.experimentParams = JSON.stringify(payload.experimentParams || {});
    if (!Array.isArray(payload.classIds)) {
      payload.classIds = [];
    }
    const res = await axios.post('/experiment/project/publish', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (res.data.code === 200) {
      ElMessage.success('发布成功')
      // 清理缓存
      localStorage.removeItem('publishSceneData')
      localStorage.removeItem('publishScreenshot')
      localStorage.removeItem('publishExperimentParams')
      localStorage.removeItem('publishExperimentName')
      localStorage.removeItem('publishExperimentDesc')
      localStorage.removeItem('publishExperimentDifficulty')
      localStorage.removeItem('publishExperimentTags')
      localStorage.removeItem('publishExperimentSubject')
      localStorage.removeItem('publishSceneJsonPath')
      // 跳转到详情页，projectId 作为字符串传递
      router.push({ name: 'ExperimentDetail', params: { projectId: String(res.data.projectId) } })
    } else {

    }
  } catch (e) {

  } finally {
    publishing.value = false
  }
}
</script> 