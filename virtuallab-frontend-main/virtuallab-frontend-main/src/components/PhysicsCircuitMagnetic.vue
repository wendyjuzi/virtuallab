<template>
  <div class="circuit-simulation">
    <div ref="container" class="simulation-container"></div>
    <div class="controls">
      <el-form inline label-position="left" label-width="80px">
        <el-form-item label="电源电压(V)">
          <el-input-number v-model="voltage" :min="1" :max="24" :step="0.5"
                           size="small" @change="updateSimulation" />
        </el-form-item>
        <el-form-item label="电阻(Ω)">
          <el-input-number v-model="resistance" :min="1" :max="100" :step="1"
                           size="small" @change="updateSimulation" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-refresh" @click="resetSimulation">
            重置实验
          </el-button>
        </el-form-item>
      </el-form>

      <el-card class="result-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <i class="el-icon-calculator mr-2"></i>实验计算结果
          </div>
        </template>
        <div class="result-item">
          <span class="result-label">电流值:</span>
          <span class="result-value">{{ current.toFixed(2) }} A</span>
        </div>
        <div class="result-item">
          <span class="result-label">电阻功耗:</span>
          <span class="result-value">{{ power.toFixed(2) }} W</span>
        </div>
        <div class="result-item">
          <span class="result-label">理论电流范围:</span>
          <span class="result-value">{{ minCurrent.toFixed(2) }} - {{ maxCurrent.toFixed(2) }} A</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const container = ref<HTMLDivElement | null>(null)
const voltage = ref(5)
const resistance = ref(10)
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let controls: OrbitControls
let wireGroup: THREE.Group, resistor: THREE.Mesh, battery: THREE.Mesh
let currentArrow: THREE.ArrowHelper, electronParticles: THREE.Points
let animationId: number
let composer: EffectComposer
let electronGeometry: THREE.BufferGeometry
let electronPositions: Float32Array

// 计算属性
const current = computed(() => voltage.value / resistance.value)
const power = computed(() => voltage.value * current.value)
const minCurrent = computed(() => voltage.value / 100)
const maxCurrent = computed(() => voltage.value / 1)

// 初始化3D场景
function init() {
  if (renderer && renderer.domElement) {
    container.value?.removeChild(renderer.domElement)
  }

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
      60,
      container.value!.clientWidth / container.value!.clientHeight,
      0.1,
      2000
  )
  camera.position.set(0, 5, 15)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  container.value!.appendChild(renderer.domElement)

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enablePan = false
  controls.maxPolarAngle = Math.PI / 2
  controls.target.set(0, 1, 0)

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 1024
  directionalLight.shadow.mapSize.height = 1024
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 50
  scene.add(directionalLight)

  // 添加网格地面
  const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xeeeeee)
  gridHelper.position.y = -0.1
  scene.add(gridHelper)

  // 创建电路元件
  createCircuitComponents()

  // 初始化后期处理
  initPostProcessing()

  // 开始动画循环
  animate()
}

// 创建电路元件
function createCircuitComponents() {
  // 创建电路组
  wireGroup = new THREE.Group()
  scene.add(wireGroup)

  // 创建电池
  const batteryGeometry = new THREE.BoxGeometry(1.5, 2, 1)
  const batteryMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c })
  battery = new THREE.Mesh(batteryGeometry, batteryMaterial)
  battery.position.set(-6, 1, 0)
  battery.castShadow = true
  battery.receiveShadow = true
  wireGroup.add(battery)

  // 电池正极
  const positiveTerminalGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.6)
  const positiveTerminalMaterial = new THREE.MeshStandardMaterial({ color: 0xf39c12 })
  const positiveTerminal = new THREE.Mesh(positiveTerminalGeometry, positiveTerminalMaterial)
  positiveTerminal.position.set(-6, 2.15, 0)
  positiveTerminal.castShadow = true
  positiveTerminal.receiveShadow = true
  wireGroup.add(positiveTerminal)

  // 电池负极
  const negativeTerminalGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.6)
  const negativeTerminalMaterial = new THREE.MeshStandardMaterial({ color: 0x34495e })
  const negativeTerminal = new THREE.Mesh(negativeTerminalGeometry, negativeTerminalMaterial)
  negativeTerminal.position.set(-6, 0.4, 0)
  negativeTerminal.castShadow = true
  negativeTerminal.receiveShadow = true
  wireGroup.add(negativeTerminal)

  // 创建电阻
  const resistorGeometry = new THREE.BoxGeometry(1, 0.5, 0.8)
  const resistorMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  resistor = new THREE.Mesh(resistorGeometry, resistorMaterial)
  resistor.position.set(6, 1, 0)
  resistor.castShadow = true
  resistor.receiveShadow = true
  wireGroup.add(resistor)

  // 创建导线
  createWires()

  // 创建电流箭头
  createCurrentIndicator()

  // 创建电子粒子系统
  createElectronParticles()
}

