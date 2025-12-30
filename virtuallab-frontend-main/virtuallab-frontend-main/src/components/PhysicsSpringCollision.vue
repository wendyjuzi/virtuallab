<template>
  <div>
    <div ref="container" style="width:400px;height:260px;margin:0 auto"></div>
    <div style="margin-top:10px;">
      <el-form inline>
        <el-form-item label="小球1质量">
          <el-input-number v-model="mass1" :min="0.1" :max="10" :step="0.1" />
        </el-form-item>
        <el-form-item label="小球2质量">
          <el-input-number v-model="mass2" :min="0.1" :max="10" :step="0.1" />
        </el-form-item>
        <el-form-item label="弹簧刚度">
          <el-input-number v-model="springK" :min="1" :max="100" :step="1" />
        </el-form-item>
        <el-button @click="reset">重置实验</el-button>
      </el-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
const container = ref<HTMLDivElement | null>(null)
const mass1 = ref(1)
const mass2 = ref(1)
const springK = ref(20)
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let world: CANNON.World
let ball1: CANNON.Body, ball2: CANNON.Body, mesh1: THREE.Mesh, mesh2: THREE.Mesh, spring: CANNON.Spring
let animationId: number
function init() {
  if (renderer && renderer.domElement) renderer.domElement.remove()
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, 400/260, 0.1, 1000)
  camera.position.z = 10
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(400, 260)
  container.value!.appendChild(renderer.domElement)
  scene.add(new THREE.AmbientLight(0xffffff, 1))
  world = new CANNON.World()
  world.gravity.set(0, 0, 0)
  // 小球1
  ball1 = new CANNON.Body({ mass: mass1.value, position: new CANNON.Vec3(-2, 0, 0) })
  ball1.addShape(new CANNON.Sphere(0.5))
  world.addBody(ball1)
  mesh1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0x5d78ff }))
  scene.add(mesh1)
  // 小球2
  ball2 = new CANNON.Body({ mass: mass2.value, position: new CANNON.Vec3(2, 0, 0) })
  ball2.addShape(new CANNON.Sphere(0.5))
  world.addBody(ball2)
  mesh2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0xfdcb6e }))
  scene.add(mesh2)
  // 弹簧
  spring = new CANNON.Spring(ball1, ball2, { restLength: 2, stiffness: springK.value, damping: 0.1 })
  animate()
}
function animate() {
  animationId = requestAnimationFrame(animate)
  world.step(1/60)
  spring.stiffness = springK.value
  spring.applyForce()
  mesh1.position.copy(ball1.position as any)
  mesh2.position.copy(ball2.position as any)
  renderer.render(scene, camera)
}
function reset() {
  cancelAnimationFrame(animationId)
  init()
}
onMounted(() => { init() })
watch([mass1, mass2, springK], () => { reset() })
</script> 