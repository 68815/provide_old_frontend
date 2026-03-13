<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const userList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const formRef = ref(null)

const form = ref({
  id: null,
  username: '',
  name: '',
  role: '',
  phone: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '健康管家', value: 'butler' },
  { label: '护工', value: 'nurse' }
]

const getRoleName = (role) => {
  const map = { admin: '管理员', butler: '健康管家', nurse: '护工' }
  return map[role] || role
}

const getRoleType = (role) => {
  const map = { admin: 'danger', butler: 'primary', nurse: 'success' }
  return map[role] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await userApi.getUserList()
    userList.value = res.data.list
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加用户'
  form.value = { id: null, username: '', name: '', role: '', phone: '', password: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  form.value = { ...row, password: '' }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await userApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  if (form.value.id) {
    await userApi.updateUser(form.value)
    ElMessage.success('修改成功')
  } else {
    await userApi.addUser(form.value)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="user-manage-page">
    <div class="filter-bar">
      <div class="page-title">用户管理</div>
      <el-button type="primary" @click="handleAdd">添加用户</el-button>
    </div>

    <el-table :data="userList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="name" label="姓名" width="150" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)" size="small">{{ getRoleName(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="150" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)" :disabled="row.username === 'admin'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="密码" v-if="!form.id">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-manage-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}
</style>
