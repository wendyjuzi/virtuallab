<template>
  <div class="experiment-report">
    <!-- 头部导航栏 -->
    <div class="report-navbar">
      <div class="navbar-brand">
        <i class="icon-lab"></i>
        <span>虚拟实验室管理系统</span>
      </div>
      <div class="navbar-actions">
        <div class="save-status">
          <span v-if="report.updated_at">最后保存: {{ formatDateTime(report.updated_at) }}</span>
          <span v-else>未保存</span>
        </div>
        <el-button
            type="primary"
            @click="saveReport"
            :disabled="report.status === 'SUBMITTED' || report.status === 'GRADED'"
        >
          <i class="icon-save"></i> 保存报告
        </el-button>
        <el-button
            type="success"
            @click="handleSubmitReport"
            :disabled="report.status === 'SUBMITTED' || report.status === 'GRADED'"
        >
          <i class="icon-check"></i> 提交报告
        </el-button>
      </div>
    </div>

    <!-- 报告主体内容容器 -->
    <div class="report-container" ref="reportContent">
      <!-- 报告头部信息 -->
      <div class="report-header">
        <h1 class="report-title">{{ report.title }}</h1>
        <div class="report-meta">
          <div class="meta-item">
            <i class="icon-user"></i>
            <span>学生: {{ currentUser.username }}</span>
          </div>
          <div class="meta-item">
            <i class="icon-id"></i>
            <span>学号: {{ currentUser.studentId }}</span>
          </div>
          <div class="meta-item">
            <i class="icon-calendar"></i>
            <span>实验日期: {{ formatDate(report.created_at) }}</span>
          </div>
          <div class="meta-item">
            <i class="icon-class"></i>
            <span>院系: {{ currentUser.department }}学院</span>
          </div>
          <div class="meta-item">
            <i class="icon-class"></i>
            <span>专业: {{ currentUser.major }}</span>
          </div>
          <div class="meta-item">
            <i class="icon-status"></i>
            <span>状态: {{ formatStatus(report.status) }}</span>
          </div>
        </div>
      </div>

      <!-- 报告内容部分 -->
      <div class="report-content">
        <!-- 实验目的 -->
        <div class="section">
          <div class="section-header">
            <i class="icon-target"></i>
            <h2>实验目的</h2>
          </div>
          <div class="readonly-content" v-html="report.purpose"></div>
        </div>

        <!-- 实验原理 -->
        <div class="section">
          <div class="section-header">
            <i class="icon-theory"></i>
            <h2>实验原理</h2>
          </div>
          <div class="readonly-content" v-html="report.principle"></div>
        </div>

        <!-- 实验类别 -->
        <div class="section">
          <div class="section-header">
            <i class="icon-category"></i>
            <h2>实验类别</h2>
          </div>
          <div class="readonly-content" v-html="report.category"></div>
        </div>

        <!-- 实验方法 -->
        <div class="section">
          <div class="section-header">
            <i class="icon-method"></i>
            <h2>实验方法</h2>
          </div>
          <div class="readonly-content" v-html="report.method"></div>
        </div>

        <!-- 实验步骤 -->
        <div class="section">
          <div class="section-header">
            <i class="icon-steps"></i>
            <h2>实验步骤</h2>
          </div>
          <div class="readonly-content" v-html="report.steps"></div>
        </div>

        <!-- 实验描述 -->
        <div class="section">
          <div class="section-header">
            <i class="icon-description"></i>
            <h2>实验描述</h2>
          </div>
          <div class="readonly-content" v-html="report.description"></div>
        </div>

        <!-- 实验结果 -->
        <div class="section">
          <div class="section-header">
            <i class="icon-result"></i>
            <h2>实验结果</h2>
          </div>
          <QuillEditor
              v-model:content="report.manual_content"
              contentType="html"
              theme="snow"
              :options="editorOptions"
              :read-only="!['DRAFT', 'SAVED'].includes(report.status)"
          />

          <!-- 附件上传区域 -->
          <div class="attachment-section">
            <div class="section-header">
              <i class="icon-attachment"></i>
              <h2>实验附件</h2>
            </div>

            <!-- 上传按钮 -->
            <div class="upload-button">
              <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileUpload"
                  style="display: none"
                  :disabled="!['DRAFT', 'SAVED'].includes(report.status)"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  multiple
              >
              <el-button
                  type="primary"
                  @click="$refs.fileInput.click()"
                  :disabled="!['DRAFT', 'SAVED'].includes(report.status)"
              >
                <i class="icon-upload"></i>
                上传附件
              </el-button>
              <span class="upload-hint">支持PDF、Word、图片或文本文件，单个文件不超过10MB</span>
            </div>

            <!-- 附件列表 -->
            <div class="attachment-list" v-if="report.attachment_path">
              <div class="attachment-item">
                <div class="file-info">
                  <i :class="getFileIcon(report.mime_type)"></i>
                  <span class="file-name">{{ report.original_filename }}</span>
                  <span class="file-size">({{ formatFileSize(report.file_size) }})</span>
                </div>
                <div class="file-actions">
                  <el-button
                      type="text"
                      @click="handleDownloadAttachment(report)"
                      title="下载"
                  >
                    <i class="icon-download"></i>
                  </el-button>
                  <el-button
                      :disabled="!['DRAFT', 'SAVED'].includes(report.status)"
                      type="text"
                      @click="handleRemoveAttachment(report)"
                      title="删除"
                      style="color: #f56c6c"
                  >
                    <i class="icon-delete"></i>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 评分显示 -->
            <div class="section">
              <div class="section-header">
                <i class="icon-grade"></i>
                <h2>教师评价</h2>
              </div>

              <!-- 评分显示 -->
              <div class="grade-section" v-if="report.status === 'GRADED'">
                <div class="grade-item">
                  <span class="grade-label">评分：</span>
                  <span class="grade-value">{{ report.score }}分</span>
                </div>

                <div class="grade-item">
                  <span class="grade-label">评语：</span>
                  <div class="grade-comment" v-html="report.comment"></div>
                </div>

              </div>

              <div v-else class="no-grade">
                <p>该报告尚未评分</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="report-footer">
      <div class="time-info">
        <span>创建时间: {{ formatDateTime(report.created_at) }}</span>
        <span>最后保存: {{ report.updated_at ? formatDateTime(report.updated_at) : '尚未保存' }}</span>
      </div>
      <div class="action-buttons">
        <el-button
            type="primary"
            @click="saveReport"
            :disabled="report.status === 'SUBMITTED' || report.status === 'GRADED'"
        >
          <i class="icon-save"></i> 保存报告
        </el-button>
        <el-button
            type="success"
            @click="handleSubmitReport"
            :disabled="report.status === 'SUBMITTED' || report.status === 'GRADED'"
        >
          <i class="icon-check"></i> 提交报告
        </el-button>
        <el-button type="primary" @click="exportToPDF">
          <i class="icon-pdf"></i> 导出PDF
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import html2pdf from "html2pdf.js"
import {ElLoading, ElMessage, ElMessageBox} from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import {
  getReport,
  saveContent,
  uploadAttachment,
  submitReport,
  getUserByStudentId,
  deleteAttachment,
  downloadAttachment
} from '@/api/experiment'
import {useRoute} from "vue-router";
import { useUserStore } from '@/store/user';
const userStore = useUserStore()
import axios from 'axios'

