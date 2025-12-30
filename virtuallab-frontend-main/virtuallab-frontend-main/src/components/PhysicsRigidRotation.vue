<template>
  <div class="ramp-simulation">
    <div ref="container" class="simulation-container"></div>
    <div class="controls">
      <el-form inline label-position="left" label-width="80px">
        <el-form-item label="斜面角度(°)">
          <el-input-number v-model="angle" :min="10" :max="60" :step="1"
                           size="small" @change="updateSimulation" />
        </el-form-item>
        <el-form-item label="小球质量(kg)">
          <el-input-number v-model="mass" :min="0.1" :max="10" :step="0.1"
                           size="small" @change="updateSimulation" />
        </el-form-item>
        <el-form-item label="摩擦系数">
          <el-input-number v-model="friction" :min="0" :max="1" :step="0.05"
                           size="small" @change="updateSimulation" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-refresh" @click="resetSimulation">
            重置实验
          </el-button>
          <el-button type="success" icon="el-icon-play" @click="toggleSimulation">
            {{ isPlaying ? '暂停' : '开始' }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-card class="result-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <i class="el-icon-calculator mr-2"></i>物理计算结果
          </div>
        </template>
        <div class="result-item">
          <span class="result-label">重力分力:</span>
          <span class="result-value">{{ gravityForce.toFixed(2) }} N</span>
        </div>
        <div class="result-item">
          <span class="result-label">摩擦力:</span>
          <span class="result-value">{{ frictionForce.toFixed(2) }} N</span>
        </div>
        <div class="result-item">
          <span class="result-label">加速度:</span>
          <span class="result-value">{{ acceleration.toFixed(2) }} m/s²</span>
        </div>
        <div class="result-item">
          <span class="result-label">当前速度:</span>
          <span class="result-value">{{ ballVelocity.toFixed(2) }} m/s</span>
        </div>
        <div class="result-item">
          <span class="result-label">位移:</span>
          <span class="result-value">{{ displacement.toFixed(2) }} m</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, reactive } from 'vue'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

const container = ref<HTMLDivElement | null>(null)
const angle = ref(30)
const mass = ref(1)
const friction = ref(0.2)
const isPlaying = ref(false)

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let world: CANNON.World
let ball: CANNON.Body, ballMesh: THREE.Mesh
let ramp: CANNON.Body, rampMesh: THREE.Mesh
let ground: CANNON.Body, groundMesh: THREE.Mesh
let wall: CANNON.Body, wallMesh: THREE.Mesh
let controls: OrbitControls
let animationId: number
let stats: Stats
let clock: THREE.Clock
let initialPosition: CANNON.Vec3
let simulationTime = ref(0)
let lastPosition: CANNON.Vec3

// 计算属性
const gravityForce = computed(() => mass.value * 9.81 * Math.sin(angle.value * Math.PI / 180))
const frictionForce = computed(() => mass.value * 9.81 * Math.cos(angle.value * Math.PI / 180) * friction.value)
const acceleration = computed(() => (gravityForce.value - frictionForce.value) / mass.value)
const ballVelocity = computed(() => ball ? ball.velocity.length() : 0)
const displacement = computed(() => {
  if (!ball || !initialPosition) return 0
  const dx = ball.position.x - initialPosition.x
  const dy = ball.position.y - initialPosition.y
  return Math.sqrt(dx * dx + dy * dy)
})

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

  // 初始化物理世界
  initPhysicsWorld()

  // 创建场景物体
  createGround()
  createRamp()
  createWall()
  createBall()

  // 添加统计信息
  stats = new Stats()
  // container.value!.appendChild(stats.dom)

  // 初始化时钟
  clock = new THREE.Clock()

  // 开始动画循环
  animate()
}

// 初始化物理世界
function initPhysicsWorld() {
  world = new CANNON.World()
  world.gravity.set(0, -9.81, 0) // 重力加速度

  // 设置物理求解器参数
  world.solver.iterations = 10
  world.solver.tolerance = 0.1

  // 创建材料
  const ballMaterial = new CANNON.Material('ballMaterial')
  const rampMaterial = new CANNON.Material('rampMaterial')

  // 创建接触材料
  const contactMaterial = new CANNON.ContactMaterial(
      ballMaterial,
      rampMaterial,
      {
        friction: friction.value,
        restitution: 0.3
      }
  )

  world.addContactMaterial(contactMaterial)
}

