import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 布局组件
import StudentLayout from '@/layouts/StudentLayout.vue'
import TeacherLayout from '@/layouts/TeacherLayout.vue'
import DepartmentLayout from '@/layouts/DepartmentLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

// 页面组件
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Unauthorized from '@/views/Unauthorized.vue'
import UserProfile from '@/views/UserProfile.vue'
// 角色页面
import StudentDashboard from '@/views/student/Student.vue'
import TeacherDashboard from '@/views/teacher/TeacherDashboard.vue'
import DepartmentAdmin from '@/views/admin/DepartmentAdmin.vue'
import SystemAdmin from '@/views/admin/SystemAdmin.vue'

const routes: RouteRecordRaw[] = [
  // 根路径 - 显示Home页面作为子页面
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      }
    ]
  },

  // 不需要布局的页面
  { path: '/login', name: 'Login', component: Login },
  { path: '/unauthorized', name: 'Unauthorized', component: Unauthorized },


  // 学生布局 - 所有学生相关页面都在这个布局下
  {
    path: '/student',
    component: StudentLayout,
    meta: { role: 'STUDENT' },
    children: [
      { path: '', name: 'StudentDashboard', component: StudentDashboard },
      { path: 'home', name: 'StudentHome', component: Home },
      { path: 'profile', name: 'StudentProfile', component: () => import('@/views/UserProfile.vue') },
      { path: 'like-favorite', name: 'LikeFavoriteManagement', component: () => import('@/views/student/LikeFavoriteManagement.vue') },
      { path: 'experiments', name: 'StudentExperiments', component: () => import('@/views/ExperimentsView.vue') },
      { path: 'experiment/:id', name: 'StudentExperimentDetail', component: () => import('@/views/ExperimentDetail.vue')},
      { path: 'reports', name: 'ExperimentReportList', component: () => import('@/views/experiment/reportList.vue')},
      { path: 'experiment/students/:studentId/reports', name: 'ExperimentReportList', component: () => import('@/views/experiment/reportList.vue')}
    ]
  },

  // 教师布局 - 所有教师相关页面都在这个布局下
  {
    path: '/teacher',
    component: TeacherLayout,
    meta: { role: 'TEACHER' },
    children: [
      { path: '', name: 'TeacherDashboard', component: TeacherDashboard },
      { path: 'home', name: 'TeacherHome', component: Home },
      { path: 'profile', name: 'TeacherProfile', component: () => import('@/views/UserProfile.vue')  },
      { path: 'experiments', name: 'TeacherExperiments', component: () => import('@/views/ExperimentsView.vue') },
      { path: 'experiment/create', name: 'ExperimentCreate', component: () => import('@/views/teacher/ExperimentCreate.vue') },
      { path: 'experiment/:id', name: 'TeacherExperimentDetail', component: () => import('@/views/ExperimentDetail.vue') },
      { path: 'project/:projectId/progress', name: 'TeacherProjectProgress', component: () => import('@/views/teacher/project/TeacherProjectProgress.vue') },
      { path: 'physics-experiment-create', name: 'PhysicsExperimentCreate', component: () => import('@/views/teacher/PhysicsExperimentCreate.vue'), meta: { role: 'TEACHER' } },
    ]
  },

  // 院系管理员布局 - 所有院系管理员相关页面都在这个布局下
  {
    path: '/department',
    component: DepartmentLayout,
    meta: { role: 'DEPARTMENT_ADMIN' },
    children: [
      { path: '', name: 'DepartmentAdmin', component: DepartmentAdmin },
      { path: 'home', name: 'DepartmentHome', component: Home },
      { path: 'profile', name: 'DepartmentProfile',component: () => import('@/views/UserProfile.vue')  },
      { path: 'users', name: 'DepartmentUserManagement', component: () => import('@/views/admin/DepartmentUserManagement.vue') },
      { path: 'experiments', name: 'DepartmentExperiments', component: () => import('@/views/ExperimentsView.vue') },
      { path: 'experiment/:id', name: 'DepartmentExperimentDetail', component: () => import('@/views/ExperimentDetail.vue') },
      // 新增设备管理路由
      {
        path: 'equipment',
        name: 'DepartmentEquipmentManagement',
        component: () => import('@/views/admin/DepartmentEquipmentManagement.vue')
      },
      {
        path: 'equipment/:id',
        name: 'DepartmentEquipmentDetail',
        component: () => import('@/views/admin/DepartmentEquipmentDetail.vue')
      },
      // 实验室管理路由
      {
        path: 'labs',
        name: 'DepartmentLabManagement',
        component: () => import('@/views/admin/DepartmentLabManagement.vue')
      },
      {
        path: 'labs/:id',
        name: 'DepartmentLabDetail',
        component: () => import('@/views/admin/DepartmentLabDetail.vue')
      },
      // 项目审核路由
      {
        path: 'project-audit',
        name: 'DepartmentProjectAuditList',
        component: () => import('@/views/admin/ProjectAuditList.vue')
      },
      {
        path: 'project-audit/:projectId',
        name: 'DepartmentProjectAuditDetail',
        component: () => import('@/views/admin/ProjectAuditDetail.vue')
      },
      {
        path: 'project-audit-direct/:projectId',
        name: 'DepartmentProjectAuditDirect',
        component: () => import('@/views/admin/ProjectAuditDirect.vue')
      },
      // 统计报告路由
      {
        path: 'reports',
        name: 'DepartmentReports',
        component: () => import('@/views/admin/DepartmentReports.vue')
      },
    ]
  },

  // 系统管理员布局 - 所有系统管理员相关页面都在这个布局下
  {
    path: '/admin',
    component: AdminLayout,
    meta: { role: 'SYSTEM_ADMIN' },
    children: [
      { path: '', name: 'SystemAdmin', component: SystemAdmin },
      { path: 'home', name: 'AdminHome', component: Home },
      { path: 'profile', name: 'AdminProfile', component: () => import('@/views/UserProfile.vue') },
      { path: 'users', name: 'UserManagement', component: () => import('@/views/admin/UserManagement.vue') },
      { path: 'roles', name: 'RolePermission', component: () => import('@/views/admin/RolePermission.vue') },
      { path: 'departments', name: 'DepartmentManagement', component: () => import('@/views/admin/DepartmentManagement.vue') },
      { path: 'monitor', name: 'SystemMonitor', component: () => import('@/views/admin/SystemMonitor.vue') },
      { path: 'settings', name: 'SystemSettings', component: () => import('@/views/admin/SystemSettings.vue') },
      { path: 'logs', name: 'SystemLogs', component: () => import('@/views/admin/SystemLogs.vue') },
      { path: 'backup', name: 'DataBackup', component: () => import('@/views/admin/DataBackup.vue') },
      { path: 'labs', name: 'LabManagement', component: () => import('@/views/admin/AdminLabManagement.vue') },
      {path: 'equipment', name: 'EquipmentManagement', component: () => import('@/views/admin/AdminEquipmentManagement.vue')},
      { path: 'reports', name: 'ReportManagement', component: () => import('@/views/admin/ReportManagement.vue') },
      { path: 'experiments', name: 'AdminExperiments', component: () => import('@/views/ExperimentsView.vue') },
      { path: 'experiment/:id', name: 'AdminExperimentDetail', component: () => import('@/views/ExperimentDetail.vue') },
      { path: 'experiments/manage', name: 'ExperimentManage', component: () => import('@/views/admin/ExperimentManage.vue'), meta: { title: '实验项目管理', requiresAuth: true } },
      { path: 'resources/manage', name: 'ResourceManage', component: () => import('@/views/admin/ResourceManage.vue'), meta: { title: '资源管理', requiresAuth: true } },
      { path: 'experiment-design', name: 'AdminExperimentDesign', component: () => import('@/views/admin/ExperimentDesign.vue'), meta: { roles: ['SYSTEM_ADMIN'] } },
      { path: 'experiment/publish', name: 'ExperimentPublish', component: () => import('@/views/admin/ExperimentPublish.vue'), meta: { roles: ['SYSTEM_ADMIN'] } },
      { path: 'experiment/detail/:projectId', name: 'ExperimentDetail', component: () => import('@/views/ExperimentDetail.vue'), meta: { roles: ['SYSTEM_ADMIN'] } },
      { path: 'experiment-report-template-manage', name: 'ExperimentReportTemplateManage', component: () => import('@/views/admin/ExperimentReportTemplateManage.vue'), meta: { title: '实验报告模板管理', requiresAuth: true, role: 'SYSTEM_ADMIN' } },
      { path: 'like-favorite-management', name: 'AdminLikeFavoriteManagement', component: () => import('@/views/admin/LikeFavoriteManagement.vue'), meta: { title: '点赞收藏管理', requiresAuth: true, role: 'SYSTEM_ADMIN' } },
     
    ]
  },
  

  // 通用页面（不带布局）
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/profile', name: 'UserProfile', component: UserProfile, meta: { requiresAuth: true } },
  {
    path: '/experiments',
    name: 'Experiments',
    component: () => import('@/views/ExperimentsView.vue') 
  },
  {
    path: '/experiment/:id',
    name: 'ExperimentDetail',
    component: () => import('@/views/ExperimentDetail.vue') // 新建这个页面
  },
  {
    path: '/experiment/create',
    name: 'ExperimentCreate',
    component: () => import('@/views/teacher/ExperimentCreate.vue'),
    meta: { roles: ['ADMIN', 'TEACHER'] }
  },
  {
    path: '/experiment/students/:studentId/reports',
    name: 'ExperimentReportList',
    component: () => import("@/views/experiment/reportList.vue")
  },
  {
    path: '/experiment/teacher/reports',
    name: 'TeacherReportList',
    component: () => import("@/views/experiment/reportList.vue")
  },
  {
    path: '/experiment/report/:sessionId',
    name: 'ExperimentReport',
    component: () => import("@/views/experiment/report.vue")
  },
  // 新增独立3D实验运行页
{
  path: '/experiment-3d-run',
  name: 'Experiment3DRunStandalone',
  component: () => import('@/views/Experiment3DRun.vue')
},
  {
  path: '/teacher/project/:projectId/progress',
  name: 'TeacherProjectProgress',
  component: () => import('@/views/teacher/project/TeacherProjectProgress.vue')
  },
  {
    path:'/student/LabReservation',
    name:'LabReservation',
    component:() => import('@/views/experiment/LabReservation.vue')
  },
  {
    path:'/admin/LabReservation',
    name:'LabManage',
    component:() => import('@/views/LabManage.vue')
  },
  {
    path: '/chat/:teamId',
    name: 'GroupChat',
    component: () => import('@/views/GroupChat.vue')
  },
  {
    path: '/department/project-audit',
    name: 'ProjectAuditList',
    component: () => import('@/views/admin/ProjectAuditList.vue'),
    meta: { requiresAuth: true, role: 'DEPARTMENT_ADMIN' }
  },
  {
    path: '/department/project-audit/:projectId',
    name: 'ProjectAuditDetail',
    component: () => import('@/views/admin/ProjectAuditDetail.vue'),
    meta: { requiresAuth: true, role: 'DEPARTMENT_ADMIN' }
  },
  {
    path: '/admin/audit',
    name: 'AuditDashboard',
    component: () => import('@/views/admin/AuditDashboard.vue'),
    // meta: { requiresAuth: true, role: 'SYSTEM_ADMIN' }
  },
  {
    path: '/department/project-audit-direct/:projectId',
    name: 'ProjectAuditDirect',
    component: () => import('@/views/admin/ProjectAuditDirect.vue'),
    meta: {requiresAuth: true, role: 'DEPARTMENT_ADMIN'}
  },
  {
    path: '/notifications',
    name: 'NotificationCenter',
    component: () => import('@/views/NotificationCenter.vue'),
    meta: { title: '通知中心' }
  },
  {
  path: '/student/chat-rooms',
  name: 'ChatRooms',
  component: () => import('@/views/student/ChatRooms.vue')
  },
  {
    path: '/student/chat-room',
    name: 'GroupChat',
    component: () => import('@/views/GroupChat.vue'),
    props: true  // 这样 route params 会作为 props 传入组件
  },
  {
  path: '/group-result',
  name: 'GroupResult',
  component: () => import('@/views/GroupResult.vue') // 或实际的路径
  },
  {
    path: '/experiment/teacherReport/:sessionId',
    name: 'teacherReport',
    component: () => import('@/views/experiment/teacherReport.vue')
  },
  {
    path: '/experiment/teacherReportList',
    name: 'teacherReportList',
    component: () => import('@/views/experiment/teacherReportList.vue')
  },


  {
    path: '/score/:sessionId',
    name: 'ScorePage',
    component: () => import('@/views/ScorePage.vue')
  },
  // 院系报告路由
  {
    path: '/department/reports',
    name: 'DepartmentReports',
    component: () => import('@/views/admin/DepartmentReports.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['DEPARTMENT_ADMIN']
    }
  },
{
  path: '/teacher/student-management',
  name: 'StudentManagement',
  component: () => import('@/views/teacher/StudentManagement.vue')
},
{
  path: '/statistics',
  name: 'GradeStatistics',
  component: () => import('@/views/teacher/GradeStatistics.vue')
},
{
  path: '/experiment/edit',
  name: 'EditExperiment',
  component: () => import('@/views/teacher/EditExperiment.vue')
},
{
    path: '/student/experiments',
    name: 'StudentExperiments',
    component: () => import('@/views/student/StudentExperiments.vue'),
},

  {
    path: '/student/class',
    name: 'StudentClassSelect',
    component: () => import('@/views/student/StudentClassSelect.vue'),
    meta: { requiresAuth: true, role: 'STUDENT', title: '选择班级' }
  },
  {
    path: '/ShareNotification',
    name: 'ShareNotification',
    component: () => import('@/views/ShareNotification.vue'),
    meta: { requiresAuth: true, title: '分享通知' }
  },
  {
    path: '/ShareManagement',
    name: 'ShareManagement',
    component: () => import('@/views/ShareManagement.vue'),
    meta: { requiresAuth: true, title: '被分享给我的资源' }
  }


]


