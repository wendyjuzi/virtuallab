<template>
  <div class="equipment-management-bg">
    <div class="frosted-wrapper">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="gradient-title">设备管理</span>
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
            <el-input v-model="temp.department" />
          </el-form-item>
          <el-form-item label="所属实验室" prop="labId" required>
            <el-select v-model="temp.labId" placeholder="请选择" style="width: 100%">
              <el-option
                  v-for="lab in laboratories"
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
  </div>
</template>

<script>
import { fetchEquipmentList, createEquipment, updateEquipment, deleteEquipment } from '@/api/equipment'
import { fetchLaboratoryList } from '@/api/laboratory'

export default {
  name: 'AdminEquipmentManagement',
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
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        keyword: undefined,
        labId: undefined
      },
      laboratories: [],
      temp: {
        id: undefined,
        name: '',
        model: '',
        category: '',
        code: '',
        department: '',
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
  created() {
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
      fetchEquipmentList(this.listQuery).then(response => {
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
          department: this.getLabDepartmentById(item.labId)
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
    getLabDepartmentById(labId) {
      if (!labId) return '';
      const lab = this.laboratories.find(l => l.id === labId);
      return lab ? lab.department : '';
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
      this.temp = {
        id: undefined,
        name: '',
        model: '',
        category: '',
        code: '',
        department: '',
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
    }
  }
}
</script>

<style scoped>
.equipment-management-bg {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}
.frosted-wrapper {
  background: rgba(236, 236, 255, 0.92);
  box-shadow: 0 12px 48px #a18fff33, 0 2px 8px #7c3aed11;
  border-radius: 36px;
  max-width: 1400px;
  width: 98vw;
  margin: 40px auto 0 auto;
  padding: 48px 40px 40px 40px;
  backdrop-filter: blur(12px);
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gradient-title {
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px #a18fff33;
}
.el-card {
  border-radius: 24px;
  box-shadow: 0 8px 32px #a18fff22, 0 2px 8px #7c3aed11;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(8px);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-button[type="primary"] {
  background: linear-gradient(90deg, #7C3AED 0%, #a18fff 100%);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px #a18fff44;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
}
.el-button[type="primary"]:hover {
  background: linear-gradient(90deg, #a18fff 0%, #7C3AED 100%);
  box-shadow: 0 6px 24px #7c3aed55;
  transform: scale(1.04);
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
.el-dialog {
  border-radius: 22px;
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
@media (max-width: 900px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
    max-width: 100vw;
  }
  .gradient-title {
    font-size: 20px;
  }
}
</style>