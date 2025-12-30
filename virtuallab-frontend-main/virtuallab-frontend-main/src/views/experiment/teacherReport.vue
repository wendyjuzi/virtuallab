<template>
  <div class="experiment-bg">
    <div class="experiment-report">
      <!-- 头部导航栏 -->
      <div class="report-navbar">
        <div class="navbar-back">
          <el-button class="back-btn" type="text" @click="goBack">
            返回
          </el-button>
        </div>
        <div class="navbar-brand">
          <i class="icon-lab"></i>
          <span>虚拟实验室管理系统 - 教师端</span>
        </div>
        <div class="navbar-actions">
          <el-button type="primary" @click="goToScore">
            <i class="icon-grade"></i> 评分
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
              theme="bubble"
              :options="editorOptions"
              :read-only="true"
          />
          <!-- 附件显示区域 -->
          <div class="attachment-section" v-if="report.attachmentPath">
            <div class="attachment-container">
              <div class="attachment-info">
                <i class="icon-file"></i>
                <span class="attachment-name">{{ report.originalFilename }}</span>
                <span class="attachment-size">({{ formatFileSize(report.fileSize) }})</span>
                <el-button
                    type="primary"
                    plain
                    size="small"
                    @click="handleDownloadAttachment"
                    class="attachment-action"
                >
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <!-- 在实验结果部分下方添加评分区域 -->
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

      <!-- 底部操作栏 -->
      <div class="report-footer">
        <div class="time-info">
          <span>创建时间: {{ formatDateTime(report.created_at) }}</span>
          <span>最后保存: {{ report.updated_at ? formatDateTime(report.updated_at) : '尚未保存' }}</span>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="exportToPDF">
            <i class="icon-pdf"></i> 导出PDF
          </el-button>
          <el-button type="primary" @click="goToScore">
            <i class="icon-grade"></i> 评分
          </el-button>
        </div>
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
import {downloadAttachment, getReport, getUserByStudentId, gradeReport} from '@/api/experiment'
import {useRoute} from "vue-router";
import { useRouter } from 'vue-router'

