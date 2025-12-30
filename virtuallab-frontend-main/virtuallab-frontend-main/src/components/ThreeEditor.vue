<template>
  <div class="three-editor-container">
    <!-- 顶部工具栏 -->
    <div class="editor-header" v-show="!previewMode">
      <div class="header-left">
        <el-select v-model="currentScene" placeholder="选择场景" size="small" style="width: 150px">
          <el-option v-for="scene in sceneList" :key="scene.name" :label="scene.name" :value="scene.name" />
        </el-select>
        <el-button @click="showNewSceneDialog = true" size="small" icon="Plus">新建场景</el-button>
        <el-upload ref="modelUpload" :auto-upload="false" action="" :on-change="handleModelUpload" :show-file-list="false">
          <el-button size="small" icon="Upload">导入模型</el-button>
        </el-upload>
        <el-button @click="showTemplateDialog = true" size="small" icon="Folder">导入模板</el-button>
      </div>
      <div class="header-right">
        <el-button @click="exportScene" size="small" icon="Download">导出</el-button>
        <el-button @click="saveScene" size="small" icon="Document">保存</el-button>
        <el-button @click="togglePreview" size="small" icon="View">{{ previewMode ? '编辑' : '预览' }}</el-button>
      </div>
    </div>

    <!-- 操作模式工具栏 -->
    <div class="mode-toolbar" v-show="!previewMode">
      <el-radio-group v-model="currentMode" size="small" @change="handleModeChange">
        <el-radio-button label="选择" value="select" />
        <el-radio-button label="平移" value="translate" />
        <el-radio-button label="旋转" value="rotate" />
        <el-radio-button label="缩放" value="scale" />
      </el-radio-group>
    </div>

    <!-- 左侧工具面板 -->
    <div class="left-panel" v-show="!previewMode && leftPanelVisible">
      <div class="panel-header">
        <h4>工具面板</h4>
        <el-button @click="leftPanelVisible = false" size="small" icon="Close" />
      </div>
      <div class="panel-content">
        <el-tabs v-model="activeTab" type="card">
          <el-tab-pane label="几何体" name="geometry">
            <div class="tool-buttons">
              <el-button @click="addCube" size="small" block>立方体</el-button>
              <el-button @click="addSphere" size="small" block>球体</el-button>
              <el-button @click="addCylinder" size="small" block>圆柱体</el-button>
              <el-button @click="addPlane" size="small" block>平面</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="光源" name="lights">
            <div class="tool-buttons">
              <el-button @click="addAmbientLight" size="small" block>环境光</el-button>
              <el-button @click="addDirectionalLight" size="small" block>方向光</el-button>
              <el-button @click="addPointLight" size="small" block>点光源</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="场景" name="scene">
            <div class="tool-buttons">
              <el-button @click="resetCamera" size="small" block>重置视角</el-button>
              <el-button @click="addGridHelper" size="small" block>网格辅助</el-button>
              <el-button @click="clearScene" size="small" block>清空场景</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 左侧面板切换按钮 -->
    <div class="panel-toggle left-toggle" @click="leftPanelVisible = !leftPanelVisible">
      <el-icon><Expand v-if="!leftPanelVisible" /><Fold v-else /></el-icon>
    </div>

    <!-- 右侧属性面板 -->
    <div class="right-panel" v-show="!previewMode && rightPanelVisible">
      <div class="panel-header">
        <h4>属性面板</h4>
        <el-button @click="rightPanelVisible = false" size="small" icon="Close" />
      </div>
      <div class="panel-content">
        <div v-if="selectedObject">
          <h5>选中对象: {{ selectedObject.name || '未命名' }}</h5>
          <div class="transform-controls">
            <h6>位置</h6>
            <div class="input-group">
              <label>X:</label>
              <el-input-number v-model="selectedObject.position.x" size="small" @change="updateObjectTransform" />
              <label>Y:</label>
              <el-input-number v-model="selectedObject.position.y" size="small" @change="updateObjectTransform" />
              <label>Z:</label>
              <el-input-number v-model="selectedObject.position.z" size="small" @change="updateObjectTransform" />
            </div>
            
            <h6>旋转</h6>
            <div class="input-group">
              <label>X:</label>
              <el-input-number v-model="selectedObject.rotation.x" size="small" @change="updateObjectTransform" />
              <label>Y:</label>
              <el-input-number v-model="selectedObject.rotation.y" size="small" @change="updateObjectTransform" />
              <label>Z:</label>
              <el-input-number v-model="selectedObject.rotation.z" size="small" @change="updateObjectTransform" />
            </div>
            
            <h6>缩放</h6>
            <div class="input-group">
              <label>X:</label>
              <el-input-number v-model="selectedObject.scale.x" size="small" @change="updateObjectTransform" />
              <label>Y:</label>
              <el-input-number v-model="selectedObject.scale.y" size="small" @change="updateObjectTransform" />
              <label>Z:</label>
              <el-input-number v-model="selectedObject.scale.z" size="small" @change="updateObjectTransform" />
            </div>

            <h6>材质</h6>
            <div class="material-controls">
              <el-color-picker v-model="materialColor" @change="updateMaterial" />
              <el-slider v-model="materialOpacity" :min="0" :max="1" :step="0.1" @change="updateMaterial" />
              <el-checkbox v-model="materialTransparent" @change="updateMaterial">透明</el-checkbox>
            </div>
          </div>
        </div>
        <div v-else>
          <p>未选中任何对象</p>
        </div>
      </div>
    </div>

    <!-- 右侧面板切换按钮 -->
    <div class="panel-toggle right-toggle" @click="rightPanelVisible = !rightPanelVisible">
      <el-icon><Expand v-if="!rightPanelVisible" /><Fold v-else /></el-icon>
    </div>

    <!-- 3D场景容器 -->
    <div class="scene-container" ref="sceneContainer" @click="handleSceneClick"></div>

    <!-- 新建场景对话框 -->
    <el-dialog v-model="showNewSceneDialog" title="新建场景" width="400px">
      <el-form :model="newSceneForm" label-width="80px">
        <el-form-item label="场景名称" required>
          <el-input v-model="newSceneForm.name" placeholder="请输入场景名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewSceneDialog = false">取消</el-button>
        <el-button type="primary" @click="createNewScene">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTemplateDialog" title="选择模板" width="400px">
      <div class="template-list">
        <el-button
          v-for="tpl in templateList"
          :key="tpl"
          @click="importTemplate(tpl)"
          link
          style="margin: 4px 4px 4px 0"
        >
          {{ tpl }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Expand, Fold } from '@element-plus/icons-vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

