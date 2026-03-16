<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { nurseLevelApi, nurseItemApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const levelList = ref([])
const nurseItems = ref([])
const selectedItems = ref([])
const currentLevelId = ref(null)

const dialogVisible = ref(false)
const dialogTitle = ref('添加护理级别')
const formRef = ref(null)

const configDialogVisible = ref(false)
const configLoading = ref(false)
const configTableRef = ref(null)

const form = ref({
  id: null,
  name: '',
  status: 1,
})

const rules = {
  name: [{ required: true, message: '请输入级别名称', trigger: 'blur' }],
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await nurseLevelApi.getNurseLevelList({ isDeleted: 0 })
    if (res.flag && res.data) {
      levelList.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加护理级别'
  form.value = { id: null, name: '', status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑护理级别'
  form.value = { id: row.id, name: row.levelName, status: row.levelStatus }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该护理级别吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await nurseLevelApi.removeNurseLevel(row.id)
    if (res.flag) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  }).catch(() => {})
}

const handleConfig = async (row) => {
  currentLevelId.value = row.id
  configLoading.value = true
  configDialogVisible.value = true
  selectedItems.value = []
  
  try {
    const res = await nurseLevelApi.getNurseItemsByLevel(row.id)
    
    if (res.flag && res.data) {
      nurseItems.value = res.data.records || res.data || []
    }
  
  } catch (e) {
    console.error('获取护理项目失败', e)
  } finally {
    configLoading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection.map(item => item.id)
}

const handleConfigSubmit = async () => {
  const newItems = selectedItems.value
  
  try {
    for (const itemId of newItems) {
      await nurseLevelApi.addItemToLevel(currentLevelId.value, itemId)
    }
    ElMessage.success('配置成功')
    configDialogVisible.value = false
  } catch (e) {
    ElMessage.error('配置失败')
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  let res
  if (form.value.id) {
    res = await nurseLevelApi.updateNurseLevel({
      id: form.value.id,
      name: form.value.name,
      status: form.value.status,
    })
  } else {
    res = await nurseLevelApi.addNurseLevel({
      name: form.value.name,
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
  <div class="care-level-page">
    <div class="filter-bar">
      <div class="page-title">护理级别管理</div>
      <el-button type="primary" @click="handleAdd">添加护理级别</el-button>
    </div>

    <el-table :data="levelList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="levelName" label="级别名称" min-width="100" header-align="left" />
      <el-table-column prop="levelStatus" label="状态" min-width="150" header-align="left">
        <template #default="{ row }">
          <el-tag :type="row.levelStatus === 1 ? 'success' : 'info'" size="small">
            {{ row.levelStatus === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="150" fixed="right" header-align="left">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">修改</el-button>
          <el-button type="warning" link size="small" @click="handleConfig(row)">护理项目配置</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="级别名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入级别名称" />
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

    <el-dialog v-model="configDialogVisible" title="护理项目配置" width="700px">
      <div v-loading="configLoading">
        <el-table 
          ref="configTableRef"
          :data="nurseItems" 
          stripe 
          @selection-change="handleSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="serialNumber" label="编号" min-width="80" header-align="left" />
          <el-table-column prop="nursingName" label="护理项目名称" min-width="120" header-align="left" />
          <el-table-column prop="executionCycle" label="执行周期" min-width="80" header-align="left" />
          <el-table-column prop="executionTimes" label="执行次数" min-width="80" header-align="left" />
          <el-table-column prop="servicePrice" label="价格" min-width="80" header-align="left" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfigSubmit">确定</el-button>
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
