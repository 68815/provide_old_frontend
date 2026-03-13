<script setup>
import { ref, onMounted } from 'vue'
import { dischargeApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dischargeList = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await dischargeApi.getDischargeList()
    dischargeList.value = res.data.list
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = {
    '待审批': 'warning',
    '已批准': 'success',
    '已完成': 'info'
  }
  return map[status] || 'info'
}

const handleApprove = (row) => {
  ElMessageBox.confirm('确定批准该退住申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await dischargeApi.approveDischarge(row.id, true)
    ElMessage.success('审批成功')
    fetchData()
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
      <el-table-column prop="customerName" label="客户姓名" width="100" />
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="dischargeType" label="退住类型" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="row.dischargeType === '去世' ? 'danger' : 'info'">{{ row.dischargeType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="退住原因" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="applyTime" label="申请时间" width="160" />
      <el-table-column prop="approver" label="审批人" width="100" />
      <el-table-column prop="approveTime" label="审批时间" width="160" />
      <el-table-column prop="actualTime" label="实际退住时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === '待审批'">
            <el-button type="success" link size="small" @click="handleApprove(row)">批准</el-button>
            <el-button type="danger" link size="small">拒绝</el-button>
          </template>
          <template v-else-if="row.status === '已批准'">
            <el-button type="primary" link size="small">确认完成</el-button>
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