// Props
const props = defineProps({
  experimentName: {
    type: String,
    default: '实验场景'
  },
  subject: {
    type: String,
    default: 'physics'
  },
  experimentParams: {
    type: Object,
    default: () => ({
      gravity: 9.8,
      friction: 0.3,
      elasticity: 0.8,
      simulationSpeed: 1.0
    })
  },
  experimentDesc: {
    type: String,
    default: ''
  },
  experimentDifficulty: {
    type: String,
    default: 'medium'
  },
  targetGrades: {
    type: Array,
    default: () => []
  },
  experimentTags: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['scene-export', 'scene-change', 'model-import'])

// 响应式数据
const sceneContainer = ref<HTMLElement>()
const currentScene = ref('默认场景')
const sceneList = ref([{ name: '默认场景' }])
const currentMode = ref('select')
const previewMode = ref(false)
const leftPanelVisible = ref(true)
const rightPanelVisible = ref(true)
const activeTab = ref('geometry')
const selectedObject = ref<any>(null)
const materialColor = ref('#ffffff')
const materialOpacity = ref(1)
const materialTransparent = ref(false)
const showNewSceneDialog = ref(false)
const newSceneForm = ref({ name: '' })
const templateList = [
  '雾.json',
  '飞机.json',
  '辅助工具配置.json',
  '裁剪.json',
  '视频.json',
  '贴图与投影.json',
  '自定义后期处理扩展.json',
  '自定义3d组件镜子.json',
  '组合地图.json',
  '绘制.json',
  '粒子.json',
  '狩猎.json',
  '此案例测试自定义动画.json',
  '物体材质形状编辑.json',
  '模型动画.json',
  '机房2.json',
  '机房.json',
  '智慧城市扫光.json',
  '文字.json',
  '无限扩展集成着色器.json',
  '搭建场景.json',
  '拓扑.json',
  '奔跑的狐狸.json',
  '天空和环境.json',
  '天高任鸟飞.json',
  '大鹅.json',
  '多种后期处理配置.json',
  '地球.json',
  '地图2.json',
  '地图.json'
];
const showTemplateDialog = ref(false);

// Three.js 相关
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let transformControls: TransformControls
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2

// 初始化Three.js场景
function initThreeJS() {
  if (!sceneContainer.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a1a)

  // 创建相机
  const container = sceneContainer.value
  const aspect = container.clientWidth / container.clientHeight
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
  camera.position.set(5, 5, 5)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // 创建变换控制器
  transformControls = new TransformControls(camera, renderer.domElement)
  transformControls.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })
  scene.add(transformControls)

  // 创建射线检测器
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // 添加默认光源和网格
  addDefaultLights()
  addGridHelper()

  // 开始渲染循环
  animate()

  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize)
}