export default {
  components: {
    QuillEditor
  },
  setup() {
    const route = useRoute()
    const sessionId = route.params.sessionId
    const loading = ref(null)
    const reportContent = ref(null)

    // 格式化日期时间
    const formatDateTime = (date) => {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i])
    }

    // 基本信息
    const currentUser = ref({
      username: '',
      studentId: '',
      realName: '',
      department: '',
      major: '',
      grade: '',
      className: ''
    })

    // 报告数据
    const report = ref({
      title: '',
      studentId: '',
      projectId: '',
      manual_content: '',
      principle: '',
      purpose: '',
      category: '',
      method: '',
      steps: '',
      description: '',
      attachment_path: '',
      original_filename: '',
      file_size: '',
      mime_type: '',
      status: 'DRAFT',
      created_at: null,
      updated_at: null,
      score: '',
      comment: ''
    })

    // 获取文件类型图标
    const getFileIcon = (mimeType) => {
      if (!mimeType) return 'icon-unknown';

      if (mimeType.includes('pdf')) return 'icon-pdf';
      if (mimeType.includes('word') || mimeType.includes('msword')) return 'icon-word';
      if (mimeType.includes('image')) return 'icon-image';
      if (mimeType.includes('text')) return 'icon-text';

      return 'icon-unknown';
    }

    // 文件上传处理
    const handleFileUpload = async (event) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      // 检查文件大小
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          ElMessage.error(`文件 ${file.name} 大小不能超过10MB`)
          return
        }
      }

      // 检查文件类型
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'text/plain'
      ]

      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          ElMessage.error(`文件 ${file.name} 类型不支持，只支持上传PDF、Word、图片或文本文件`)
          return
        }
      }

      try {
        loading.value = ElLoading.service({
          lock: true,
          text: '上传中...',
          background: 'rgba(0,0,0,0.7)'
        })

        // 上传所有文件
        const uploadPromises = Array.from(files).map(file =>
            uploadAttachment(sessionId, file)
        )
        await Promise.all(uploadPromises)
        await fetchReport()

        ElMessage.success(`成功上传 ${files.length} 个附件`)
      } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error('附件上传失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value?.close()
        event.target.value = '' // 清空input，允许重复上传同一文件
      }
    }

    // 文件删除处理
    const handleRemoveAttachment = async () => {
      try {
        await ElMessageBox.confirm(`确定删除附件 ${report.value.original_filename} 吗？`, '警告', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        })

        loading.value = ElLoading.service({
          lock: true,
          text: '删除中...',
          background: 'rgba(0,0,0,0.7)'
        })

        await deleteAttachment(sessionId)
        // 清空前端的附件信息
        report.value.attachment_path = ''
        report.value.original_filename = ''
        report.value.file_size = ''
        report.value.mime_type = ''
        report.value.updated_at = new Date().toISOString()

        ElMessage.success('附件删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          ElMessage.error('附件删除失败: ' + (error.message || '未知错误'))
        }
      } finally {
        loading.value?.close()
      }
    }

    // 文件下载处理
    const handleDownloadAttachment = async () => {
      try {
        console.log('正在下载附件，sessionId:', sessionId);
        console.log('当前报告附件信息:', {
          path: report.value.attachment_path,
          filename: report.value.original_filename,
          size: report.value.file_size,
          mime: report.value.mime_type
        });

        const response = await downloadAttachment(sessionId);
        console.log("完整响应结构:", response);

        // 三重保险数据验证
        let blobData;
        if (response instanceof Blob) {
          // 情况1：直接返回Blob
          blobData = response;
        } else if (response?.data instanceof Blob) {
          // 情况2：包装在data字段
          blobData = response.data;
        } else {
          // 情况3：其他情况强制转换
          blobData = new Blob([response], {
            type: 'application/octet-stream'
          });
        }

        // ✅ 关键修复：从响应头提取文件名（兼容后端编码）
        let filename = report.value.original_filename;
        const contentDisposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
          }
        }
        // 调试：打印响应数据和文件名
        console.log('响应数据:', response.data || response);
        console.log('文件名:', filename);
        console.log('Content-Type:', response.headers?.['content-type']);

        // 创建下载链接
        const url = window.URL.createObjectURL(blobData)
        const link = document.createElement('a')
        link.href = url
        link.download = filename;
        document.body.appendChild(link)
        link.click()

        // 清理
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载失败:', error)
        ElMessage.error('附件下载失败: ' + (error.message || '未知错误'))
      }
    }

    // 获取报告数据的公共方法
    const fetchReport = async () => {
      try {
        const res = await getReport(sessionId)
        console.log('原始响应:', res) // 检查完整响应结构

        // 确保正确获取studentId和projectId
        const responseData = res?.data || res || {}
        const studentId = responseData.studentId
        const projectId = responseData.projectId
        console.log('提取的studentId:', studentId)
        console.log('提取的projectId:', projectId)

        // 更新为新的字段结构
        report.value = {
          title: res?.title || '',
          studentId: studentId || '',
          projectId: projectId || '',
          manual_content: res?.manual_content || res?.manualContent || '',
          principle: res?.principle || '',
          purpose: res?.purpose || '',
          category: res?.category || '',
          method: res?.method || '',
          steps: res?.steps || '',
          description: res?.description || '',
          attachment_path: res.attachment_path || res.attachmentPath || '',
          original_filename:  res.original_filename || res.originalFilename || '',
          file_size: res.file_size || res.fileSize || '',
          mime_type: res.mime_type || res.mimeType || '',
          status: res?.status || 'DRAFT',
          created_at: res?.createdAt || res?.created_at || null,
          updated_at: res?.updatedAt || res?.updated_at || null,
          score: res?.score || '',
          comment: res?.comment || ''
        }

        // 加载用户信息
        if (report.value.studentId) {
          try {
            const userRes = await getUserByStudentId(report.value.studentId)
            console.log('用户信息原始响应:', userRes); // 调试用
            const userData = userRes.data || {};
            currentUser.value = {
              username: userData.username || '未知用户',
              studentId: userData.studentId || report.value.studentId || '未知学号',
              realName: userData.realName || userData.username || '未知姓名',
              department: userData.department || '未知院系',
              major: userData.major || '未知专业',
              grade: userData.grade ?? '',
              className: userData.className ?? ''
            }
          } catch (error) {
            console.error('加载用户信息失败:', error)
            // 设置默认值
            currentUser.value = {
              username: '未知用户',
              studentId: report.value.studentId || '未知学号',
              realName: '未知姓名',
              department: '未知院系',
              major: '未知专业',
              grade: '',
              className: ''
            }
          }
        } else {
          console.error('报告中没有studentId，无法加载用户信息')
        }

        console.log('最终数据:', report.value)
      } catch (error) {
        console.error('加载失败:', error)
        // 确保返回完整数据结构
        report.value = {
          title: '标题1',
          manual_content: '',
          principle: '',
          purpose: '',
          category: '',
          method: '',
          steps: '',
          description: '',
          attachment_path: '',
          original_filename: '',
          file_size: '',
          mime_type: '',
          status: 'DRAFT',
          created_at: null,
          updated_at: null
        }
        ElMessage.error('报告加载失败:' + (error.message || '未知错误'))
      }
    }

    // 保存报告内容（包含附件处理）
    const saveReport = async () => {
      let loadingInstance = null;
      try {
        loadingInstance = ElLoading.service({
          lock: true,
          text: '保存中...',
          background: 'rgba(0,0,0,0.7)'
        });

        // 保存报告内容
        const response = await saveContent(sessionId, {
          manual_content: report.value.manual_content,
          status: 'SAVED'
        });

        report.value.status = 'SAVED';
        report.value.updated_at = new Date().toISOString();

        ElMessage.success('报告保存成功');
      } catch (error) {
        console.error('保存失败:', error);
        ElMessage.error(`保存失败: ${error.message || '未知错误'}`);
      } finally {
        loadingInstance?.close();
      }
    };

    // 提交报告
    const handleSubmitReport = async () => {
      try {
        loading.value = ElLoading.service({  // 初始化加载器
          lock: true,
          text: '提交中...',
          background: 'rgba(0,0,0,0.7)'
        });

        // 确认对话框
        await ElMessageBox.confirm('确认提交报告?提交后将无法修改', '提示', {
          type: 'warning',
          confirmButtonText: '确认提交',
          cancelButtonText: '取消'
        });
        // 👉 获取当前用户ID
        const userId = userStore.user?.id;
        const token = userStore.token;


        // 👉 提交状态更新
        await axios.post('/api/experiment/project/complete', {
          projectId: report.value.projectId,  // ✅ 修复点
          studentId: String(report.value.studentId)
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // 提交报告内容
        await submitReport(sessionId, {
          status: 'SUBMITTED'
        });

        report.value.status = 'SUBMITTED';
        report.value.updated_at = new Date().toISOString();

        ElMessage.success('报告提交成功');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('提交失败:', error);
          ElMessage.error(`提交失败: ${error.message || '未知错误'}`);
        }
      } finally {
        loading.value?.close();
      }
    };

    // 格式化状态显示
    const formatStatus = (status) => {
      const statusMap = {
        'DRAFT': '草稿',
        'SUBMITTED': '已提交',
        'GRADED': '已评分',
        'SAVED': '已保存'
      }
      return statusMap[status] || status
    }

    // 编辑器配置
    const editorOptions = ref({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{'list': 'ordered'}, {'list': 'bullet'}],
          [{'header': [1, 2, 3, false]}],
          [{'color': []}, {'background': []}],
          ['link', 'image'],
          ['clean']
        ]
      }
    })

    // 导出PDF函数
    const exportToPDF = () => {
      const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在生成PDF，请稍候...',
        background: 'rgba(0,0,0,0.7)'
      })

      const opt = {
        margin: [15, 5, 15, 5],
        filename: `实验报告_${currentUser.value.studentId}_${formatDate(report.value.created_at)}.pdf`,
        image: {type: 'jpeg', quality: 0.98},
        html2canvas: {
          scale: 2,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: document.documentElement.scrollHeight,
          useCORS: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          hotfixes: ['px_scaling'],
          putOnlyUsedFonts: true
        }
      }

      html2pdf()
          .from(reportContent.value)
          .set(opt)
          .toPdf()
          .get('pdf')
          .then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i)
              pdf.setFontSize(10)
              pdf.setTextColor(150)
              pdf.text(
                  ` ${i} / ${totalPages} `,
                  pdf.internal.pageSize.getWidth() / 2,
                  pdf.internal.pageSize.getHeight() - 10,
                  {align: 'center'}
              )
            }
            return pdf
          })
          .save()
          .then(() => {
            ElMessage.success('实验报告PDF导出成功')
          })
          .catch(err => {
            console.error('导出失败：', err)
            ElMessage.error('导出失败：' + err.message)
          })
          .finally(() => {
            loadingInstance.close()
          })
    }

    // 初始化加载数据
    onMounted(() => {
      fetchReport()
    })

    return {
      currentUser,
      report,
      reportContent,
      editorOptions,
      formatDateTime,
      formatDate,
      formatFileSize,
      formatStatus,
      getFileIcon,
      handleFileUpload,
      handleDownloadAttachment,
      handleRemoveAttachment,
      saveReport,
      handleSubmitReport,
      exportToPDF
    }
  }
}
</script>

