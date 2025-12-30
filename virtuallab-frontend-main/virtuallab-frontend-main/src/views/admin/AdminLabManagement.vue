<template>
  <div class="lab-management-bg">
    <div class="frosted-wrapper">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="gradient-title">实验室管理</span>
            <el-button type="primary" @click="handleCreate">新增实验室</el-button>
          </div>
        </template>

        <!-- 搜索和过滤 -->
        <div class="filter-container">
          <el-input
              v-model="listQuery.keyword"
              placeholder="实验室名称/位置"
              style="width: 200px"
              class="filter-item"
              @keyup.enter="handleFilter"
          />
          <el-button class="filter-item" type="primary" @click="handleFilter">
            搜索
          </el-button>
        </div>

        <!-- 实验室表格 -->
        <el-table
            v-loading="listLoading"
            :data="list"
            border
            fit
            highlight-current-row
            style="width: 100%"
        >
          <el-table-column label="ID" prop="id" align="center" width="80" />
          <el-table-column label="实验室名称" prop="name" align="center" />
          <el-table-column label="所属院系" prop="department" align="center" />
          <el-table-column label="位置" prop="location" align="center" />
          <el-table-column label="容量" prop="capacity" align="center" />
          <el-table-column label="状态" prop="status" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === '开放' ? 'success' : row.status === '维修中' ? 'warning' : 'danger'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="230">
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
          :title="dialogStatus === 'create' ? '新增实验室' : '编辑实验室'"
          v-model="dialogFormVisible"
      >
        <el-form
            ref="dataForm"
            :model="temp"
            label-position="left"
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
            <el-input v-model="temp.department" />
          </el-form-item>
          <el-form-item label="容量" prop="capacity">
            <el-input-number
                v-model="temp.capacity"
                :min="1"
                :max="1000"
                controls-position="right"
            />
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
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
            确认
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { fetchLabList, createLab, updateLab, deleteLab } from '@/api/laboratory'
import { useUserStore } from '@/store/user'

export default {
  name: 'DepartmentLabManagement',
  filters: {
    statusFilter(status) {
      const statusMap = {
        '开放': 'success',
        '关闭': 'info',
        '维修中': 'warning'
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
        department:  undefined
      },
      temp: {
        id: undefined,
        name: '',
        code: '',
        department: '', // 允许系统管理员设置任意院系
        location: '',
        status: '开放',
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
    this.getList()
  },
  methods: {
    getList() {
      const userStore = useUserStore()
      this.listLoading = true

      fetchLabList(this.listQuery).then(response => {
        // 转换数据格式，确保字段名匹配
        this.list = response.data.records.map(item => ({
          id: item.labId,
          name: item.labName,
          code: item.labId.toString(), // 如果没有code字段，可以用labId代替
          department: item.department,
          location: item.location,
          status: item.status === 'available' ? '开放' : item.status === 'maintenance' ? '维修中' : '关闭',
          capacity: item.capacity,
          description: item.description
        }))
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
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
        code: '',
        department: '',
        location: '',
        status: '开放',
        description: '',
        capacity: 0 // 默认值
      }
    },
    handleCreate() {
      const userStore = useUserStore()
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 转换数据格式以匹配后端实体
          const submitData = {
            labName: this.temp.name,
            department: this.temp.department,
            location: this.temp.location,
            status: this.temp.status === '开放' ? 'available' :
                this.temp.status === '维修中' ? 'maintenance' : 'unavailable',
            description: this.temp.description,
            capacity: this.temp.capacity || 0 // 确保有默认值
          };

          createLab(submitData).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '新增实验室成功',
              type: 'success'
            })
            this.getList() // 刷新列表
          }).catch(error => {
            console.error('创建失败:', error);
            this.$message.error('创建失败: ' + (error.response?.data?.message || error.message));
          });
        }
      });
    },
    handleUpdate(row) {
      // 复制对象并转换状态值为中文显示
      this.temp = {
        id: row.id,
        name: row.name,
        code: row.code,
        department: row.department,
        location: row.location,
        status: row.status === 'available' ? '开放' :
            row.status === 'maintenance' ? '维修中' : '关闭',
        description: row.description,
        capacity: row.capacity
      };

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 转换数据格式以匹配后端实体
          const submitData = {
            labId: this.temp.id,  // 注意字段名对应
            labName: this.temp.name,
            location: this.temp.location,
            capacity: this.temp.capacity,
            department: this.temp.department,
            description: this.temp.description,
            status: this.temp.status === '开放' ? 'available' :
                this.temp.status === '维修中' ? 'maintenance' : 'unavailable'
          };

          updateLab(submitData).then(() => {
            this.dialogFormVisible = false
            this.$message({
              message: '更新成功',
              type: 'success'
            })
            this.getList() // 刷新列表
          }).catch(error => {
            console.error('更新失败:', error);
            this.$message.error('更新失败: ' + (error.response?.data?.message || error.message));
          });
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该实验室?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteLab(row.id).then(() => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style scoped>
.lab-management-bg {
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
  border-radius: 32px;
  max-width: 1200px;
  width: 96vw;
  margin: 40px auto 0 auto;
  padding: 36px 32px 32px 32px;
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
  border-radius: 20px;
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
@media (max-width: 900px) {
  .frosted-wrapper {
    padding: 8px 0 8px 0;
    border-radius: 0;
    box-shadow: none;
  }
  .gradient-title {
    font-size: 20px;
  }
}
</style>