// 添加默认光源
function addDefaultLights() {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)
}

// 添加网格辅助线
function addGridHelper() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const gridHelper = new THREE.GridHelper(20, 20)
  scene.add(gridHelper)
}

// 渲染循环
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

// 窗口大小变化处理
function onWindowResize() {
  if (!sceneContainer.value) return
  
  const container = sceneContainer.value
  const aspect = container.clientWidth / container.clientHeight
  
  camera.aspect = aspect
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

// 模式切换处理
function handleModeChange(mode: string) {
  currentMode.value = mode
  
  if (mode === 'select') {
    transformControls.detach()
  } else {
    transformControls.setMode(mode)
    if (selectedObject.value) {
      transformControls.attach(selectedObject.value)
    }
  }
}

// 场景点击处理
function handleSceneClick(event: MouseEvent) {
  if (!sceneContainer.value) return

  const rect = sceneContainer.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    const object = intersects[0].object
    if (object.type !== 'GridHelper' && object.type !== 'DirectionalLight' && object.type !== 'AmbientLight') {
      selectedObject.value = object
      if (currentMode.value !== 'select') {
        transformControls.attach(object)
      }
    }
  } else {
    selectedObject.value = null
    transformControls.detach()
  }
}

// 几何体添加函数
function addCube() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(0, 0.5, 0)
  cube.castShadow = true
  cube.receiveShadow = true
  cube.name = '立方体_' + Date.now()
  scene.add(cube)
  selectedObject.value = cube
  ElMessage.success('添加立方体成功')
}

function addSphere() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const geometry = new THREE.SphereGeometry(0.5, 32, 32)
  const material = new THREE.MeshLambertMaterial({ color: 0xff0000 })
  const sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(0, 0.5, 0)
  sphere.castShadow = true
  sphere.receiveShadow = true
  sphere.name = '球体_' + Date.now()
  scene.add(sphere)
  selectedObject.value = sphere
  ElMessage.success('添加球体成功')
}

function addCylinder() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
  const material = new THREE.MeshLambertMaterial({ color: 0x0000ff })
  const cylinder = new THREE.Mesh(geometry, material)
  cylinder.position.set(0, 0.5, 0)
  cylinder.castShadow = true
  cylinder.receiveShadow = true
  cylinder.name = '圆柱体_' + Date.now()
  scene.add(cylinder)
  selectedObject.value = cylinder
  ElMessage.success('添加圆柱体成功')
}

function addPlane() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const geometry = new THREE.PlaneGeometry(5, 5)
  const material = new THREE.MeshLambertMaterial({ color: 0x808080 })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = -Math.PI / 2
  plane.receiveShadow = true
  plane.name = '平面_' + Date.now()
  scene.add(plane)
  selectedObject.value = plane
  ElMessage.success('添加平面成功')
}

