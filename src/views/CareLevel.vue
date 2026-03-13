<script setup>
import { ref, onMounted } from 'vue'
import { careLevelApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const levelList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加护理级别')
const formRef = ref(null)

const form = ref({
  id: null,
  name: '',
  description: '',
  price: '',
  items: []
})

const rules = {
  name: [{ required: true, message: '请输入级别名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const allCareItems = ['喂饭', '翻身', '擦浴', '如厕护理', '服药管理', '健康监测', '康复训练', '心理疏导', '协助进食', '协助洗漱', '服药提醒', '日常活动协助', '日常活动指导']

const fetchData = async () => {
  loading.value = true
  try {
    const res = await careLevelApi.getCareLevelList()
    levelList.value = res.data.list
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加护理级别'
  form.value = { id: null, name: '', description: '', price: '', items: [] }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑护理级别'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该护理级别吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await careLevelApi.deleteCareLevel(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  if (form.value.id) {
    await careLevelApi.updateCareLevel(form.value)
    ElMessage.success('修改成功')
  } else {
    await careLevelApi.addCareLevel(form.value)
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
  <div class="care-level-page">
    <div class="filter-bar">
      <div class="page-title">护理级别管理</div>
      <el-button type="primary" @click="handleAdd">添加护理级别</el-button>
    </div>

    <el-table :data="levelList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="name" label="级别名称" width="150" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="price" label="价格(元/月)" width="120">
        <template #default="{ row }">
          <span style="color: #f56c6c; font-weight: 500">¥{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="包含项目" width="300">
        <template #default="{ row }">
          <el-tag v-for="item in row.items" :key="item" size="small" style="margin-right: 4px; margin-bottom: 4px">{{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="级别名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入级别名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" style="width: 100%" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="包含项目">
          <el-select v-model="form.items" multiple placeholder="请选择护理项目" style="width: 100%">
            <el-option v-for="item in allCareItems" :key="item" :label="item" :value="item" />
          </el-select>
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
.care-level-page {
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
