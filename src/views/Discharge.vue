<script setup>
import { ref, onMounted } from 'vue'
import { backdownApi, customerApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dischargeList = ref([])
const customers = ref([])

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
  })
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="discharge-page">
    <div class="filter-bar">
      <div class="page-title">退住登记管理</div>
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
      <el-table-column label="操作" min-width="100">
        <template #default="{ row }">
          <template v-if="row.auditstatus === 0">
            <el-button type="success" link size="small" @click="handleApprove(row)">批准</el-button>
          </template>
          <span v-else class="empty-text">-</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination background layout="total, prev, pager, next" :total="dischargeList.length" :page-size="10" />
    </div>
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