// 光源添加函数
function addAmbientLight() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const light = new THREE.AmbientLight(0x404040, 0.6)
  light.name = '环境光_' + Date.now()
  scene.add(light)
  ElMessage.success('添加环境光成功')
}

function addDirectionalLight() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const light = new THREE.DirectionalLight(0xffffff, 0.8)
  light.position.set(10, 10, 5)
  light.castShadow = true
  light.name = '方向光_' + Date.now()
  scene.add(light)
  ElMessage.success('添加方向光成功')
}

function addPointLight() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(0, 5, 0)
  light.name = '点光源_' + Date.now()
  scene.add(light)
  ElMessage.success('添加点光源成功')
}

function resetCamera() {
  if (!scene || !camera || !controls) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  camera.position.set(5, 5, 5)
  controls.target.set(0, 0, 0)
  ElMessage.success('视角已重置')
}

function clearScene() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  // 保留光源和网格
  const objectsToRemove = scene.children.filter(child => 
    child.type !== 'GridHelper' && 
    child.type !== 'DirectionalLight' && 
    child.type !== 'AmbientLight' &&
    child !== transformControls
  )
  
  objectsToRemove.forEach(obj => scene.remove(obj))
  selectedObject.value = null
  transformControls.detach()
  ElMessage.success('场景已清空')
}

// 材质更新
function updateMaterial() {
  if (selectedObject.value && selectedObject.value.material) {
    selectedObject.value.material.color.setHex(materialColor.value.replace('#', '0x'))
    selectedObject.value.material.opacity = materialOpacity.value
    selectedObject.value.material.transparent = materialTransparent.value
    selectedObject.value.material.needsUpdate = true
  }
}

// 对象变换更新
function updateObjectTransform() {
  if (selectedObject.value) {
    selectedObject.value.position.set(
      selectedObject.value.position.x,
      selectedObject.value.position.y,
      selectedObject.value.position.z
    )
    selectedObject.value.rotation.set(
      selectedObject.value.rotation.x,
      selectedObject.value.rotation.y,
      selectedObject.value.rotation.z
    )
    selectedObject.value.scale.set(
      selectedObject.value.scale.x,
      selectedObject.value.scale.y,
      selectedObject.value.scale.z
    )
  }
}

// 场景管理
function createNewScene() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  if (!newSceneForm.value.name) {
    ElMessage.error('请输入场景名称')
    return
  }
  
  currentScene.value = newSceneForm.value.name
  sceneList.value.push({ name: newSceneForm.value.name })
  showNewSceneDialog.value = false
  newSceneForm.value.name = ''
  
  // 清空当前场景
  clearScene()
  
  ElMessage.success('新建场景成功')
}

function saveScene() {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  const sceneData = {
    name: currentScene.value,
    objects: scene.children.map(child => {
      if (child.type === 'Mesh') {
        return {
          type: 'Mesh',
          name: child.name,
          geometry: child.geometry.type,
          material: {
            color: child.material.color.getHexString(),
            opacity: child.material.opacity,
            transparent: child.material.transparent
          },
          position: child.position.toArray(),
          rotation: child.rotation.toArray(),
          scale: child.scale.toArray()
        }
      }
      return null
    }).filter(Boolean)
  }
  
  localStorage.setItem(`scene_${currentScene.value}`, JSON.stringify(sceneData))
  ElMessage.success('场景保存成功')
  emit('scene-change', sceneData)
}

