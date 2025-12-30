<template>
  <div class="lab-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>实验室详情</span>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="实验室ID">{{ lab.id }}</el-descriptions-item>
        <el-descriptions-item label="实验室名称">{{ lab.name }}</el-descriptions-item>
        <el-descriptions-item label="实验室编号">{{ lab.code }}</el-descriptions-item>
        <el-descriptions-item label="所属院系">{{ lab.department }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ lab.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="lab.status | statusFilter">
            {{ lab.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ lab.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ lab.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ lab.description }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 设备列表 -->
      <div class="equipment-list">
        <h3>设备列表</h3>
        <el-table :data="equipmentList" border style="width: 100%">
          <el-table-column prop="name" label="设备名称" />
          <el-table-column prop="code" label="设备编号" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status | equipmentStatusFilter">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="text" @click="handleViewEquipment(row.id)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑实验室" v-model="dialogFormVisible">
      <el-form
          ref="dataForm"
          :model="temp"
          label-position="left
        label-width="100px"
      style="width: 400px; margin-left: 50px"
      >
      <el-form-item label="实验室名称" prop="name">
        <el-input v-model="temp.name" />
      </el-form-item>
      <el-form-item label="实验室编号" prop="code">
        <el-input v-model="temp.code" />
      </el-form-item>
      <el-form-item label="所属院系" prop="department">
        <el-select v-model="temp.department" placeholder="请选择">
          <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="位置" prop="location">
        <el-input v-model="temp.location" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="temp.status" placeholder="请选择">
          <el-option label="开放" value="开放" />
          <el-option label="关闭" value="关闭" />
          <el-option label="维修中" value="维修中" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="temp.description" type="textarea" />
      </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateData">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getLabById, updateLab } from '@/api/laboratory'
import { fetchEquipmentList } from '@/api/equipment'

export default {
  name: 'DepartmentLabDetail',
  filters: {
    statusFilter(status) {
      const statusMap = {
        '开放': 'success',
        '关闭': 'info',
        '维修中': 'warning'
      }
      return statusMap[status]
    },
    equipmentStatusFilter(status) {
      const statusMap = {
        '正常': 'success',
        '维修中': 'warning',
        '停用': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      lab: {},
      equipmentList: [],
      departments: ['计算机学院', '机械学院', '电子学院', '化工学院', '生物学院'],
      temp: {
        id: undefined,
        name: '',
        code: '',
        department: '',
        location: '',
        status: '开放',
        description: ''
      },
      dialogFormVisible: false
    }
  },
  created() {
    this.getLab()
    this.getEquipmentList()
  },
  methods: {
    getLab() {
      getLabById(this.$route.params.id).then(response => {
        this.lab = response.data
        this.temp = Object.assign({}, response.data)
      })
    },
    getEquipmentList() {
      fetchEquipmentList({ labId: this.$route.params.id }).then(response => {
        this.equipmentList = response.data.list
      })
    },
    handleEdit() {
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateLab(tempData).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '更新成功',
              type: 'success'
            })
            this.getLab()
          })
        }
      })
    },
    handleViewEquipment(id) {
      this.$router.push({ name: 'DepartmentEquipmentDetail', params: { id } })
    }
  }
}
</script>

<style scoped>
.lab-detail {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.equipment-list {
  margin-top: 30px;
}
</style>