export default {
  components: {
    QuillEditor
  },
  setup() {
    const route = useRoute()
    const sessionId = route.params.sessionId
    const loading = ref(null)
    const router = useRouter()
    const goBack = () => {
      router.back()
    }

    const goToScore = () => {
      router.push({ name: 'ScorePage', params: { sessionId } })
    }

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
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      manual_content: '',
      principle: '',
      purpose: '',
      category: '',
      method: '',
      steps: '',
      description: '',
      attachmentsPath: null,
      originalFilename: null,
      fileSize: null,
      mimeType:null,
      status: 'DRAFT',
      created_at: null,
      updated_at: null,
      score: '',
      comment: '',
    })

    // 数据加载逻辑
    onMounted(async () => {
      try {
        const res = await getReport(sessionId)
        const responseData = res?.data || res || {}
        const studentId = responseData.studentId

        console.log("获取到的用户信息为:", res);

        report.value = {
          title: res?.title || '',
          studentId: studentId || '',
          manual_content: res?.manual_content || res?.manualContent || '',
          principle: res?.principle || '',
          purpose: res?.purpose || '',
          category: res?.category || '',
          method: res?.method || '',
          steps: res?.steps || '',
          description: res?.description || '',
          attachmentPath: res?.attachment_path || res.attachmentPath || null,
          originalFilename: res?.original_filename || res.originalFilename || null,
          fileSize: res?.file_size || res?.fileSize || null,
          mimeType: res?.mime_type || res?.mimeType || null,
          status: res?.status || 'DRAFT',
          created_at: res?.createdAt || res?.created_at || null,
          updated_at: res?.updatedAt || res?.updated_at || null,
          comment: res?.comment || null,
          score: res?.score || null
        }

        // 加载用户信息
        if (report.value.studentId) {
          try {
            const userRes = await getUserByStudentId(report.value.studentId)
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

      } catch (error) {
        console.error('加载失败:', error)
        report.value = {
          title: '实验报告',
          manual_content: '',
          principle: '',
          purpose: '',
          category: '',
          method: '',
          steps: '',
          description: '',
          attachments: [],
          status: 'DRAFT',
          created_at: null,
          updated_at: null,
          score: '',
          comment: '',
        }
        ElMessage.error('报告加载失败:' + (error.message || '未知错误'))
      }
    })

    const handleGradeReport = async () => {
      try {
        loading.value = ElLoading.service({  // 初始化加载器
          lock: true,
          text: '评分中...',
          background: 'rgba(0,0,0,0.7)'
        });
        //评分功能

        // 评分内容
        await gradeReport(sessionId, {
          status: 'GRADED',
          comment: report.value.comment,
          score: report.value.score,
        });

        report.value.status = 'GRADED';
        report.value.updated_at = new Date().toISOString();

        ElMessage.success('评分成功');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('评分失败:', error);
          ElMessage.error(`评分失败: ${error.message || '未知错误'}`);
        }
      } finally {
        loading.value?.close();
      }
    }

    // 文件下载处理
    const handleDownloadAttachment = async () => {
      try {
        console.log('正在下载附件，sessionId:', sessionId);
        console.log('当前报告附件信息:', {
          path: report.value.attachmentsPath,
          filename: report.value.originalFilename,
          size: report.value.fileSize,
          mime: report.value.mimeType
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
        let filename = report.value.originalFilename;
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
        toolbar: false // 禁用工具栏
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
        margin: [15,5,15,5],
        filename: `实验报告_${currentUser.value.studentId}_${formatDate(report.value.created_at)}.pdf`,
        image: {type: 'jpeg', quality: 0.98},
        html2canvas:{
          scale: 2,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.scrollWidth,
          windowHeight: document.documentElement.scrollHeight,
          useCORS: true
        },
        jsPDF:{
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
          .then((pdf) =>{
            const totalPages = pdf.internal.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i)
              pdf.setFontSize(10)
              pdf.setTextColor(150)
              pdf.text(
                  ` ${i} / ${totalPages} `,
                  pdf.internal.pageSize.getWidth() / 2,
                  pdf.internal.pageSize.getHeight() - 10,
                  { align: 'center' }
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

    const reportContent = ref(null)

    return {
      currentUser,
      report,
      reportContent,
      editorOptions,
      formatDateTime,
      formatDate,
      formatStatus,
      formatFileSize,
      handleDownloadAttachment,
      exportToPDF,
      handleGradeReport,
      gradeReport,
      goToScore,
      goBack
    }
  }
}
</script>

<style scoped>
.experiment-bg {
  /* position: absolute; */
  inset: 0;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(120deg, #f3e8ff 0%, #faf5ff 100%);
  overflow: hidden;
  z-index: 0;
}
.experiment-bg::before, .experiment-bg::after {
  content: '';
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  pointer-events: none;
}
.experiment-bg::before {
  width: 380px;
  height: 380px;
  left: -120px;
  top: -120px;
  background: radial-gradient(circle at 30% 30%, #d8b4fe 0%, #a855f7 80%, transparent 100%);
}
.experiment-bg::after {
  width: 260px;
  height: 260px;
  right: -80px;
  bottom: -80px;
  background: radial-gradient(circle at 70% 70%, #e9d5ff 0%, #c084fc 80%, transparent 100%);
}

.experiment-report {
  position: relative;
  z-index: 2;
  background: rgba(255,255,255,0.85);
  color: #333;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-shadow: 0 8px 32px rgba(168,85,247,0.08);
  border-radius: 24px;
  backdrop-filter: blur(2px);
  max-width: 1200px;
  margin: 0 auto;
}

.report-navbar {
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(90deg, #f3e8ff 60%, #faf5ff 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(168,85,247,0.08);
}

.navbar-back {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.navbar-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #3a3a3a;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar-brand i {
  margin-right: 10px;
  font-size: 24px;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: flex-end;
}

.back-btn {
  font-size: 15px;
  color: #a855f7;
  padding: 0 12px;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  z-index: 2;
}
.back-btn:hover {
  color: #c084fc;
  background: rgba(192,132,252,0.08);
  border-radius: 6px;
}

.report-container {
  background-color: rgba(255, 255, 255, 0.95);
  margin: 0 auto;
  width: 85%;
  max-width: 1000px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10);
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
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10);
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: #3a3a3a;
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

.report-navbar .el-button, .report-footer .el-button {
  background: linear-gradient(90deg, #a855f7 0%, #c084fc 100%);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(168,85,247,0.22);
  font-weight: 500;
  border-radius: 8px;
  transition: background 0.3s;
}
.report-navbar .el-button:hover, .report-footer .el-button:hover {
  background: linear-gradient(90deg, #9333ea 0%, #a855f7 100%);
}

.report-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #a855f7;
}

.report-title {
  font-size: 30px;
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 700;
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
  background-color: #f3e8ff;
  padding: 5px 15px;
  border-radius: 20px;
  box-shadow: 0 1px 4px rgba(168,85,247,0.11);
}

.meta-item i {
  margin-right: 8px;
  color: #a855f7;
}

.section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: linear-gradient(90deg, #f3e8ff, #fff);
  border-left: 5px solid #a855f7;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 1px 6px rgba(168,85,247,0.11);
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
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

.attachment-info {
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.attachment-name {
  margin-left: 8px;
  margin-right: 8px;
}

.attachment-size {
  color: #909399;
  margin-right: 12px;
}

/* 图标样式 */
[class^="icon-"] {
  font-style: normal;
}

.icon-lab:before { content: "🧪"; }
.icon-grade:before { content: "📝"; }
.icon-user:before { content: "👤"; }
.icon-id:before { content: "🆔"; }
.icon-calendar:before { content: "📅"; }
.icon-class:before { content: "🏫"; }
.icon-target:before { content: "🎯"; }
.icon-theory:before { content: "📚"; }
.icon-method:before { content: "🔧"; }
.icon-result:before { content: "📊"; }
.icon-pdf:before { content: "📄"; }
.icon-category:before { content: "🏷️"; }
.icon-steps:before { content: "👣"; }
.icon-description:before { content: "📋"; }
.icon-file:before { content: "📎"; }
.icon-status:before { content: "🔖"; }


/* 教师评价样式 */
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
  color: #a855f7;
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
  .action-buttons{
    display:none !important;
  }
}

@media (max-width: 900px) {
  .experiment-report, .report-container, .report-footer {
    width: 98% !important;
    padding: 10px !important;
    border-radius: 10px !important;
  }
  .section-header h2 {
    font-size: 17px;
  }
  .report-title {
    font-size: 22px;
  }
}
</style>