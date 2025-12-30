// 权限验证工具函数

export interface Permission {
  resourceId: number
  userId: number
  permission: 'READ' | 'WRITE' | 'ADMIN'
  expireTime?: string
}

// 权限级别枚举
export enum PermissionLevel {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN'
}

// 权限验证类
export class PermissionValidator {
  private permissions: Permission[] = []

  // 设置权限列表
  setPermissions(permissions: Permission[]) {
    this.permissions = permissions
  }

  // 检查用户是否有指定权限
  hasPermission(userId: number, resourceId: number, requiredPermission: PermissionLevel): boolean {
    const permission = this.permissions.find(p => 
      p.userId === userId && 
      p.resourceId === resourceId
    )

    if (!permission) {
      return false
    }

    // 检查权限是否过期
    if (permission.expireTime && new Date(permission.expireTime) < new Date()) {
      return false
    }

    // 权限级别检查
    const permissionLevels = {
      [PermissionLevel.READ]: 1,
      [PermissionLevel.WRITE]: 2,
      [PermissionLevel.ADMIN]: 3
    }

    const userLevel = permissionLevels[permission.permission]
    const requiredLevel = permissionLevels[requiredPermission]

    return userLevel >= requiredLevel
  }

  // 检查用户是否有读取权限
  canRead(userId: number, resourceId: number): boolean {
    return this.hasPermission(userId, resourceId, PermissionLevel.READ)
  }

  // 检查用户是否有写入权限
  canWrite(userId: number, resourceId: number): boolean {
    return this.hasPermission(userId, resourceId, PermissionLevel.WRITE)
  }

  // 检查用户是否有管理员权限
  canAdmin(userId: number, resourceId: number): boolean {
    return this.hasPermission(userId, resourceId, PermissionLevel.ADMIN)
  }

  // 获取用户对指定资源的最高权限
  getUserPermission(userId: number, resourceId: number): PermissionLevel | null {
    const permission = this.permissions.find(p => 
      p.userId === userId && 
      p.resourceId === resourceId
    )

    if (!permission) {
      return null
    }

    // 检查权限是否过期
    if (permission.expireTime && new Date(permission.expireTime) < new Date()) {
      return null
    }

    return permission.permission
  }

  // 检查权限是否即将过期（7天内）
  isPermissionExpiringSoon(userId: number, resourceId: number): boolean {
    const permission = this.permissions.find(p => 
      p.userId === userId && 
      p.resourceId === resourceId
    )

    if (!permission || !permission.expireTime) {
      return false
    }

    const expireDate = new Date(permission.expireTime)
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return expireDate <= sevenDaysFromNow && expireDate > now
  }

  // 获取即将过期的权限列表
  getExpiringPermissions(userId: number): Permission[] {
    return this.permissions.filter(p => 
      p.userId === userId && 
      p.expireTime && 
      this.isPermissionExpiringSoon(userId, p.resourceId)
    )
  }
}

// 创建全局权限验证器实例
export const permissionValidator = new PermissionValidator()

// 权限验证装饰器（用于组件方法）
export function requirePermission(permissionLevel: PermissionLevel) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const userId = args[0]?.userId || args[0]
      const resourceId = args[0]?.resourceId || args[1]

      if (!permissionValidator.hasPermission(userId, resourceId, permissionLevel)) {
        throw new Error(`权限不足：需要 ${permissionLevel} 权限`)
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 权限验证工具函数
export const permissionUtils = {
  // 格式化权限显示
  formatPermission(permission: PermissionLevel): string {
    const permissionNames = {
      [PermissionLevel.READ]: '只读',
      [PermissionLevel.WRITE]: '读写',
      [PermissionLevel.ADMIN]: '管理员'
    }
    return permissionNames[permission] || permission
  },

  // 获取权限颜色
  getPermissionColor(permission: PermissionLevel): string {
    const colors = {
      [PermissionLevel.READ]: '#67C23A',
      [PermissionLevel.WRITE]: '#E6A23C',
      [PermissionLevel.ADMIN]: '#F56C6C'
    }
    return colors[permission] || '#909399'
  },

  // 检查是否为资源创建者
  isResourceCreator(userId: number, resourceCreatorId: number): boolean {
    return userId === resourceCreatorId
  },

  // 检查是否有完整权限（创建者或管理员）
  hasFullPermission(userId: number, resourceId: number, resourceCreatorId: number): boolean {
    return this.isResourceCreator(userId, resourceCreatorId) || 
           permissionValidator.canAdmin(userId, resourceId)
  }
} 