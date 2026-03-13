<script setup>
import { ref, onMounted } from 'vue'
import { careRecordApi, customerApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const recordList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

const form = ref({
  customerId: '',
  careItem: '',
  careTime: '',
  content: '',
  remarks: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  careItem: [{ required: true, message: '请选择护理项目', trigger: 'change' }],
  careTime: [{ required: true, message: '请选择护理时间', trigger: 'change' }],
  content: [{ required: true, message: '请输入护理内容', trigger: 'blur' }]
}

const customers = ref([])
const careItems = ['喂饭', '翻身', '擦浴', '如厕护理', '服药管理', '健康监测', '康复训练', '心理疏导']

const fetchData = async () => {
  loading.value = true
  try {
    const res = await careRecordApi.getCareRecordList()
    recordList.value = res.data.list
    const customerRes = await customerApi.getCustomerList({ pageSize: 100 })
    customers.value = customerRes.data.list
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  form.value = { customerId: '', careItem: '', careTime: '', content: '', remarks: '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  await careRecordApi.addCareRecord(form.value)
  ElMessage.success('添加成功')
  dialogVisible.value = false
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="care-record-page">
    <div class="filter-bar">
      <div class="page-title">护理记录</div>
      <el-button type="primary" @click="handleAdd">添加护理记录</el-button>
    </div>

    <el-table :data="recordList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="customerName" label="客户姓名" width="100" />
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="careItem" label="护理项目" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.careItem }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="careTime" label="护理时间" width="160" />
      <el-table-column prop="caregiver" label="护理人" width="100" />
      <el-table-column prop="content" label="护理内容" />
      <el-table-column prop="remarks" label="备注" width="150" />
    </el-table>

    <div class="pagination-wrap">
      <el-pagination background layout="total, prev, pager, next" :total="recordList.length" :page-size="10" />
    </div>

    <el-dialog v-model="dialogVisible" title="添加护理记录" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="c in customers" :key="c.id" :label="`${c.name} - ${c.bedNo}`" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="护理项目" prop="careItem">
          <el-select v-model="form.careItem" placeholder="请选择护理项目" style="width: 100%">
            <el-option v-for="item in careItems" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="护理时间" prop="careTime">
          <el-date-picker v-model="form.careTime" type="datetime" placeholder="选择时间" style="width: 100%" value-format="YYYY-MM-DD HH:mm" />
        </el-form-item>
        <el-form-item label="护理内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入护理内容" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remarks" placeholder="请输入备注" />
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
.care-record-page {
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
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
