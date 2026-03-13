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
  password: '',
  nickname: '',
  phone: '',
  email: '',
  sex: 0,
  roleId: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const roleOptions = [
  { label: '管理员', value: 1 },
  { label: '健康管家', value: 2 },
  { label: '护工', value: 3 },
]

const getRoleName = (roleId) => {
  const map = { 1: '管理员', 2: '健康管家', 3: '护工' }
  return map[roleId] || '未知'
}

const getSexText = (sex) => {
  return sex === 0 ? '男' : '女'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await userApi.getUserList({})
    if (res.flag && res.data) {
      userList.value = res.data.records || res.data
    }
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加用户'
  form.value = { id: null, username: '', password: '', nickname: '', phone: '', email: '', sex: 0, roleId: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  form.value = {
    id: row.id,
    username: row.username,
    password: '',
    nickname: row.nickname,
    phone: row.phoneNumber,
    email: row.email,
    sex: row.sex || 0,
    roleId: row.roleId,
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await userApi.removeUser(row.id)
    if (res.flag) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  })
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  let res
  if (form.value.id) {
    res = await userApi.updateUser({
      id: form.value.id,
      nickname: form.value.nickname,
      phone: form.value.phone,
      email: form.value.email,
      sex: form.value.sex,
      roleId: form.value.roleId,
    })
  } else {
    res = await userApi.addUser({
      username: form.value.username,
      password: form.value.password,
      nickname: form.value.nickname,
      phone: form.value.phone,
      email: form.value.email,
      sex: form.value.sex,
      roleId: form.value.roleId,
    })
  }
  
  if (res.flag) {
    ElMessage.success(form.value.id ? '修改成功' : '添加成功')
    dialogVisible.value = false
    fetchData()
  } else {
    ElMessage.error(res.message || '操作失败')
  }
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
      <el-table-column prop="nickname" label="姓名" width="150" />
      <el-table-column prop="roleId" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="row.roleId === 1 ? 'danger' : row.roleId === 2 ? 'primary' : 'success'" size="small">
            {{ getRoleName(row.roleId) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phoneNumber" label="联系电话" width="150" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="sex" label="性别" width="80">
        <template #default="{ row }">
          {{ getSexText(row.sex) }}
        </template>
      </el-table-column>
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
        <el-form-item label="密码" v-if="!form.id" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :value="0">男</el-radio>
            <el-radio :value="1">女</el-radio>
          </el-radio-group>
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