function exportScene() {
  if (!scene) {
    console.warn('ThreeEditor: scene 不存在，返回空对象');
    return {
      name: currentScene?.value || '',
      experimentName: props.experimentName,
      subject: props.subject,
      experimentParams: props.experimentParams,
      experimentDesc: props.experimentDesc,
      experimentDifficulty: props.experimentDifficulty,
      targetGrades: props.targetGrades,
      experimentTags: props.experimentTags,
      objects: [],
      exportTime: new Date().toISOString()
    };
  }
  const objects = scene.children.map(child => {
    if (child.type === 'Mesh') {
      return {
        type: 'Mesh',
        name: child.name,
        geometry: child.geometry?.type || '',
        material: {
          color: child.material?.color?.getHexString?.() || 'ffffff',
          opacity: child.material?.opacity ?? 1,
          transparent: child.material?.transparent ?? false
        },
        position: child.position?.toArray?.() || [0,0,0],
        rotation: child.rotation?.toArray?.() || [0,0,0],
        scale: child.scale?.toArray?.() || [1,1,1]
      }
    }
    return null;
  }).filter(Boolean);
  return {
    name: currentScene?.value || '',
    experimentName: props.experimentName,
    subject: props.subject,
    experimentParams: props.experimentParams,
    experimentDesc: props.experimentDesc,
    experimentDifficulty: props.experimentDifficulty,
    targetGrades: props.targetGrades,
    experimentTags: props.experimentTags,
    objects,
    exportTime: new Date().toISOString()
  };
}

function togglePreview() {
  previewMode.value = !previewMode.value
  if (previewMode.value) {
    leftPanelVisible.value = false
    rightPanelVisible.value = false
  }
}

// 模型导入处理
function handleModelUpload(fileInfo: any) {
  if (!scene) {
    ElMessage.error('3D场景尚未初始化，请稍后再试');
    return;
  }
  let file = fileInfo.raw || fileInfo;
  const fileName = file.name.toLowerCase();
  let loader;
  if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
    loader = new GLTFLoader();
  } else if (fileName.endsWith('.fbx')) {
    loader = new FBXLoader();
  } else if (fileName.endsWith('.obj')) {
    loader = new OBJLoader();
  } else {
    ElMessage.error('仅支持glb/gltf/fbx/obj格式的模型');
    return;
  }
  const url = URL.createObjectURL(file);
  loader.load(url, (gltfOrObj: any) => {
    let model;
    if (gltfOrObj.scene) {
      model = gltfOrObj.scene;
    } else if (gltfOrObj.isObject3D) {
      model = gltfOrObj;
    } else {
      ElMessage.error('模型格式不支持');
      return;
    }
    model.name = file.name;
    scene.add(model);
    selectedObject.value = model;
    ElMessage.success('模型导入成功');
    emit('model-import', file);
  }, undefined, (err: any) => {
    ElMessage.error('模型导入失败: ' + err.message);
  });
}

// 移除原生编辑器相关逻辑
function importTemplate(templateName: string) {
  fetch(`/files/editorJson/${templateName}`)
    .then(res => res.json())
    .then(data => {
      if (data && (data.modelList || data.lighting || data.scene)) {
        createSceneFromNative(data)
      } else {
        createScene(data)
      }
      showTemplateDialog.value = false
      ElMessage.success('模板导入成功')
    })
    .catch(() => {
      ElMessage.error('模板导入失败')
    })
}

// 在createSceneFromNative外部创建dracoLoader实例，避免重复创建
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/') // public/draco/ 目录下有draco_decoder.js/wasm

