<template>
  <div class="experiment-editor">
    <div class="editor-header">
      <h1>
        <i class="fas fa-atom"></i>
        仿真模拟实验设计平台 - 物理实验
      </h1>
      <div>
        <el-button type="success" icon="fas fa-save">保存草稿</el-button>
      </div>
    </div>
    <div class="editor-content">
      <div class="editor-sidebar">
        <div class="nav-item active">
          <i class="fas fa-info-circle"></i>
          <span>实验基本信息</span>
        </div>
        <div class="nav-item">
          <i class="fas fa-cogs"></i>
          <span>实验参数配置</span>
        </div>
        <div class="nav-item">
          <i class="fas fa-tasks"></i>
          <span>实验任务设置</span>
        </div>
        <div class="nav-item">
          <i class="fas fa-atom"></i>
          <span>实验场景设计</span>
        </div>
        <div class="nav-item">
          <i class="fas fa-chart-line"></i>
          <span>数据记录设置</span>
        </div>
        <div class="nav-item">
          <i class="fas fa-users"></i>
          <span>班级与发布设置</span>
        </div>
        <div class="nav-item">
          <i class="fas fa-eye"></i>
          <span>实验预览模式</span>
        </div>
      </div>
      <div class="editor-main">
        <div class="section-title">
          <i class="fas fa-cogs"></i>
          <h2>创建物理仿真实验项目</h2>
        </div>
        <div class="form-grid">
          <div class="form-card">
            <h3><i class="fas fa-heading"></i> 实验基本信息</h3>
            <el-form label-position="top">
              <el-form-item label="实验名称">
                <el-input v-model="experiment.name" placeholder="请输入实验名称"></el-input>
              </el-form-item>
              <el-form-item label="实验描述">
                <el-input 
                  type="textarea" 
                  v-model="experiment.description" 
                  placeholder="请输入实验描述"
                  :rows="4"
                ></el-input>
              </el-form-item>
              <el-form-item label="实验封面">
                <el-upload
                  class="upload-demo"
                  action="#"
                  :show-file-list="false"
                >
                  <el-button icon="fas fa-upload">上传封面图片</el-button>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>
          <div class="form-card">
            <h3><i class="fas fa-tags"></i> 实验分类信息</h3>
            <el-form label-position="top">
              <el-form-item label="实验学科">
                <el-select v-model="experiment.category" placeholder="选择学科">
                  <el-option label="力学" value="力学"></el-option>
                  <el-option label="电磁学" value="电磁学"></el-option>
                  <el-option label="热学" value="热学"></el-option>
                  <el-option label="光学" value="光学"></el-option>
                  <el-option label="近代物理" value="近代物理"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="实验难度">
                <el-select v-model="experiment.level" placeholder="选择难度">
                  <el-option label="初级" value="初级"></el-option>
                  <el-option label="中级" value="中级"></el-option>
                  <el-option label="高级" value="高级"></el-option>
                  <el-option label="竞赛级" value="竞赛级"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="预计时长 (分钟)">
                <el-input-number v-model="experiment.duration" :min="10" :max="180"></el-input-number>
              </el-form-item>
            </el-form>
          </div>
          <div class="form-card">
            <h3><i class="fas fa-sliders-h"></i> 自定义实验参数</h3>
            <div v-for="(param, index) in experiment.params" :key="index" class="param-item">
              <el-input v-model="param.name" placeholder="参数名"></el-input>
              <el-input v-model="param.value" placeholder="值"></el-input>
              <el-select v-model="param.unit" style="width: 100px">
                <el-option label="N" value="N"></el-option>
                <el-option label="m" value="m"></el-option>
                <el-option label="kg" value="kg"></el-option>
                <el-option label="s" value="s"></el-option>
                <el-option label="A" value="A"></el-option>
                <el-option label="V" value="V"></el-option>
              </el-select>
              <el-button type="danger" icon="fas fa-trash" @click="removeParam(index)" circle></el-button>
            </div>
            <el-button class="add-param" type="primary" icon="fas fa-plus" @click="addParam">添加参数</el-button>
          </div>
        </div>
        <div class="preview-panel">
          <div class="preview-header">
            <h3><i class="fas fa-eye"></i> 实验场景实时预览</h3>
            <div>
              <el-button type="warning" icon="fas fa-sync-alt">重置场景</el-button>
            </div>
          </div>
          <el-tabs v-model="activeTab" type="card">
            <el-tab-pane label="斜面碰撞" name="inclined">
              <PhysicsInclinedCollision :mass="getParamValue('质量')" />
            </el-tab-pane>
            <el-tab-pane label="弹簧碰撞" name="spring">
              <PhysicsSpringCollision />
            </el-tab-pane>
            <el-tab-pane label="刚体旋转" name="rigid">
              <PhysicsRigidRotation />
            </el-tab-pane>
            <el-tab-pane label="电路与磁场" name="circuit">
              <PhysicsCircuitMagnetic />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
    <div class="action-bar">
      <el-button type="info" icon="fas fa-times">取消</el-button>
      <el-button type="primary" icon="fas fa-save">保存实验</el-button>
      <el-button type="success" icon="fas fa-paper-plane">发布到班级</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import * as THREE from 'three'