// 创建地面
function createGround() {
  const groundShape = new CANNON.Plane()
  ground = new CANNON.Body({ mass: 0 })
  ground.addShape(groundShape)
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  ground.position.set(0, -0.2, 0)
  world.addBody(ground)

  const groundGeometry = new THREE.PlaneGeometry(20, 20)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    side: THREE.DoubleSide
  })
  groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
  groundMesh.position.copy(ground.position as any)
  groundMesh.quaternion.copy(ground.quaternion as any)
  groundMesh.receiveShadow = true
  scene.add(groundMesh)
}

// 创建斜面
function createRamp() {
  const rampShape = new CANNON.Box(new CANNON.Vec3(5, 0.2, 2))
  ramp = new CANNON.Body({ mass: 0 })
  ramp.addShape(rampShape)
  ramp.position.set(0, 1, 0)
  ramp.quaternion.setFromEuler(-angle.value * Math.PI / 180, 0, 0)
  world.addBody(ramp)

  const rampGeometry = new THREE.BoxGeometry(10, 0.4, 4)
  const rampMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.8
  })
  rampMesh = new THREE.Mesh(rampGeometry, rampMaterial)
  rampMesh.position.copy(ramp.position as any)
  rampMesh.quaternion.copy(ramp.quaternion as any)
  rampMesh.receiveShadow = true
  rampMesh.castShadow = true
  scene.add(rampMesh)
}

// 创建墙壁
function createWall() {
  const wallShape = new CANNON.Box(new CANNON.Vec3(0.2, 2, 2))
  wall = new CANNON.Body({ mass: 0 })
  wall.addShape(wallShape)
  wall.position.set(5, 0, 0)
  world.addBody(wall)

  const wallGeometry = new THREE.BoxGeometry(0.4, 4, 4)
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 })
  wallMesh = new THREE.Mesh(wallGeometry, wallMaterial)
  wallMesh.position.copy(wall.position as any)
  wallMesh.receiveShadow = true
  wallMesh.castShadow = true
  scene.add(wallMesh)
}

// 创建小球
function createBall() {
  const ballShape = new CANNON.Sphere(0.5)
  ball = new CANNON.Body({
    mass: mass.value,
    position: new CANNON.Vec3(-4, 3, 0),
    material: new CANNON.Material('ballMaterial')
  })
  ball.addShape(ballShape)
  ball.linearDamping = 0.01
  world.addBody(ball)

  initialPosition = ball.position.clone()
  lastPosition = ball.position.clone()

  const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32)
  const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d78ff,
    metalness: 0.2,
    roughness: 0.7
  })
  ballMesh = new THREE.Mesh(ballGeometry, ballMaterial)
  ballMesh.position.copy(ball.position as any)
  ballMesh.castShadow = true
  ballMesh.receiveShadow = true

  // 添加球体纹理
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load('https://picsum.photos/200/200?random=1')
  ballMaterial.map = texture

  scene.add(ballMesh)
}

// 更新仿真
function updateSimulation() {
  // 暂停仿真
  isPlaying.value = false

  // 移除旧的斜面和小球
  if (ramp) world.removeBody(ramp)
  if (rampMesh) scene.remove(rampMesh)
  if (ball) world.removeBody(ball)
  if (ballMesh) scene.remove(ballMesh)

  // 创建新的斜面和小球
  createRamp()
  createBall()

  // 更新摩擦系数
  world.contactmaterials.forEach(mat => {
    mat.friction = friction.value
  })
}

// 重置仿真
function resetSimulation() {
  // 重置参数
  angle.value = 30
  mass.value = 1
  friction.value = 0.2

  // 更新仿真
  updateSimulation()
}

// 切换仿真状态
function toggleSimulation() {
  isPlaying.value = !isPlaying.value
}

// 动画循环
function animate() {
  animationId = requestAnimationFrame(animate)

  // 更新控制器
  controls.update()

  // 更新统计信息
  // stats.update()

  // 更新物理世界
  if (isPlaying.value) {
    const delta = clock.getDelta()
    world.step(1/60, delta, 3)
    simulationTime.value += delta

    // 更新小球位置和旋转
    ballMesh.position.copy(ball.position as any)
    ballMesh.quaternion.copy(ball.quaternion as any)

    // 检测碰撞
    if (ball.position.y < -10) {
      resetSimulation()
    }
  }

  // 渲染场景
  renderer.render(scene, camera)
}

// 窗口大小调整处理
function handleResize() {
  if (!container.value) return

  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
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

watch([angle, mass, friction], () => {
  updateSimulation()
})
</script>

<style scoped>
.ramp-simulation {
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