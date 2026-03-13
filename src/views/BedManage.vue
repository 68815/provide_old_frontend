<script setup>
import { ref, onMounted } from 'vue'
import { bedApi } from '../api'

const loading = ref(false)
const recordList = ref([])
const customerName = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isDeleted = ref(0)

const isDeletedOptions = [
  { label: '正在使用', value: 0 },
  { label: '使用历史', value: 1 },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await bedApi.getBedDetailsList({
      page: currentPage.value,
      customerName: customerName.value,
      startDate: dateRange.value?.[0] || '',
      endDate: dateRange.value?.[1] || '',
      isDeleted: isDeleted.value,
    })
    if (res.flag && res.data) {
      recordList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const formatDate = (date) => {
  if (!date) return '-'
  return date
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="bed-record-page">
    <div class="page-header">
      <h3 class="page-title">床位使用记录</h3>
    </div>
    
    <div class="filter-bar">
      <div class="filter-left">
        <span class="label">姓名：</span>
        <el-input v-model="customerName" placeholder="请输入姓名" style="width: 120px" clearable @keyup.enter="fetchData" />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px; margin-left: 16px"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" style="margin-left: 8px" @click="fetchData">搜索</el-button>
      </div>
    </div>
    <div style="margin-bottom: 16px">
      <el-radio-group v-model="isDeleted" @change="fetchData">
        <el-radio-button 
          v-for="item in isDeletedOptions" 
          :key="item.value" 
          :value="item.value"
        >
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <el-table :data="recordList" v-loading="loading" stripe style="width: 100%">
      <el-table-column type="index" label="序号" width="80" header-align="left" />
      <el-table-column prop="customerName" label="客户姓名" width="100" header-align="left" />
      <el-table-column prop="customerSex" label="性别" width="80" header-align="left">
        <template #default="{ row }">
          {{ row.customerSex === 0 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="roomNo" label="房间号" width="100" header-align="left" />
      <el-table-column prop="bedDetails" label="床位详情" min-width="150" header-align="left" />
      <el-table-column prop="startDate" label="床位使用起始日期" width="160" header-align="left">
        <template #default="{ row }">
          {{ formatDate(row.startDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="endDate" label="床位使用结束日期" width="160" header-align="left">
        <template #default="{ row }">
          {{ formatDate(row.endDate) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" fixed="right" header-align="left">
        <template #default="{ row }">
          <el-button type="primary" link size="small">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.bed-record-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 12px;
}
.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}
.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-left .label {
  font-size: 14px;
  color: #606266;
}
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