function createSceneFromNative(data: any) {
  if (!scene) return
  clearScene()
  // 1. 灯光
  if (Array.isArray(data.lighting)) {
    data.lighting.forEach((light: any) => {
      let l
      if (light.type === 'AmbientLight') {
        l = new THREE.AmbientLight(light.color || 0xffffff, light.intensity || 1)
      } else if (light.type === 'DirectionalLight') {
        l = new THREE.DirectionalLight(light.color || 0xffffff, light.intensity || 1)
        if (light.position) l.position.set(light.position.x, light.position.y, light.position.z)
      } else if (light.type === 'PointLight') {
        l = new THREE.PointLight(light.color || 0xffffff, light.intensity || 1)
        if (light.position) l.position.set(light.position.x, light.position.y, light.position.z)
      }
      if (l) scene.add(l)
    })
  }
  // 2. 天空盒
  if (data.scene && Array.isArray(data.scene.backgroundUrls) && data.scene.backgroundUrls.length === 6) {
    const loader = new THREE.CubeTextureLoader()
    loader.load(data.scene.backgroundUrls, texture => {
      scene.background = texture
    }, undefined, err => {
      alert('天空盒加载失败: ' + err.message)
    })
  }
  // 3. 通用mesh组还原函数，支持远程GLB
  function restoreMeshList(meshList: any[]) {
    meshList.forEach((model: any) => {
      if (model.rootInfo && model.rootInfo.url) {
        const url = model.rootInfo.url
        if (url.endsWith('.glb') || url.endsWith('.gltf')) {
          const loader = new GLTFLoader()
          loader.setDRACOLoader(dracoLoader)
          loader.load(url, gltf => {
            const obj = gltf.scene
            if (model.group && model.group.position) obj.position.set(model.group.position.x, model.group.position.y, model.group.position.z)
            if (model.group && model.group.rotation) obj.rotation.set(model.group.rotation.x, model.group.rotation.y, model.group.rotation.z)
            if (model.group && model.group.scale) obj.scale.set(model.group.scale.x, model.group.scale.y, model.group.scale.z)
            scene.add(obj)
          }, undefined, err => {
            alert('GLB模型加载失败: ' + err.message)
          })
        } else if (url.endsWith('.fbx')) {
          const loader = new FBXLoader()
          loader.load(url, obj => {
            if (model.group && model.group.position) obj.position.set(model.group.position.x, model.group.position.y, model.group.position.z)
            if (model.group && model.group.rotation) obj.rotation.set(model.group.rotation.x, model.group.rotation.y, model.group.rotation.z)
            if (model.group && model.group.scale) obj.scale.set(model.group.scale.x, model.group.scale.y, model.group.scale.z)
            scene.add(obj)
          }, undefined, err => {
            alert('FBX模型加载失败: ' + err.message)
          })
        } else if (url.endsWith('.obj')) {
          const loader = new OBJLoader()
          loader.load(url, obj => {
            if (model.group && model.group.position) obj.position.set(model.group.position.x, model.group.position.y, model.group.position.z)
            if (model.group && model.group.rotation) obj.rotation.set(model.group.rotation.x, model.group.rotation.y, model.group.rotation.z)
            if (model.group && model.group.scale) obj.scale.set(model.group.scale.x, model.group.scale.y, model.group.scale.z)
            scene.add(obj)
          }, undefined, err => {
            alert('OBJ模型加载失败: ' + err.message)
          })
        }
      } else if (model.geometry && model.material) {
        let geometry, material
        if (model.geometry.type === 'BoxGeometry') {
          geometry = new THREE.BoxGeometry(...(model.geometry.args || [1,1,1]))
        } else if (model.geometry.type === 'SphereGeometry') {
          geometry = new THREE.SphereGeometry(...(model.geometry.args || [0.5,32,32]))
        }
        material = new THREE.MeshLambertMaterial({ color: model.material.color || 0xffffff })
        const mesh = new THREE.Mesh(geometry, material)
        if (model.position) mesh.position.set(model.position.x, model.position.y, model.position.z)
        if (model.rotation) mesh.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z)
        if (model.scale) mesh.scale.set(model.scale.x, model.scale.y, model.scale.z)
        scene.add(mesh)
      }
    })
  }
  // 4. 还原所有mesh组
  const meshGroups = [
    'modelList', 'geoGroupList', 'designMeshList', 'drawMeshList', 'innerMeshList', 'borderGroupList'
  ]
  meshGroups.forEach(groupName => {
    if (Array.isArray(data[groupName])) {
      restoreMeshList(data[groupName])
    }
  })
  // 5. 粒子
  if (Array.isArray(data.particleList)) {
    data.particleList.forEach((particle: any) => {
      if (particle.geometry && particle.material) {
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(particle.geometry.positions, 3))
        const material = new THREE.PointsMaterial({ color: particle.material.color || 0xffffff, size: particle.material.size || 1 })
        const points = new THREE.Points(geometry, material)
        scene.add(points)
      }
    })
  }
  // 6. 文字（支持远程字体）
  if (Array.isArray(data.textMeshList)) {
    data.textMeshList.forEach((text: any) => {
      if (text.fontLink) {
        const fontLoader = new THREE.FontLoader()
        fontLoader.load(text.fontLink, font => {
          const geometry = new THREE.TextGeometry(text.text || '', {
            font,
            size: text.geometry?.parameters?.size || 1,
            height: text.geometry?.parameters?.height || 0.2,
            curveSegments: text.geometry?.parameters?.curveSegments || 12,
            bevelEnabled: text.geometry?.parameters?.bevelEnabled || false,
            bevelThickness: text.geometry?.parameters?.bevelThickness || 0,
            bevelSize: text.geometry?.parameters?.bevelSize || 0,
            bevelSegments: text.geometry?.parameters?.bevelSegments || 5
          })
          const material = new THREE.MeshBasicMaterial({ color: text.material?.color || 0xffffff })
          const mesh = new THREE.Mesh(geometry, material)
          if (text.position) mesh.position.set(text.position.x, text.position.y, text.position.z)
          if (text.rotation) mesh.rotation.set(text.rotation.x, text.rotation.y, text.rotation.z)
          if (text.scale) mesh.scale.set(text.scale.x, text.scale.y, text.scale.z)
          scene.add(mesh)
        }, undefined, err => {
          alert('字体加载失败: ' + err.message)
        })
      } else {
        // 兼容旧逻辑
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        ctx.font = '24px Arial'
        ctx.fillStyle = '#fff'
        ctx.fillText(text.text || '', 0, 24)
        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({ map: texture })
        const sprite = new THREE.Sprite(material)
        if (text.position) sprite.position.set(text.position.x, text.position.y, text.position.z)
        scene.add(sprite)
      }
    })
  }
  // 7. 场景背景/雾
  if (data.scene) {
    if (data.scene.backgroundColor) scene.background = new THREE.Color(data.scene.backgroundColor)
    if (data.scene.fog) {
      scene.fog = new THREE.Fog(
        data.scene.fog.color || 0xffffff,
        data.scene.fog.near || 1,
        data.scene.fog.far || 1000
      )
    }
  }
  // 8. 相机/控制器
  if (data.perspectiveCamera && camera) {
    camera.fov = data.perspectiveCamera.fov || camera.fov
    camera.near = data.perspectiveCamera.near || camera.near
    camera.far = data.perspectiveCamera.far || camera.far
    camera.zoom = data.perspectiveCamera.zoom || camera.zoom
    camera.updateProjectionMatrix()
    if (data.perspectiveCamera.position) {
      camera.position.set(
        data.perspectiveCamera.position.x,
        data.perspectiveCamera.position.y,
        data.perspectiveCamera.position.z
      )
    }
  }
  if (data.orbitControls && controls) {
    if (data.orbitControls.target) {
      controls.target.set(
        data.orbitControls.target.x,
        data.orbitControls.target.y,
        data.orbitControls.target.z
      )
    }
    controls.update()
  }
}

