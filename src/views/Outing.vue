<script setup>
import { ref, onMounted } from 'vue'
import { outingApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const outingList = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await outingApi.getOutingList()
    outingList.value = res.data.list
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const map = {
    '待审批': 'warning',
    '已批准': 'success',
    '已外出': 'primary',
    '已返回': 'info',
    '已拒绝': 'danger'
  }
  return map[status] || 'info'
}

const handleApprove = (row) => {
  ElMessageBox.confirm('确定批准该外出申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await outingApi.approveOuting(row.id, true)
    ElMessage.success('审批成功')
    fetchData()
  })
}

const handleReject = (row) => {
  ElMessageBox.confirm('确定拒绝该外出申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await outingApi.approveOuting(row.id, false)
    ElMessage.success('已拒绝')
    fetchData()
  })
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
      <el-table-column prop="customerName" label="客户姓名" width="100" />
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="outingType" label="外出类型" width="100" />
      <el-table-column prop="startTime" label="开始时间" width="160" />
      <el-table-column prop="endTime" label="结束时间" width="160" />
      <el-table-column prop="reason" label="外出原因" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="applyTime" label="申请时间" width="160" />
      <el-table-column prop="approver" label="审批人" width="100" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === '待审批'">
            <el-button type="success" link size="small" @click="handleApprove(row)">批准</el-button>
            <el-button type="danger" link size="small" @click="handleReject(row)">拒绝</el-button>
          </template>
          <template v-else-if="row.status === '已批准'">
            <el-button type="primary" link size="small">确认外出</el-button>
          </template>
          <template v-else-if="row.status === '已外出'">
            <el-button type="primary" link size="small">确认返回</el-button>
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
