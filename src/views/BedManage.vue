<script setup>
import { ref, onMounted, computed } from 'vue'
import { bedApi } from '../api'

const loading = ref(false)
const bedList = ref([])
const currentFloor = ref('')
const currentStatus = ref('')
const keyword = ref('')

const floorOptions = [
  { label: '全部楼层', value: '' },
  { label: '一层', value: '一层' },
  { label: '二层', value: '二层' },
  { label: '三层', value: '三层' },
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '空闲', value: '1' },
  { label: '占用', value: '2' },
  { label: '外出', value: '3' },
]

const stats = computed(() => {
  const total = bedList.value.length
  const free = bedList.value.filter(b => b.bedStatus === 1).length
  const occupied = bedList.value.filter(b => b.bedStatus === 2).length
  const outing = bedList.value.filter(b => b.bedStatus === 3).length
  return { total, free, occupied, outing }
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await bedApi.getBedList({
      bedNo: keyword.value,
      bedStatus: currentStatus.value,
    })
    if (res.flag && res.data) {
      bedList.value = res.data
    }
  } finally {
    loading.value = false
  }
}

const getStatusText = (status) => {
  const map = { 1: '空闲', 2: '占用', 3: '外出' }
  return map[status] || '未知'
}

const getStatusType = (status) => {
  const map = { 1: 'success', 2: 'primary', 3: 'warning' }
  return map[status] || 'info'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="bed-manage-page">
    <div class="filter-bar">
      <div class="filter-left">
        <span class="label">楼层：</span>
        <el-select v-model="currentFloor" placeholder="请选择楼层" style="width: 120px" @change="fetchData">
          <el-option v-for="opt in floorOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <span class="label" style="margin-left: 16px">状态：</span>
        <el-select v-model="currentStatus" placeholder="请选择状态" style="width: 120px" @change="fetchData">
          <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-input
          v-model="keyword"
          placeholder="搜索床位号"
          style="width: 200px; margin-left: 16px"
          clearable
          @keyup.enter="fetchData"
        />
        <el-button type="primary" style="margin-left: 8px" @click="fetchData">搜索</el-button>
      </div>
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-icon total">🛏</span>
          <span>总床位: {{ stats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon free">🛏</span>
          <span>空闲: {{ stats.free }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon occupied">👤</span>
          <span>占用: {{ stats.occupied }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon outing">🚶</span>
          <span>外出: {{ stats.outing }}</span>
        </div>
      </div>
    </div>

    <el-table :data="bedList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="roomNo" label="房间号" width="100" />
      <el-table-column prop="bedStatus" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.bedStatus)" size="small">{{ getStatusText(row.bedStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户信息">
        <template #default="{ row }">
          <template v-if="row.customer">
            <div class="customer-info">
              <span>{{ row.customer.customerName }}</span>
              <span class="info-divider">|</span>
              <span>{{ row.customer.customerSex === 0 ? '男' : '女' }}</span>
              <span class="info-divider">|</span>
              <span>{{ row.customer.customerAge }}岁</span>
            </div>
          </template>
          <span v-else class="empty-text">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small">详情</el-button>
          <el-button type="primary" link size="small">调换</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="bedList.length"
        :page-size="20"
      />
    </div>
  </div>
</template>

<style scoped>
.bed-manage-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
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
.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #303133;
}
.stat-icon {
  font-size: 16px;
}
.customer-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
.info-divider {
  color: #dcdfe6;
  margin: 0 2px;
}
.empty-text {
  color: #c0c4cc;
}
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