// 获取当前three.js画面截图
function getScreenshot() {
  if (renderer && renderer.domElement) {
    return renderer.domElement.toDataURL('image/png')
  }
  return ''
}

// 优化 createScene，确保场景初始化后再加载数据
let pendingSceneData: any = null

function tryCreateScene(data: any, retry = 0) {
  if (!scene) {
    if (retry < 10) {
      setTimeout(() => tryCreateScene(data, retry + 1), 100)
    } else {
      ElMessage.error('3D场景初始化超时，无法加载模型')
      console.error('3D场景未初始化，createScene失败', data)
    }
    return
  }
  if (data && Array.isArray(data.objects)) {
    clearScene()
    data.objects.forEach((obj: any) => {
      console.log('还原对象', obj)
      let geometry, material
      switch (obj.geometry) {
        case 'BoxGeometry':
          geometry = new THREE.BoxGeometry(1, 1, 1)
          break
        case 'SphereGeometry':
          geometry = new THREE.SphereGeometry(0.5, 32, 32)
          break
        case 'CylinderGeometry':
          geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
          break
        case 'PlaneGeometry':
          geometry = new THREE.PlaneGeometry(5, 5)
          break
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1)
      }
      let color = obj.material?.color || 'ffffff'
      if (!color.startsWith('0x')) color = '0x' + color
      material = new THREE.MeshLambertMaterial({
        color: parseInt(color, 16),
        opacity: obj.material?.opacity ?? 1,
        transparent: obj.material?.transparent ?? false
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = obj.name
      if (Array.isArray(obj.position)) mesh.position.set(...obj.position)
      if (Array.isArray(obj.rotation)) mesh.rotation.set(...obj.rotation.slice(0, 3))
      if (Array.isArray(obj.scale)) mesh.scale.set(...obj.scale)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)
    })
    ElMessage.success('场景加载成功')
  } else {
    ElMessage.error('数据格式错误，未找到 objects 数组');
    console.error('createScene 数据格式错误', data)
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initThreeJS()
    // 如果有待加载的场景数据，初始化后自动加载
    if (pendingSceneData) {
      setTimeout(() => tryCreateScene(pendingSceneData), 200)
      pendingSceneData = null
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (renderer) {
    renderer.dispose()
  }
})

// 暴露方法给父组件
defineExpose({
  exportFile: exportScene,
  createScene: (data: any) => {
    console.log('createScene 被调用', data)
    if (!scene) {
      // 记录待加载数据，等场景初始化后自动加载
      pendingSceneData = data
      ElMessage.info('3D场景未初始化，稍后自动加载...')
      return
    }
    tryCreateScene(data)
  },
  getScreenshot
})
</script>

<style lang="less" scoped>
.three-editor-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  color: #fff;
}