import PhysicsInclinedCollision from '@/components/PhysicsInclinedCollision.vue'
import PhysicsSpringCollision from '@/components/PhysicsSpringCollision.vue'
import PhysicsRigidRotation from '@/components/PhysicsRigidRotation.vue'
import PhysicsCircuitMagnetic from '@/components/PhysicsCircuitMagnetic.vue'
const experiment = reactive({
  name: '基础力学实验',
  description: '通过仿真平台观察不同质量和力的作用下物体的运动规律',
  category: '力学',
  level: '中级',
  duration: 45,
  params: [
    { name: '质量', value: '2', unit: 'kg' },
    { name: '力', value: '10', unit: 'N' },
    { name: '时间', value: '5', unit: 's' }
  ]
})
const liquidHeight = ref(100)
const bubbles = ref<any[]>([])
const chart = ref()
let chartInstance: any = null
const activeTab = ref('inclined')
const addParam = () => {
  experiment.params.push({ name: '', value: '', unit: 'N' })
}
const removeParam = (index: number) => {
  experiment.params.splice(index, 1)
}
const createBubbles = () => {
  const newBubbles = []
  for (let i = 0; i < 12; i++) {
    newBubbles.push({
      style: {
        width: `${Math.random() * 8 + 4}px`,
        height: `${Math.random() * 8 + 4}px`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 2}s`
      }
    })
  }
  bubbles.value = newBubbles
}
const initChart = () => {
  if (chartInstance) chartInstance.dispose()
  // @ts-ignore
  chartInstance = window.echarts.init(chart.value)
  const option = {
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['0', '1', '2', '3', '4', '5', '6'],
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: 'rgba(255,255,255,0.7)' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.7)' }
    },
    series: [{
      data: [0, 3, 7, 12, 18, 25, 33],
      type: 'line',
      smooth: true,
      lineStyle: { width: 3, color: '#5d78ff' },
      itemStyle: { color: '#5d78ff' },
      areaStyle: {
        color: (window as any).echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(93, 120, 255, 0.5)' },
          { offset: 1, color: 'rgba(93, 120, 255, 0.1)' }
        ])
      },
      markPoint: {
        data: [
          { type: 'max', name: '峰值' },
          { type: 'min', name: '谷值' }
        ],
        label: { color: '#fff' }
      }
    }]
  }
  chartInstance.setOption(option)
  setInterval(() => {
    const data = option.series[0].data
    data.shift()
    data.push(Math.round(Math.random() * 20 + 10))
    chartInstance.setOption({ series: [{ data }] })
  }, 2000)
}
setInterval(() => {
  liquidHeight.value = 80 + Math.random() * 40
}, 1500)

// three.js 相关
const threeContainer = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let cube: THREE.Mesh | null = null
let animationId: number | null = null

const initThree = () => {
  if (!threeContainer.value) return
  // 清理旧的渲染器
  if (renderer) {
    renderer.dispose()
    threeContainer.value.innerHTML = ''
  }
  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x222733)
  // 相机
  camera = new THREE.PerspectiveCamera(75, threeContainer.value.clientWidth / threeContainer.value.clientHeight, 0.1, 1000)
  camera.position.z = 5
  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
  threeContainer.value.appendChild(renderer.domElement)
  // 光源
  const light = new THREE.PointLight(0xffffff, 1)
  light.position.set(10, 10, 10)
  scene.add(light)
  // 物体（可根据参数动态调整）
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: 0x5d78ff })
  cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
  animate()
}
const animate = () => {
  if (!renderer || !scene || !camera || !cube) return
  animationId = requestAnimationFrame(animate)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}
// 响应参数变化（如质量、力等）可联动three.js物体属性
watch(() => experiment.params, (params) => {
  if (cube && params[0]) {
    // 例如根据"质量"参数调整立方体大小
    const mass = parseFloat(params[0].value) || 1
    cube.scale.set(mass, mass, mass)
  }
}, { deep: true })

onMounted(() => {
  createBubbles()
  setInterval(createBubbles, 3000)
  initChart()
  window.addEventListener('resize', () => {
    if (chartInstance) chartInstance.resize()
    if (renderer && camera && threeContainer.value) {
      renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
      camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
      camera.updateProjectionMatrix()
    }
  })
  setTimeout(() => {
    initThree()
  }, 300)
})

function getParamValue(name: string) {
  const param = experiment.params.find(p => p.name === name)
  return param ? parseFloat(param.value) : 1
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css');
:root {
  --primary: #5d78ff;
  --primary-dark: #4a5fd9;
  --secondary: #6c5ce7;
  --success: #00cec9;
  --warning: #fdcb6e;
  --danger: #ff7675;
  --dark: #2d3436;
  --darker: #1e2229;
  --light: #f5f6fa;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
body {
  background: linear-gradient(135deg, var(--darker) 0%, #2c3e50 100%);
  color: var(--light);
  min-height: 100vh;
  padding: 20px;
}
.experiment-editor {
  max-width: 1300px;
  margin: 0 auto;
  background: rgba(30, 34, 41, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.editor-header {
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  padding: 25px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.editor-header h1 {
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 15px;
}
.editor-header h1 i {
  background: rgba(255, 255, 255, 0.2);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.editor-content {
  display: flex;
  min-height: 700px;
}
.editor-sidebar {
  width: 300px;
  background: rgba(40, 44, 52, 0.8);
  padding: 25px 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
.editor-main {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
}
.nav-item {
  padding: 18px 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
}
.nav-item:hover, .nav-item.active {
  background: rgba(93, 120, 255, 0.15);
  border-left: 4px solid var(--primary);
}
.nav-item i {
  width: 24px;
  text-align: center;
  font-size: 18px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.section-title h2 {
  font-size: 24px;
  font-weight: 600;
}
.section-title i {
  background: var(--primary);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}
.form-card {
  background: rgba(50, 55, 65, 0.6);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s;
}
.form-card:hover {
  transform: translateY(-5px);
  border-color: rgba(93, 120, 255, 0.3);
}
.form-card h3 {
  font-size: 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--primary);
}
.el-form-item {
  margin-bottom: 22px;
}
.param-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.param-item .el-input {
  flex: 1;
}
.add-param {
  width: 100%;
  margin-top: 10px;
}
.preview-panel {
  background: rgba(50, 55, 65, 0.8);
  border-radius: 15px;
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.preview-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.preview-content {
  display: flex;
  gap: 25px;
  flex: 1;
}
.scene-view {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.scene-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(93, 120, 255, 0.1) 0%, transparent 70%);
  z-index: 1;
}
.lab-equipment {
  position: relative;
  z-index: 2;
  text-align: center;
  min-width: 320px;
  min-height: 220px;
}
.data-panel {
  width: 300px;
  background: rgba(40, 44, 52, 0.8);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.data-panel h3 {
  margin-bottom: 20px;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 10px;
}
.data-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.data-value {
  color: var(--success);
  font-weight: bold;
}
.chart-container {
  height: 200px;
  margin-top: 20px;
}
.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(40, 44, 52, 0.8);
}
.el-button {
  padding: 12px 28px;
  font-size: 16px;
  border-radius: 10px;
  transition: all 0.3s;
  font-weight: 600;
}
.el-button--primary {
  background: var(--primary);
  border: none;
}
.el-button--primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(93, 120, 255, 0.4);
}
.el-button--success {
  background: var(--success);
  border: none;
}
.el-button--success:hover {
  background: #00b5ad;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 206, 201, 0.4);
}
.floating-stats {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 15px;
  z-index: 3;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.stat-value {
  font-weight: bold;
  color: var(--warning);
}
.mock-students {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 3;
}
.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(108, 92, 231, 0.5);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(108, 92, 231, 0); }
  100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0); }
}
.record-indicator {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 118, 117, 0.2);
  padding: 8px 15px;
  border-radius: 30px;
  z-index: 3;
  border: 1px solid var(--danger);
}
.rec-dot {
  width: 12px;
  height: 12px;
  background: var(--danger);
  border-radius: 50%;
  animation: blink 1.5s infinite;
}
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}
.experiment-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  color: var(--warning);
}
.experiment-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  line-height: 1.6;
}
.experiment-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
</style>