<template>
  <div class="equipment-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <el-button type="primary" @click="handleCreate">新增设备</el-button>
        </div>
      </template>

      <!-- 搜索和过滤 -->
      <div class="filter-container">
        <el-input
            v-model="listQuery.keyword"
            placeholder="设备名称/型号/类别/编号"
            style="width: 200px"
            class="filter-item"
            @keyup.enter="handleFilter"
        />
        <el-input
            v-model="listQuery.department"
            placeholder="所属院系"
            style="width: 200px"
            class="filter-item"
            :disabled="true"
        />
        <el-button class="filter-item" type="primary" @click="handleFilter">
          搜索
        </el-button>
      </div>

      <!-- 设备表格 -->
      <el-table
          v-loading="listLoading"
          :data="list"
          border
          fit
          highlight-current-row
          style="width: 100%"
      >
        <el-table-column label="ID" prop="id" align="center" width="80" />
        <el-table-column label="设备名称" prop="name" align="center" />
        <el-table-column label="设备型号" prop="model" align="center" />
        <el-table-column label="设备类别" prop="category" align="center" />
        <el-table-column label="设备编号" prop="code" align="center" />
        <el-table-column label="所属实验室" prop="labName" align="center" />
        <el-table-column label="所属院系" prop="department" align="center" />
        <el-table-column label="描述" prop="description" align="center" width="200">
          <template #default="{ row }">
            <el-tooltip effect="dark" :content="row.description" placement="top">
        <span class="description-text">
          {{ row.description ? (row.description.length > 15 ? row.description.substring(0,15)+'...' : row.description) : '-' }}
        </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="价格(元)" prop="price" align="center" width="120">
          <template #default="{ row }">
            {{ row.price ? row.price.toFixed(2) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="制造商" prop="manufacturer" align="center" />
        <el-table-column label="状态" prop="status" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status | statusFilter">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="listQuery.pageNum"
            v-model:page-size="listQuery.pageSize"
            :total="total"
            background
            layout="total, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        :title="dialogStatus === 'create' ? '新增设备' : '编辑设备'"
        v-model="dialogFormVisible"
        width="600px"
    >
      <el-form
          ref="dataForm"
          :model="temp"
          label-position="left"
          label-width="120px"
          style="width: 500px; margin-left: 30px"
      >
        <el-form-item label="设备名称" prop="name" required>
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-input v-model="temp.model" />
        </el-form-item>
        <el-form-item label="设备类别" prop="category">
          <el-input v-model="temp.category" />
        </el-form-item>
        <el-form-item label="设备编号" prop="code" required>
          <el-input v-model="temp.code" />
        </el-form-item>
        <el-form-item label="所属院系" prop="department">
          <el-input v-model="temp.department" :disabled="true" />
        </el-form-item>
        <el-form-item label="所属实验室" prop="labId" required>
          <el-select v-model="temp.labId" placeholder="请选择" style="width: 100%">
            <el-option
                v-for="lab in dialogFilteredLaboratories"
                :key="lab.id"
                :label="lab.name"
                :value="lab.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格(元)" prop="price">
          <el-input-number v-model="temp.price" :precision="2" :step="0.1" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="制造商" prop="manufacturer">
          <el-input v-model="temp.manufacturer" />
        </el-form-item>
        <el-form-item label="状态" prop="status" required>
          <el-select v-model="temp.status" placeholder="请选择" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="维修中" value="维修中" />
            <el-option label="停用" value="停用" />
            <el-option label="已借出" value="已借出" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="temp.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { fetchEquipmentList, createEquipment, updateEquipment, deleteEquipment, fetchEquipmentByDepartment } from '@/api/equipment'
import { fetchLaboratoryList } from '@/api/laboratory'
import { useUserStore } from '@/store/user'

export default {
  name: 'DepartmentEquipmentManagement',
  filters: {
    statusFilter(status) {
      const statusMap = {
        '正常': 'success',
        '维修中': 'warning',
        '停用': 'danger',
        '已借出': 'info'
      }
      return statusMap[status]
    }
  },
  data() {
    const userStore = useUserStore()

    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        keyword: undefined,
        department: userStore.userDepartment || '',
        labId: undefined
      },
      laboratories: [],
      temp: {
        id: undefined,
        name: '',
        model: '',
        category: '',
        code: '',
        department: userStore.userDepartment || '',
        labId: undefined,
        price: null,
        manufacturer: '',
        status: '正常',
        description: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      }
    }
  },
  computed: {
    filteredLaboratories() {
      if (!Array.isArray(this.laboratories)) return [];
      return this.laboratories.filter(lab => {
        return lab.department === this.listQuery.department;
      });
    },
    dialogFilteredLaboratories() {
      return this.filteredLaboratories;
    }
  },
  created() {
    const userStore = useUserStore();
    this.listQuery.department = userStore.userDepartment || '计算机学院';

    this.getLaboratories().then(() => {
      this.getList();
    }).catch(error => {
      console.error('初始化失败:', error);
      this.getList();
    });
  },
  methods: {
    getList() {
      this.listLoading = true

      const fetchMethod = this.listQuery.department
          ? fetchEquipmentByDepartment
          : fetchEquipmentList

      fetchMethod(this.listQuery).then(response => {
        this.list = response.data.records.map(item => ({
          id: item.equipmentId,
          name: item.equipmentName,
          model: item.model,
          category: item.category,
          code: item.serialNumber,
          labId: item.labId,
          price: item.price ? new Number(item.price) : null,
          manufacturer: item.manufacturer,
          status: this.mapStatus(item.status),
          description: item.description,
          labName: this.getLabNameById(item.labId),
          department: this.listQuery.department
        }))

        this.total = response.data.total
        this.listLoading = false
      }).catch(error => {
        console.error('获取设备列表失败:', error)
        this.listLoading = false
      })
    },
    mapStatus(apiStatus) {
      const statusMap = {
        'normal': '正常',
        'maintenance': '维修中',
        'unavailable': '停用',
        'scrapped': '报废',
        'borrowed': '已借出'
      }
      return statusMap[apiStatus] || apiStatus
    },
    getLaboratories() {
      return fetchLaboratoryList().then(response => {
        this.laboratories = (response.data.records || response.data || []).map(lab => ({
          id: lab.labId,
          name: lab.labName,
          department: lab.department,
          location: lab.location,
          capacity: lab.capacity
        }));
      }).catch(error => {
        console.error('获取实验室列表失败:', error);
        this.laboratories = [];
      });
    },
    getLabNameById(labId) {
      if (!labId) return '未指定实验室';
      const lab = this.laboratories.find(l => l.id === labId);
      return lab ? lab.name : '未知实验室';
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    resetTemp() {
      const userStore = useUserStore()
      const today = new Date()
      const formattedDate = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`

      this.temp = {
        id: undefined,
        name: '',
        model: '',
        category: '',
        code: '',
        department: userStore.userDepartment || '',
        labId: undefined,
        price: null,
        manufacturer: '',
        status: '正常',
        description: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(async (valid) => {
        if (!valid) return;

        try {

          // 准备提交数据
          const submitData = {
            equipmentName: this.temp.name.trim(),
            model: this.temp.model.trim(),
            category: this.temp.category.trim(),
            serialNumber: this.temp.code.trim(),
            labId: Number(this.temp.labId),
            price: Number(this.temp.price),
            manufacturer: this.temp.manufacturer.trim(),
            status: this.mapStatusToApi(this.temp.status),
            description: this.temp.description.trim()
          }
          console.log('提交数据:', submitData) // 调试日志

          // 发送请求
          const res = await createEquipment(submitData)

          if (res.code === 200) {
            this.$message.success('设备创建成功')
            this.dialogFormVisible = false
            this.getList()
          } else {
            this.$message.error(res.message || '创建失败')
          }
        } catch (error) {
          console.error('创建设备错误:', error)
          const errorMsg = error.response?.data?.message || error.message || '创建失败'
          this.$message.error(`创建失败: ${errorMsg}`)
        }
      })
    },
    mapStatusToApi(frontendStatus) {
      const statusMap = {
        '正常': 'normal',
        '维修中': 'maintenance',
        '停用': 'scrapped',
        '已借出': 'borrowed'
      }
      return statusMap[frontendStatus] || frontendStatus
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = {
            equipmentId: this.temp.id,
            equipmentName: this.temp.name,
            model: this.temp.model,
            category: this.temp.category,
            serialNumber: this.temp.code,
            labId: this.temp.labId,
            price: this.temp.price,
            manufacturer: this.temp.manufacturer,
            status: this.mapStatusToApi(this.temp.status),
            description: this.temp.description
          }

          updateEquipment(tempData).then(() => {
            this.dialogFormVisible = false
            this.$message.success('更新成功')
            this.getList()
          }).catch(error => {
            this.$message.error(error.message || '更新失败')
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该设备?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteEquipment(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
  }
}
</script>

<style scoped>
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.filter-item {
  flex: 0 0 auto;
}
/* 添加描述文本样式 */
.description-text {
  cursor: pointer;
  color: #409EFF;
}
.pagination-container {
  margin-top: 20px;
  text-align: center;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>