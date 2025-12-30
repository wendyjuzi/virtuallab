import {
  House,
  User,
  UserFilled,
  OfficeBuilding,
  Setting,
  Document,
  DataAnalysis,
  Monitor,
  School,
  Collection,
  Star
} from '@element-plus/icons-vue'
import {useUserStore} from "@/store/user";


// 菜单项接口
export interface MenuItem {
  key: string
  title: string
  path: string
  icon: any
  children?: MenuItem[]
  roles?: string[]
  permissions?: string[]
}

// 根据角色获取菜单配置
export function getMenuByRole(userRole: string): MenuItem[] {

  const useStore = useUserStore();
  const studentId = useStore.user?.studentId

  const baseMenus: MenuItem[] = [
    {
      key: 'dashboard',
      title: '首页',
      path: '/',
      icon: House,
      roles: ['admin', 'teacher', 'student', 'departmentAdmin'],
    },
  
    {
      key: 'profile',
      title: '个人信息',
      path: '/profile',
      icon: User
    }
  ]

  // 根据角色添加特定菜单
  const roleMenus: Record<string, MenuItem[]> = {
    SYSTEM_ADMIN: [
      {
        key: 'admin',
        title: '系统管理',
        path: '/admin',
        icon: Setting,
        children: [
          {
            key: 'create-experiment',
            title: '创建实验',
            path: '/admin/experiment-design',
            icon: Collection
          },
          {
            key: 'user-management',
            title: '用户管理',
            path: '/admin/users',
            icon: UserFilled
          },
          {
            key: 'role-permission',
            title: '角色权限',
            path: '/admin/roles',
            icon: UserFilled
          },
          {
            key: 'department-management',
            title: '院系管理',
            path: '/admin/departments',
            icon: OfficeBuilding
          },
          {
            key: 'system-monitor',
            title: '系统监控',
            path: '/admin/monitor',
            icon: Monitor
          },
          {
            key: 'system-settings',
            title: '系统设置',
            path: '/admin/settings',
            icon: Setting
          },
          {
            key: 'system-logs',
            title: '系统日志',
            path: '/admin/logs',
            icon: Document
          },
          {
            key: 'data-backup',
            title: '数据备份',
            path: '/admin/backup',
            icon: DataAnalysis
          },
          {
            key: 'like-favorite-management',
            title: '点赞收藏管理',
            path: '/admin/like-favorite-management',
            icon: Star
          }
          
        ]
      },
      {
        key: 'lab-management',
        title: '实验室管理',
        path: '/admin/labs',
        icon: Monitor
      },
      {
        key: 'equipment-management',
        title: '设备管理',
        path: '/admin/equipment',
        icon: Setting
      },
      {
        key: 'experiment-management',
        title: '实验管理',
        path: '/admin/experiments/manage',
        icon: Collection
      },
      {
        key: 'report-management',
        title: '报告管理',
        path: '/admin/experiment-report-template-manage',
        icon: Document
      }
    ],
    DEPARTMENT_ADMIN: [
      {
        key: 'department',
        title: '院系管理',
        path: '/department',
        icon: OfficeBuilding,
        children: [
          {
            key: 'department-users',
            title: '用户管理',
            path: '/department/users',
            icon: UserFilled
          },
          {
            key: 'department-labs',
            title: '实验室管理',
            path: '/department/labs',
            icon: Monitor
          },
          // 新增设备管理菜单项
          {
            key: 'department-equipment',
            title: '实验室设备管理',
            path: '/department/equipment',
            icon: Setting
          },
          {
            key: 'department-experiments',
            title: '项目审核',
            path: '/department/project-audit',
            icon: Collection
          },
          {
            key: 'department-reports',
            title: '院系报告',
            path: '/department/reports',
            icon: Document
          }
        ]
      }
    ],
    TEACHER: [
      {
        key: 'teacher',
        title: '教师管理',
        path: '/teacher',
        icon: UserFilled,
        children: [
          {
            key: 'create-experiment',
            title: '创建实验',
            path: '/experiment/create',
            icon: Collection
          },
          // {
          //   key: 'my-experiments',
          //   title: '我的实验',
          //   path: '/teacher/experiments',
          //   icon: Monitor
          // },
          {
            key: 'student-management',
            title: '学生管理',
            path: '/teacher/student-management',
            icon: School
          },
          {
            key: 'report-management',
            title: '查看报告',
            path: '/experiment/teacherReportList',
            icon: Document
          }
        ]
      }
    ],
    STUDENT: [
      {
        key: 'student',
        title: '学生管理',
        path: '/student',
        icon: School,
        children: [
          {
            key: 'my-experiments',
            title: '我的实验',
            path: '/student/experiments',
            icon: Collection
          },
          {
            key: 'my-reports',
            title: '我的报告',
            path: `/experiment/students/${studentId}/reports`,
            icon: Document
          },
          {
            key: 'lab-schedule',
            title: '实验室预约',
            path: '/student/LabReservation',
            icon: Monitor
          },
          {
            key: 'like-favorite',
            title: '点赞收藏',
            path: '/student/like-favorite',
            icon: Star
          }
        ]
      }
    ]
  }

  // 合并基础菜单和角色特定菜单
  const roleSpecificMenus = roleMenus[userRole] || []
  return [...baseMenus, ...roleSpecificMenus]
}

// 获取用户可访问的所有菜单项（扁平化）
export function getFlatMenuByRole(userRole: string): MenuItem[] {
  const menus = getMenuByRole(userRole)
  const flatMenus: MenuItem[] = []
  
  function flattenMenu(items: MenuItem[]) {
    items.forEach(item => {
      flatMenus.push(item)
      if (item.children) {
        flattenMenu(item.children)
      }
    })
  }
  
  flattenMenu(menus)
  return flatMenus
}

// 根据路径获取菜单项
export function getMenuByPath(path: string, userRole: string): MenuItem | null {
  const flatMenus = getFlatMenuByRole(userRole)
  return flatMenus.find(menu => menu.path === path) || null
}

// 获取面包屑导航
export function getBreadcrumb(path: string, userRole: string): MenuItem[] {
  const menus = getMenuByRole(userRole)
  const breadcrumb: MenuItem[] = []
  
  function findPath(items: MenuItem[], targetPath: string): boolean {
    for (const item of items) {
      if (item.path === targetPath) {
        breadcrumb.push(item)
        return true
      }
      if (item.children) {
        breadcrumb.push(item)
        if (findPath(item.children, targetPath)) {
          return true
        }
        breadcrumb.pop()
      }
    }
    return false
  }
  
  findPath(menus, path)
  return breadcrumb
} 