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
const manType = ref('')

const manTypeOptions = [
  { label: '全部', value: 0 },
  { label: '自理老人', value: '1' },
  { label: '护理老人', value: '2' },
  { label : '无管家', value: '3' },
]

const fetchData = async () => {
  loading.value = true
  try {
    let userId = undefined
    if (manType.value === 3) {
      userId = -1
    }
    
    const res = await customerApi.getCustomerList({
      page: currentPage.value,
      keyword: keyword.value,
      userId: userId,
      manType: manType.value,
    })
    if (res.flag && res.data) {
      customerList.value = res.data.records || []
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

const getGenderText = (sex) => {
  return sex === 0 ? '男' : '女'
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
          placeholder="搜索姓名"
          style="width: 200px"
          clearable
          @keyup.enter="fetchData"
        />
        <el-button type="primary" style="margin-left: 8px" @click="fetchData">搜索</el-button>
      </div>
      <el-button type="primary" @click="$router.push('/admission')">入住登记</el-button>
    </div>

    <div style="margin-bottom: 16px">
      <el-radio-group v-model="manType" @change="fetchData">
        <el-radio-button 
          v-for="item in manTypeOptions" 
          :key="item.value" 
          :value="item.value"
        >
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="customerList" v-loading="loading" stripe style="width: 100%">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column prop="customerName" label="姓名" width="100" />
      <el-table-column prop="bloodType" label="血型" width="80" />
      <el-table-column prop="contactTel" label="联系电话" width="130" />
      <el-table-column prop="customerAge" label="年龄" width="70" />
      <el-table-column prop="customerSex" label="性别" width="60">
              <template #default="{ row }">
          {{ getGenderText(row.customerSex) }}
        </template>
      </el-table-column>
      <el-table-column prop="familyMember" label="家属" width="100" >
        <template #default="{ row }">
          {{ row.familyMember || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="idcard" label="身份证号" width="100" />
      <el-table-column prop="buildingNo" label="所属楼房" width="120" />
      <el-table-column prop="roomNo" label="房间号" width="120" />
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="birthday" label="出生日期" width="120" />
      <el-table-column prop="levelId" label="护理级别" width="100" />
      <el-table-column prop="userId" label="管家" width="100" />
      
      <el-table-column prop="checkinDate" label="入住日期" width="120" />
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small">删除</el-button>
          <el-button type="primary" link size="small">修改</el-button>
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
.empty-text {
  color: #c0c4cc;
}
</style>