.editor-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #181818;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 100;

  .header-left,
  .header-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.mode-toolbar {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: #181818;
  border-radius: 4px;
  padding: 8px;
  z-index: 100;
}

.left-panel,
.right-panel {
  position: absolute;
  top: 50px;
  width: 280px;
  height: calc(100% - 50px);
  background: #181818;
  border: 1px solid #333;
  z-index: 90;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 12px;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
      color: #fff;
    }
  }

  .panel-content {
    flex: 1;
    padding: 12px;
    overflow-y: auto;

    .tool-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .transform-controls {
      h5, h6 {
        margin: 8px 0 4px 0;
        color: #ccc;
      }

      .input-group {
        display: grid;
        grid-template-columns: 20px 1fr 20px 1fr 20px 1fr;
        gap: 4px;
        align-items: center;
        margin-bottom: 8px;

        label {
          font-size: 12px;
          color: #999;
        }

        .el-input-number {
          width: 100%;
        }
      }

      .material-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
}

.left-panel {
  left: 0;
}

.right-panel {
  right: 0;
}

.panel-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 60px;
  background: #181818;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 95;

  &:hover {
    background: #222;
  }

  .el-icon {
    font-size: 16px;
    color: #fff;
  }
}

.left-toggle {
  left: 0;
  border-radius: 0 4px 4px 0;
}

.right-toggle {
  right: 0;
  border-radius: 4px 0 0 4px;
}

.scene-container {
  width: 100%;
  height: 100%;
  cursor: crosshair;

  canvas {
    display: block;
  }
}

:deep(.el-tabs__content) {
  padding: 12px 0;
}

:deep(.el-card) {
  background: #222;
  border-color: #333;
  color: #fff;

  .el-card__header {
    background: #2a2a2a;
    border-bottom-color: #333;
  }
}

:deep(.el-button) {
  &.el-button--small {
    padding: 6px 12px;
    font-size: 12px;
  }
}

:deep(.el-input-number) {
  .el-input__wrapper {
    background: #333;
    border-color: #555;
  }
}

:deep(.el-slider) {
  .el-slider__runway {
    background: #333;
  }
}

.template-list {
  display: flex;
  flex-wrap: wrap;
}
</style> 