const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：根据角色权限跳转
import { useUserStore } from '@/store/user'
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 调试信息
  console.log('路由守卫 - 目标路径:', to.path)
  console.log('路由守卫 - 目标meta:', to.meta)
  console.log('路由守卫 - 用户登录状态:', userStore.isLoggedIn)
  console.log('路由守卫 - 用户角色:', userStore.userRole)
  console.log('路由守卫 - 用户信息:', userStore.user)
  
  // 如果访问登录页或未授权页面，直接放行
  if (to.path === '/login' || to.path === '/unauthorized') {
    return next()
  }

  // 如果访问根路径，让重定向逻辑处理
  if (to.path === '/') {
    return next()
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      console.log('路由守卫 - 需要认证但未登录，跳转到登录页')
      return next('/login')
    }
  }

  // 检查角色权限
  if (to.meta.role) {
    console.log('路由守卫 - 需要角色权限:', to.meta.role)
    console.log('路由守卫 - 角色匹配:', userStore.userRole === to.meta.role)
    
    if (!userStore.isLoggedIn || userStore.userRole !== to.meta.role) {
      console.log('路由守卫 - 权限不足，跳转到未授权页面')
      return next('/unauthorized')
    }
  }

  // 如果访问未授权页面，系统管理员直接放行
  if (to.path === '/unauthorized') {
    if (userStore.userRole === 'SYSTEM_ADMIN') {
      return next()
    }
  }
  next()
})

export default router 