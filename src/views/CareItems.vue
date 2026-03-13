<script setup>
import { ref, onMounted } from 'vue'
import { careItemApi } from '../api'
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
  category: '',
  price: '',
  unit: ''
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
}

const categoryOptions = ['日常护理', '个人卫生', '医疗护理', '康复护理', '心理护理']

const fetchData = async () => {
  loading.value = true
  try {
    const res = await careItemApi.getCareItemList()
    itemList.value = res.data.list
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加护理项目'
  form.value = { id: null, name: '', description: '', category: '', price: '', unit: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑护理项目'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该护理项目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await careItemApi.deleteCareItem(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  if (form.value.id) {
    await careItemApi.updateCareItem(form.value)
    ElMessage.success('修改成功')
  } else {
    await careItemApi.addCareItem(form.value)
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
  <div class="care-items-page">
    <div class="filter-bar">
      <div class="page-title">护理项目管理</div>
      <el-button type="primary" @click="handleAdd">添加护理项目</el-button>
    </div>

    <el-table :data="itemList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="name" label="项目名称" width="150" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格(元)" width="100">
        <template #default="{ row }">
          <span style="color: #f56c6c">¥{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="80" />
      <el-table-column label="操作" width="180" fixed="right">
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
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categoryOptions" :key="cat" :label="cat" :value="cat" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="如：次、小时、天" />
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
