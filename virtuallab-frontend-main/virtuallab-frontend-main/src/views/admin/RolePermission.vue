<template>
  <div class="role-permission">
    <div class="frosted-wrapper">
      <div class="page-header">
        <h1>角色权限管理</h1>
        <p>管理系统角色和权限配置</p>
      </div>
      <div class="content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="role-card">
              <template #header>
                <div class="card-header">
                  <span>角色管理</span>
                  <el-button type="primary" size="small" @click="showCreateRoleDialog">创建角色</el-button>
                </div>
              </template>
              <el-table :data="roleList" v-loading="roleLoading" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="角色名称" width="120" />
                <el-table-column prop="description" label="描述" />
                <el-table-column label="操作" width="220">
                  <template #default="scope">
                    <el-button size="small" @click="editRole(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteRole(scope.row)">删除</el-button>
                    <el-button size="small" type="success" @click="openAssignDialog(scope.row)">分配权限</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="permission-card">
              <template #header>
                <div class="card-header">
                  <span>权限管理</span>
                  <el-button type="primary" size="small" @click="showCreatePermissionDialog">创建权限</el-button>
                </div>
              </template>
              <el-table :data="permissionList" v-loading="permissionLoading" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="权限名称" width="120" />
                <el-table-column prop="description" label="描述" />
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button size="small" @click="editPermission(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deletePermission(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <!-- 创建角色对话框 -->
      <el-dialog v-model="createRoleDialogVisible" title="创建角色" width="500px">
        <el-form :model="createRoleForm" :rules="createRoleRules" ref="createRoleFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="createRoleForm.name" />
          </el-form-item>
          <el-form-item label="角色描述" prop="description">
            <el-input v-model="createRoleForm.description" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="createRoleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="createRole">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 编辑角色对话框 -->
      <el-dialog v-model="editRoleDialogVisible" title="编辑角色" width="500px">
        <el-form :model="editRoleForm" :rules="createRoleRules" ref="editRoleFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="editRoleForm.name" />
          </el-form-item>
          <el-form-item label="角色描述" prop="description">
            <el-input v-model="editRoleForm.description" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editRoleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="updateRole">保存</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 分配权限对话框 -->
      <el-dialog v-model="assignDialogVisible" title="分配权限" width="400px">
        <el-checkbox-group v-model="selectedPermissionIds">
          <el-checkbox v-for="perm in permissionList" :key="perm.id" :label="perm.id">{{ perm.name }}</el-checkbox>
        </el-checkbox-group>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="assignDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="assignPermissions">保存</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 创建权限对话框 -->
      <el-dialog v-model="createPermissionDialogVisible" title="创建权限" width="500px">
        <el-form :model="createPermissionForm" :rules="createPermissionRules" ref="createPermissionFormRef" label-width="100px">
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="createPermissionForm.name" />
          </el-form-item>
          <el-form-item label="权限描述" prop="description">
            <el-input v-model="createPermissionForm.description" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="createPermissionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="createPermission">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 编辑权限对话框 -->
      <el-dialog v-model="editPermissionDialogVisible" title="编辑权限" width="500px">
        <el-form :model="editPermissionForm" :rules="createPermissionRules" ref="editPermissionFormRef" label-width="100px">
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="editPermissionForm.name" />
          </el-form-item>
          <el-form-item label="权限描述" prop="description">
            <el-input v-model="editPermissionForm.description" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editPermissionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="updatePermission">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRoleList, createRole as apiCreateRole, updateRole as apiUpdateRole, deleteRole as apiDeleteRole,
  getPermissionList, createPermission as apiCreatePermission, updatePermission as apiUpdatePermission, deletePermission as apiDeletePermission,
  assignPermissionsToRole, getRolePermissions
} from '@/api/role'

const roleLoading = ref(false)
const permissionLoading = ref(false)
const roleList = ref<any[]>([])
const permissionList = ref<any[]>([])

// 角色对话框
const createRoleDialogVisible = ref(false)
const editRoleDialogVisible = ref(false)
const createRoleForm = reactive({ name: '', description: '' })
const editRoleForm = reactive({ id: '', name: '', description: '' })
const createRoleFormRef = ref()
const editRoleFormRef = ref()
const createRoleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
}

// 权限对话框
const createPermissionDialogVisible = ref(false)
const editPermissionDialogVisible = ref(false)
const createPermissionForm = reactive({ name: '', description: '' })
const editPermissionForm = reactive({ id: '', name: '', description: '' })
const createPermissionFormRef = ref()
const editPermissionFormRef = ref()
const createPermissionRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入权限描述', trigger: 'blur' }]
}

// 分配权限对话框
const assignDialogVisible = ref(false)
const selectedRole = ref<any>(null)
const selectedPermissionIds = ref<number[]>([])

const loadRoles = async () => {
  roleLoading.value = true
  try {
    const res = await getRoleList()
    if (res.code === 200) {
      roleList.value = res.data
    }
  } finally {
    roleLoading.value = false
  }
}

const loadPermissions = async () => {
  permissionLoading.value = true
  try {
    const res = await getPermissionList()
    if (res.code === 200) {
      permissionList.value = res.data
    }
  } finally {
    permissionLoading.value = false
  }
}

onMounted(() => {
  loadRoles()
  loadPermissions()
})

