<script setup>
import { ref, onMounted } from 'vue'
import { outwardApi, customerApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const outingList = ref([])
const customers = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const [outwardRes, customerRes] = await Promise.all([
      outwardApi.getOutwardList({}),
      customerApi.getCustomerList({ page: 1 })
    ])
    
    if (customerRes.flag && customerRes.data) {
      customers.value = customerRes.data.records || customerRes.data
    }
    
    if (outwardRes.flag && outwardRes.data) {
      const records = Array.isArray(outwardRes.data) ? outwardRes.data : (outwardRes.data.records || [])
      outingList.value = records.map(item => {
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
  const map = { 0: '待审批', 1: '已批准', 2: '已拒绝' }
  return map[status] ?? '未知'
}

const getStatusType = (status) => {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] ?? 'info'
}

const handleApprove = (row) => {
  ElMessageBox.confirm('确定批准该外出申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await outwardApi.examineOutward(row.id, 1)
    if (res.flag) {
      ElMessage.success('审批成功')
      fetchData()
    } else {
      ElMessage.error(res.message || '审批失败')
    }
  }).catch(() => {})
}

const handleReject = (row) => {
  ElMessageBox.confirm('确定拒绝该外出申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await outwardApi.examineOutward(row.id, 2)
    if (res.flag) {
      ElMessage.success('已拒绝')
      fetchData()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  }).catch(() => {})
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定撤回该外出申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await outwardApi.delOutward(row.id, 0)
    if (res.flag) {
      ElMessage.success('已撤回')
      fetchData()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="outing-page">
    <div class="filter-bar">
      <div class="page-title">外出登记管理</div>
    </div>

    <el-table :data="outingList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="customerName" label="客户姓名" min-width="100" />
      <el-table-column prop="bedNo" label="床位号" min-width="100" />
      <el-table-column prop="outgoingreason" label="外出原因" min-width="150" />
      <el-table-column prop="outgoingtime" label="外出时间" min-width="160" />
      <el-table-column prop="expectedreturntime" label="预计返回时间" min-width="160" />
      <el-table-column prop="escorted" label="陪同人" min-width="100" />
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
      <el-pagination background layout="total, prev, pager, next" :total="outingList.length" :page-size="10" />
    </div>
  </div>
</template>

<style scoped>
.outing-page {
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