// 创建导线
function createWires() {
  const wireMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 })

  // 从电池正极到电阻的导线
  const topWireGeometry = new THREE.BoxGeometry(13, 0.2, 0.4)
  const topWire = new THREE.Mesh(topWireGeometry, wireMaterial)
  topWire.position.set(0, 2.3, 0)
  topWire.castShadow = true
  topWire.receiveShadow = true
  wireGroup.add(topWire)

  // 从电阻到电池负极的导线
  const bottomWireGeometry = new THREE.BoxGeometry(13, 0.2, 0.4)
  const bottomWire = new THREE.Mesh(bottomWireGeometry, wireMaterial)
  bottomWire.position.set(0, 0.3, 0)
  bottomWire.castShadow = true
  bottomWire.receiveShadow = true
  wireGroup.add(bottomWire)

  // 连接电池正极到顶部导线的垂直导线
  const leftVerticalWireGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.4)
  const leftVerticalWire = new THREE.Mesh(leftVerticalWireGeometry, wireMaterial)
  leftVerticalWire.position.set(-5.25, 1.7, 0)
  leftVerticalWire.castShadow = true
  leftVerticalWire.receiveShadow = true
  wireGroup.add(leftVerticalWire)

  // 连接电池负极到底部导线的垂直导线
  const rightVerticalWireGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.4)
  const rightVerticalWire = new THREE.Mesh(rightVerticalWireGeometry, wireMaterial)
  rightVerticalWire.position.set(-5.25, 0.7, 0)
  rightVerticalWire.castShadow = true
  rightVerticalWire.receiveShadow = true
  wireGroup.add(rightVerticalWire)

  // 连接电阻到顶部导线的垂直导线
  const resistorTopVerticalWireGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.4)
  const resistorTopVerticalWire = new THREE.Mesh(resistorTopVerticalWireGeometry, wireMaterial)
  resistorTopVerticalWire.position.set(5.25, 1.7, 0)
  resistorTopVerticalWire.castShadow = true
  resistorTopVerticalWire.receiveShadow = true
  wireGroup.add(resistorTopVerticalWire)

  // 连接电阻到底部导线的垂直导线
  const resistorBottomVerticalWireGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.4)
  const resistorBottomVerticalWire = new THREE.Mesh(resistorBottomVerticalWireGeometry, wireMaterial)
  resistorBottomVerticalWire.position.set(5.25, 0.7, 0)
  resistorBottomVerticalWire.receiveShadow = true
  wireGroup.add(resistorBottomVerticalWire)
}

// 创建电流指示器
function createCurrentIndicator() {
  const direction = new THREE.Vector3(1, 0, 0)
  const origin = new THREE.Vector3(-5, 2.3, 0)
  const length = 10
  const color = 0x00cec9

  currentArrow = new THREE.ArrowHelper(direction, origin, length, color, 0.5, 0.3)
  scene.add(currentArrow)
}

// 创建电子粒子系统
function createElectronParticles() {
  const particleCount = 100
  electronPositions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    // 随机位置在导线上
    const progress = Math.random()
    const yPos = progress < 0.5 ? 2.3 : 0.3
    const xPos = progress < 0.5 ? -5 + progress * 10 : 5 - (progress - 0.5) * 10

    electronPositions[i3] = xPos
    electronPositions[i3 + 1] = yPos
    electronPositions[i3 + 2] = 0
  }

  electronGeometry = new THREE.BufferGeometry()
  electronGeometry.setAttribute('position', new THREE.BufferAttribute(electronPositions, 3))

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x3498db,
    size: 0.15,
    transparent: true,
    opacity: 0.8
  })

  electronParticles = new THREE.Points(electronGeometry, particleMaterial)
  scene.add(electronParticles)
}

// 初始化后期处理效果
function initPostProcessing() {
  const renderPass = new RenderPass(scene, camera)

  const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.value!.clientWidth, container.value!.clientHeight),
      1.0, 0.4, 0.85
  )
  bloomPass.threshold = 0
  bloomPass.strength = 0.8
  bloomPass.radius = 0.4

  const glitchPass = new GlitchPass()
  glitchPass.enabled = false

  composer = new EffectComposer(renderer)
  composer.addPass(renderPass)
  composer.addPass(bloomPass)
  composer.addPass(glitchPass)
}

// 更新电子粒子位置
function updateElectronPositions() {
  const speedFactor = current.value / maxCurrent.value * 0.03

  for (let i = 0; i < electronPositions.length; i += 3) {
    const yPos = electronPositions[i + 1]

    // 根据位置更新x坐标，模拟电子流动
    if (yPos > 1) { // 上导线
      electronPositions[i] += speedFactor
      if (electronPositions[i] > 5) {
        electronPositions[i] = -5
      }
    } else { // 下导线
      electronPositions[i] -= speedFactor
      if (electronPositions[i] < -5) {
        electronPositions[i] = 5
      }
    }
  }

  electronGeometry.attributes.position.needsUpdate = true
}

// 更新电流指示器
function updateCurrentIndicator() {
  const maxCurrentLength = 10
  const currentLength = maxCurrentLength * current.value / maxCurrent.value
  currentArrow.setLength(currentLength, 0.5, 0.3)
}

// 更新仿真
function updateSimulation() {
  updateCurrentIndicator()
}

// 重置仿真
function resetSimulation() {
  voltage.value = 5
  resistance.value = 10
  updateSimulation()
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate)

  // 更新控制器
  controls.update()

  // 更新电子粒子位置
  updateElectronPositions()

  // 渲染场景
  composer.render()
}

// 窗口大小调整处理
function handleResize() {
  if (!container.value) return

  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  composer.setSize(container.value.clientWidth, container.value.clientHeight)
}

onMounted(() => {
  init()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)

  if (renderer) {
    renderer.dispose()
  }
})

watch([voltage, resistance], () => {
  updateSimulation()
})
</script>

<style scoped>
.circuit-simulation {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.simulation-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  overflow: hidden;
}

.controls {
  margin-top: 20px;
  display: flex;
  gap: 20px;
}

.result-card {
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  background-color: #f8fafc;
}

.result-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #eeeeee;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  flex: 1;
  color: #606266;
}

.result-value {
  flex: 1;
  text-align: right;
  font-weight: 500;
  color: #303133;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #303133;
}
</style>