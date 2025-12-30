<template>
  <div class="lab-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>实验室管理</span>
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
          <el-input v-model="temp.department" :disabled="true" />
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
        department: userStore.userDepartment || undefined // 默认过滤当前院系
      },
      temp: {
        id: undefined,
        name: '',
        code: '',
        department: '计算机学院', // 固定为计算机学院
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
      // 强制使用用户院系作为查询条件
      this.listQuery.department = userStore.userDepartment || undefined

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
      this.temp.department = userStore.userDepartment || '' // 确保创建时使用当前院系
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
.filter-container {
  margin-bottom: 20px;
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