<style scoped>
.experiment-report {
  overflow-y: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  padding: 20px;
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
}

.report-container {
  background-color: rgba(255, 255, 255, 0.95);
  margin: 0 auto;
  width: 85%;
  max-width: 1000px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.report-footer {
  background-color: rgba(255, 255, 255, 0.95);
  width: 85%;
  max-width: 1000px;
  margin: 20px auto 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
  flex-grow: 1;
  overflow-y: auto;
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

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.save-status {
  color: white;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.2);
  padding: 5px 10px;
  border-radius: 4px;
}

.btn i {
  margin-right: 5px;
}

.report-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #409eff;
}

.report-title {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.report-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  background-color: #f0f5ff;
  padding: 5px 15px;
  border-radius: 20px;
}

.meta-item i {
  margin-right: 8px;
  color: #409eff;
}

.section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: linear-gradient(90deg, #f0f7ff, #fff);
  border-left: 4px solid #409eff;
  border-radius: 0 4px 4px 0;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 500;
  color: #2c3e50;
  margin-left: 10px;
}

.readonly-content {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  line-height: 1.6;
}

.readonly-content p {
  margin-bottom: 10px;
}

.time-info {
  display: flex;
  flex-direction: column;
  color: #666;
  font-size: 14px;
}

.time-info span {
  margin-bottom: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* 附件上传区域样式 */
.attachment-section {
  margin-top: 30px;
}

.upload-button {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

/* 附件列表样式 */
.attachment-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.attachment-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-name {
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.file-actions {
  margin-left: 15px;
}

/* 文件操作图标样式 - 修改后的版本 */
.file-actions .el-button {
  /* 移除之前的自定义样式 */
  padding-left: 8px !important; /* 恢复默认padding */
}

/* 使用Element UI的图标类名来覆盖 */
.icon-download:before {
  content: "⏬" !important;
  font-family: inherit !important;
}

.icon-delete:before {
  content: "🗑️" !important;
  font-family: inherit !important;
}

/* 上传按钮图标 */
.icon-upload:before {
  content: "📤" !important;
  font-family: inherit !important;
}

/* 文件类型图标保持原样 */
.icon-pdf:before { content: "📄"; }
.icon-word:before { content: "📝"; }
.icon-image:before { content: "🖼️"; }
.icon-text:before { content: "📃"; }
.icon-unknown:before { content: "📁"; }
.icon-attachment:before { content: "📎"; }

/* 其他图标保持不变 */
[class^="icon-"] {
  font-style: normal;
}

.icon-lab:before { content: "🧪"; }
.icon-save:before { content: "💾"; }
.icon-check:before { content: "✓"; }
.icon-user:before { content: "👤"; }
.icon-id:before { content: "🆔"; }
.icon-calendar:before { content: "📅"; }
.icon-class:before { content: "🏫"; }
.icon-target:before { content: "🎯"; }
.icon-theory:before { content: "📚"; }
.icon-method:before { content: "🔧"; }
.icon-result:before { content: "📊"; }
.icon-category:before { content: "🏷️"; }
.icon-steps:before { content: "👣"; }
.icon-description:before { content: "📋"; }


.grade-section {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.grade-item {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}

.grade-label {
  font-weight: bold;
  min-width: 80px;
  color: #606266;
}

.grade-value {
  font-size: 18px;
  color: #67C23A;
  font-weight: bold;
}

.grade-comment {
  flex: 1;
  padding: 10px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  line-height: 1.6;
}

.no-grade {
  padding: 15px;
  color: #909399;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.icon-grade:before {
  content: "📝";
}


/* 添加打印样式 */
@media print {
  .action-buttons {
    display: none !important;
  }
}
</style>