<script setup>
import { ref, onMounted } from 'vue'
import { customerApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const customerList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const statusFilter = ref('')

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '在住', value: '在住' },
  { label: '外出', value: '外出' },
  { label: '退住', value: '退住' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await customerApi.getCustomerList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      status: statusFilter.value
    })
    customerList.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const getStatusType = (status) => {
  const map = { '在住': 'success', '外出': 'warning', '退住': 'info' }
  return map[status] || 'info'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="customer-list-page">
    <div class="filter-bar">
      <div class="filter-left">
        <el-input
          v-model="keyword"
          placeholder="搜索姓名/床位号"
          style="width: 200px"
          clearable
          @keyup.enter="fetchData"
        />
        <el-select v-model="statusFilter" placeholder="选择状态" style="width: 120px; margin-left: 12px" @change="fetchData">
          <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button type="primary" style="margin-left: 8px" @click="fetchData">搜索</el-button>
      </div>
      <el-button type="primary" @click="$router.push('/admission')">入住登记</el-button>
    </div>

    <el-table :data="customerList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="60" />
      <el-table-column prop="age" label="年龄" width="70" />
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="careLevel" label="护理级别" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ row.careLevel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="checkInDate" label="入住日期" width="120" />
      <el-table-column prop="emergencyContact" label="紧急联系人" width="100" />
      <el-table-column prop="emergencyPhone" label="紧急联系电话" width="130" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small">详情</el-button>
          <el-button type="primary" link size="small">编辑</el-button>
          <el-button type="warning" link size="small" v-if="row.status === '在住'">外出</el-button>
          <el-button type="danger" link size="small" v-if="row.status === '在住'">退住</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="total, prev, pager, next, sizes"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
        @size-change="(size) => { pageSize = size; fetchData() }"
      />
    </div>
  </div>
</template>

<style scoped>
.customer-list-page {
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
.filter-left {
  display: flex;
  align-items: center;
}
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
