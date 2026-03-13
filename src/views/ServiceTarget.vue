<script setup>
import { ref, onMounted } from 'vue'
import { userApi, customerApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const butlerList = ref([])
const dialogVisible = ref(false)
const currentButler = ref(null)

const customers = ref([])
const selectedCustomers = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await userApi.getUserList({ roleId: 2 })
    if (res.flag && res.data) {
      butlerList.value = res.data.records || res.data
    }
    const customerRes = await customerApi.getCustomerList({ page: 1 })
    if (customerRes.flag && customerRes.data) {
      customers.value = customerRes.data.records || customerRes.data
    }
  } finally {
    loading.value = false
  }
}

const handleConfig = (row) => {
  currentButler.value = row
  selectedCustomers.value = []
  dialogVisible.value = true
}

const handleSubmit = async () => {
  ElMessage.success('配置成功')
  dialogVisible.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="service-target-page">
    <div class="filter-bar">
      <div class="page-title">设置服务对象</div>
    </div>

    <el-table :data="butlerList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="nickname" label="健康管家" width="150" />
      <el-table-column prop="phoneNumber" label="联系电话" width="150" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleConfig(row)">配置客户</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="`配置服务对象 - ${currentButler?.nickname}`" width="600px">
      <div class="dialog-tip">
        请选择要分配给 <strong>{{ currentButler?.nickname }}</strong> 的服务客户
      </div>
      <el-transfer
        v-model="selectedCustomers"
        :data="customers.map(c => ({ key: c.id, label: `${c.customerName} (${c.bedNo})` }))"
        :titles="['可选客户', '已选客户']"
        style="margin-top: 20px"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.service-target-page {
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
.empty-text {
  color: #c0c4cc;
}
.dialog-tip {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}
</style>
