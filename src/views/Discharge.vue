<script setup>
import { ref, onMounted } from 'vue'
import { backdownApi, customerApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dischargeList = ref([])
const customers = ref([])

const dialogVisible = ref(false)
const formRef = ref(null)

const form = ref({
  customerId: '',
  retreatTime: '',
  retreatType: 0,
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  retreatTime: [{ required: true, message: '请选择退住时间', trigger: 'change' }],
  retreatType: [{ required: true, message: '请选择退住类型', trigger: 'change' }],
}

const retreatTypeOptions = [
  { label: '正常退住', value: 0 },
  { label: '转院', value: 1 },
  { label: '去世', value: 2 },
]

const fetchData = async () => {
  loading.value = true
  try {
    const [backdownRes, customerRes] = await Promise.all([
      backdownApi.getBackdownList({}),
      customerApi.getCustomerList({ page: 1 })
    ])
    
    if (customerRes.flag && customerRes.data) {
      customers.value = customerRes.data.records || customerRes.data
    }
    
    if (backdownRes.flag && backdownRes.data) {
      const records = Array.isArray(backdownRes.data) ? backdownRes.data : (backdownRes.data.records || [])
      dischargeList.value = records.map(item => {
        const customer = customers.value.find(c => c.id === item.customerId || c.id === item.customer_id)
        return {
          ...item,
          customerId: item.customerId || item.customer_id,
          customerName: item.customerName || customer?.customerName || '-',
          bedNo: item.bedNo || customer?.bedNo || '-'
        }
      })
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => {
  const map = { 0: '待审批', 1: '已批准', 2: '已完成' }
  return map[status] ?? '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'info' }
  return map[status] ?? 'info'
}

const getTypeText = (type) => {
  const map = { 0: '正常退住', 1: '转院', 2: '去世' }
  return map[type] ?? '未知'
}

const handleApprove = (row) => {
  ElMessageBox.confirm('确定批准该退住申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await backdownApi.examineBackdown(row.id, 1)
    if (res.flag) {
      ElMessage.success('审批成功')
      fetchData()
    } else {
      ElMessage.error(res.message || '审批失败')
    }
  }).catch(() => {})
}

const handleReject = (row) => {
  ElMessageBox.confirm('确定拒绝该退住申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await backdownApi.examineBackdown(row.id, 2)
    if (res.flag) {
      ElMessage.success('已拒绝')
      fetchData()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  }).catch(() => {})
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定撤回该退住申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await backdownApi.delBackdown(row.id, 0)
    if (res.flag) {
      ElMessage.success('已撤回')
      fetchData()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  }).catch(() => {})
}

const handleAdd = () => {
  form.value = {
    customerId: '',
    retreatTime: '',
    retreatType: 0,
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    const res = await backdownApi.addBackdown({
      customerId: form.value.customerId,
      retreatTime: form.value.retreatTime,
      retreatType: form.value.retreatType,
      auditStatus: 0,
    })
    if (res.flag) {
      ElMessage.success('退住登记成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.message || '登记失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '登记失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="discharge-page">
    <div class="filter-bar">
      <div class="page-title">退住登记管理</div>
      <el-button type="primary" @click="handleAdd">退住登记</el-button>
    </div>

    <el-table :data="dischargeList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="customerName" label="客户姓名" min-width="100" />
      <el-table-column prop="bedNo" label="床位号" min-width="100" />
      <el-table-column prop="retreattype" label="退住类型" min-width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="row.retreattype === 2 ? 'danger' : 'info'">{{ getTypeText(row.retreattype) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="retreattime" label="退住时间" min-width="160" />
      <el-table-column prop="auditstatus" label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.auditstatus)" size="small">{{ getStatusText(row.auditstatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="150">
        <template #default="{ row }">
          <template v-if="row.auditstatus === 0">
            <el-button type="success" link size="small" @click="handleApprove(row)">批准</el-button>
            <el-button type="danger" link size="small" @click="handleReject(row)">拒绝</el-button>
          </template>
          <template v-else-if="row.auditstatus >= 1">
            <el-button type="warning" link size="small" @click="handleCancel(row)">撤回</el-button>
          </template>
          <span v-else class="empty-text">-</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination background layout="total, prev, pager, next" :total="dischargeList.length" :page-size="10" />
    </div>

    <el-dialog v-model="dialogVisible" title="退住登记" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" style="width: 100%">
            <el-option 
              v-for="customer in customers" 
              :key="customer.id" 
              :label="customer.customerName" 
              :value="customer.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="退住时间" prop="retreatTime">
          <el-date-picker
            v-model="form.retreatTime"
            type="datetime"
            placeholder="请选择退住时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="退住类型" prop="retreatType">
          <el-select v-model="form.retreatType" placeholder="请选择退住类型" style="width: 100%">
            <el-option 
              v-for="item in retreatTypeOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
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
.discharge-page {
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
.empty-text {
  color: #c0c4cc;
}
</style>
