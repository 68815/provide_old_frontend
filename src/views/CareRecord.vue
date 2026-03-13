<script setup>
import { ref, onMounted } from 'vue'
import { nurseRecordApi, customerApi, nurseItemApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const recordList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

const form = ref({
  customerId: '',
  itemId: '',
  content: '',
  count: 1,
  time: '',
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  itemId: [{ required: true, message: '请选择护理项目', trigger: 'change' }],
  content: [{ required: true, message: '请输入护理内容', trigger: 'blur' }],
}

const customers = ref([])
const careItems = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await nurseRecordApi.getNurseRecordList({})
    if (res.flag && res.data) {
      recordList.value = res.data.records || res.data
    }
    const customerRes = await customerApi.getCustomerList({ page: 1 })
    if (customerRes.flag && customerRes.data) {
      customers.value = customerRes.data.records || customerRes.data
    }
    const itemRes = await nurseItemApi.getNurseItemList({})
    if (itemRes.flag && itemRes.data) {
      careItems.value = itemRes.data.records || itemRes.data
    }
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  form.value = { customerId: '', itemId: '', content: '', count: 1, time: '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  const res = await nurseRecordApi.addNurseRecord({
    customerId: form.value.customerId,
    itemId: form.value.itemId,
    content: form.value.content,
    count: form.value.count,
    time: form.value.time,
  })
  
  if (res.flag) {
    ElMessage.success('添加成功')
    dialogVisible.value = false
    fetchData()
  } else {
    ElMessage.error(res.message || '添加失败')
  }
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
      <el-table-column prop="itemName" label="护理项目" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.itemName || row.nursingName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="nursingTime" label="护理时间" width="160" />
      <el-table-column prop="nursingContent" label="护理内容" />
      <el-table-column prop="nursingCount" label="护理次数" width="100" />
    </el-table>

    <div class="pagination-wrap">
      <el-pagination background layout="total, prev, pager, next" :total="recordList.length" :page-size="10" />
    </div>

    <el-dialog v-model="dialogVisible" title="添加护理记录" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="c in customers" :key="c.id" :label="`${c.customerName} - ${c.bedNo}`" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="护理项目" prop="itemId">
          <el-select v-model="form.itemId" placeholder="请选择护理项目" style="width: 100%">
            <el-option v-for="item in careItems" :key="item.id" :label="item.nursingName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="护理时间">
          <el-date-picker v-model="form.time" type="datetime" placeholder="选择时间" style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="护理内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入护理内容" />
        </el-form-item>
        <el-form-item label="护理次数">
          <el-input-number v-model="form.count" :min="1" style="width: 100%" />
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