const showCreateRoleDialog = () => {
  createRoleForm.name = ''
  createRoleForm.description = ''
  createRoleDialogVisible.value = true
}

const createRole = async () => {
  try {
    await apiCreateRole(createRoleForm)
    ElMessage.success('创建角色成功')
    createRoleDialogVisible.value = false
    loadRoles()
  } catch (error) {
    ElMessage.error('创建角色失败')
  }
}

const editRole = (role: any) => {
  editRoleForm.id = role.id
  editRoleForm.name = role.name
  editRoleForm.description = role.description
  editRoleDialogVisible.value = true
}

const updateRole = async () => {
  try {
    await apiUpdateRole(editRoleForm)
    ElMessage.success('更新角色成功')
    editRoleDialogVisible.value = false
    loadRoles()
  } catch (error) {
    ElMessage.error('更新角色失败')
  }
}

const deleteRole = async (role: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 ${role.name} 吗？`,
      '确认删除',
      { type: 'warning' }
    )
    await apiDeleteRole(role.id)
    ElMessage.success('删除成功')
    loadRoles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const openAssignDialog = async (role: any) => {
  selectedRole.value = role
  // 获取该角色已有权限
  const res = await getRolePermissions(role.id)
  if (res.code === 200) {
    selectedPermissionIds.value = res.data.map((p: any) => p.id)
  } else {
    selectedPermissionIds.value = []
  }
  assignDialogVisible.value = true
}

const assignPermissions = async () => {
  if (!selectedRole.value) return
  try {
    await assignPermissionsToRole(selectedRole.value.id, selectedPermissionIds.value)
    ElMessage.success('分配权限成功')
    assignDialogVisible.value = false
  } catch (error) {
    ElMessage.error('分配权限失败')
  }
}

const showCreatePermissionDialog = () => {
  createPermissionForm.name = ''
  createPermissionForm.description = ''
  createPermissionDialogVisible.value = true
}

const createPermission = async () => {
  try {
    await apiCreatePermission(createPermissionForm)
    ElMessage.success('创建权限成功')
    createPermissionDialogVisible.value = false
    loadPermissions()
  } catch (error) {
    ElMessage.error('创建权限失败')
  }
}

const editPermission = (permission: any) => {
  editPermissionForm.id = permission.id
  editPermissionForm.name = permission.name
  editPermissionForm.description = permission.description
  editPermissionDialogVisible.value = true
}

const updatePermission = async () => {
  try {
    await apiUpdatePermission(editPermissionForm)
    ElMessage.success('更新权限成功')
    editPermissionDialogVisible.value = false
    loadPermissions()
  } catch (error) {
    ElMessage.error('更新权限失败')
  }
}

const deletePermission = async (permission: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限 ${permission.name} 吗？`,
      '确认删除',
      { type: 'warning' }
    )
    await apiDeletePermission(permission.id)
    ElMessage.success('删除成功')
    loadPermissions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.role-permission {
  padding: 0;
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.frosted-wrapper {
  background: rgba(236, 236, 255, 0.82);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 32px;
  max-width: 1300px;
  width: 96vw;
  margin: 40px auto 0 auto;
  padding: 36px 32px 32px 32px;
  backdrop-filter: blur(12px);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
  width: 100%;
}
.page-header h1 {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
}
.page-header p {
  font-size: 16px;
  color: #7C3AED;
  margin: 0;
  font-weight: 500;
}

.content {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  width: 100%;
}

.role-card,
.permission-card {
  height: 500px;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(8px);
  padding: 0 0 10px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
.card-header .el-button[type="primary"] {
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px #a18fff44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.card-header .el-button[type="primary"]:hover {
  background: linear-gradient(90deg, #a18fff 0%, #7C3AED 100%);
  box-shadow: 0 6px 24px #7c3aed55;
  transform: scale(1.04);
}

.el-table {
  font-size: 14px;
  border-radius: 14px;
  overflow: hidden;
  background: transparent;
}
.el-table th {
  background: linear-gradient(90deg, #ececff 0%, #a18fff 100%);
  color: #7C3AED;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
}
.el-table tr {
  transition: background 0.2s;
}
.el-table tr:hover {
  background: #f3f0ff !important;
}

/* 对话框美化 */
.el-dialog {
  border-radius: 18px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(8px);
}
.el-dialog__header {
  font-size: 20px;
  font-weight: 800;
  color: #7C3AED;
  letter-spacing: 1px;
}
.el-dialog__footer .el-button[type="primary"] {
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px #a18fff44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-dialog__footer .el-button[type="primary"]:hover {
  background: linear-gradient(90deg, #a18fff 0%, #7C3AED 100%);
  box-shadow: 0 6px 24px #7c3aed55;
  transform: scale(1.04);
}
.el-dialog__body .el-input, .el-dialog__body .el-select {
  border-radius: 10px;
  background: #f8f8ff;
}

@media (max-width: 1400px) {
  .frosted-wrapper {
    max-width: 100vw;
    padding: 24px 4vw 24px 4vw;
  }
}
@media (max-width: 900px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  .role-card, .permission-card {
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
}
@media (max-width: 600px) {
  .frosted-wrapper {
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .role-card, .permission-card {
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .page-header h1 {
    font-size: 20px;
  }
}
</style>