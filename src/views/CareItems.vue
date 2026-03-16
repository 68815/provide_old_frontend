<script setup>
import { ref, onMounted } from 'vue'
import { nurseItemApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const itemList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加护理项目')
const formRef = ref(null)

const form = ref({
  id: null,
  name: '',
  description: '',
  price: '',
  serialNumber: '',
  executionCycle: '',
  executionTimes: '',
  status: 1,
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await nurseItemApi.getNurseItemList({})
    if (res.flag && res.data) {
      itemList.value = res.data.records || res.data
    }
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加护理项目'
  form.value = { id: null, name: '', description: '', price: '', serialNumber: '', executionCycle: '', executionTimes: '', status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑护理项目'
  form.value = {
    id: row.id,
    name: row.nursingName,
    description: row.message,
    price: row.servicePrice,
    serialNumber: row.serialNumber,
    executionCycle: row.executionCycle,
    executionTimes: row.executionTimes,
    status: row.status,
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该护理项目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await nurseItemApi.delNurseItem(row.id)
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
    res = await nurseItemApi.updateNurseItem({
      id: form.value.id,
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      serialNumber: form.value.serialNumber,
      executionCycle: form.value.executionCycle,
      executionTimes: form.value.executionTimes,
      status: form.value.status,
    })
  } else {
    res = await nurseItemApi.addNurseItem({
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      serialNumber: form.value.serialNumber,
      executionCycle: form.value.executionCycle,
      executionTimes: form.value.executionTimes,
      status: form.value.status,
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
  <div class="care-items-page">
    <div class="filter-bar">
      <div class="page-title">护理项目管理</div>
      <el-button type="primary" @click="handleAdd">添加护理项目</el-button>
    </div>

    <el-table :data="itemList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="serialNumber" label="编号" min-width="120" />
      <el-table-column prop="nursingName" label="项目名称" min-width="150" />
      <el-table-column prop="message" label="描述" />
      <el-table-column prop="servicePrice" label="价格(元)" min-width="100">
        <template #default="{ row }">
          <span style="color: #f56c6c">¥{{ row.servicePrice }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="executionCycle" label="执行周期" min-width="100" />
      <el-table-column prop="executionTimes" label="执行次数" min-width="100" />
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="执行周期">
          <el-input v-model="form.executionCycle" placeholder="如：每天、每周" />
        </el-form-item>
        <el-form-item label="执行次数">
          <el-input-number v-model="form.executionTimes" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
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
.care-items-page {
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
