<template>
  <div class="equipment-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备详情</span>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备ID">{{ equipment.id }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ equipment.name }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ equipment.code }}</el-descriptions-item>
        <el-descriptions-item label="所属实验室">{{ equipment.labName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="equipment.status | statusFilter">
            {{ equipment.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ equipment.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ equipment.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ equipment.description }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑设备" v-model="dialogFormVisible">
      <el-form
          ref="dataForm"
          :model="temp"
          label-position="left"
          label-width="100px"
          style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="设备编号" prop="code">
          <el-input v-model="temp.code" />
        </el-form-item>
        <el-form-item label="所属实验室" prop="labId">
          <el-select v-model="temp.labId" placeholder="请选择">
            <el-option
                v-for="lab in laboratories"
                :key="lab.id"
                :label="lab.name"
                :value="lab.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择">
            <el-option label="正常" value="正常" />
            <el-option label="维修中" value="维修中" />
            <el-option label="停用" value="停用" />
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
import { getEquipmentById, updateEquipment } from '@/api/equipment'
import { fetchLaboratoryList } from '@/api/laboratory'

export default {
  name: 'DepartmentEquipmentDetail',
  filters: {
    statusFilter(status) {
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
      equipment: {},
      laboratories: [],
      temp: {
        id: undefined,
        name: '',
        code: '',
        labId: undefined,
        status: '正常',
        description: ''
      },
      dialogFormVisible: false
    }
  },
  created() {
    this.getEquipment()
    this.getLaboratories()
  },
  methods: {
    getEquipment() {
      getEquipmentById(this.$route.params.id).then(response => {
        this.equipment = response.data
        this.temp = Object.assign({}, response.data)
      })
    },
    getLaboratories() {
      fetchLaboratoryList().then(response => {
        this.laboratories = response.data
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
          updateEquipment(tempData).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '更新成功',
              type: 'success'
            })
            this.getEquipment()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.equipment-detail {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>