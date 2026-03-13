<script setup>
import { ref, onMounted } from 'vue'
import { healthButlerApi, customerApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const serviceList = ref([])
const buyDialogVisible = ref(false)
const renewDialogVisible = ref(false)

const buyForm = ref({
  customerId: '',
  serviceName: '',
  duration: 6
})

const renewForm = ref({
  id: null,
  duration: 6
})

const customers = ref([])
const serviceOptions = ['日常护理', '健康监测', '康复训练', '心理疏导', '特殊护理']
const durationOptions = [
  { label: '3个月', value: 3 },
  { label: '6个月', value: 6 },
  { label: '12个月', value: 12 }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await healthButlerApi.getCustomerServiceList()
    serviceList.value = res.data.list
    const customerRes = await customerApi.getCustomerList({ pageSize: 100, status: '在住' })
    customers.value = customerRes.data.list
  } finally {
    loading.value = false
  }
}

const handleBuy = () => {
  buyForm.value = { customerId: '', serviceName: '', duration: 6 }
  buyDialogVisible.value = true
}

const handleRenew = (row) => {
  renewForm.value = { id: row.id, duration: 6 }
  renewDialogVisible.value = true
}

const submitBuy = async () => {
  if (!buyForm.value.customerId || !buyForm.value.serviceName) {
    ElMessage.warning('请填写完整信息')
    return
  }
  await healthButlerApi.buyService(buyForm.value)
  ElMessage.success('购买成功')
  buyDialogVisible.value = false
  fetchData()
}

const submitRenew = async () => {
  await healthButlerApi.renewService(renewForm.value)
  ElMessage.success('续费成功')
  renewDialogVisible.value = false
  fetchData()
}

const getStatusType = (status) => {
  const map = { '服务中': 'success', '已到期': 'danger', '待续费': 'warning' }
  return map[status] || 'info'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="service-focus-page">
    <div class="filter-bar">
      <div class="page-title">服务关注</div>
      <el-button type="primary" @click="handleBuy">购买服务</el-button>
    </div>

    <el-table :data="serviceList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="customerName" label="客户姓名" width="100" />
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="butlerName" label="健康管家" width="120" />
      <el-table-column prop="serviceName" label="服务名称" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.serviceName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="endDate" label="结束日期" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="服务费用" width="100">
        <template #default="{ row }">
          <span style="color: #f56c6c">¥{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleRenew(row)" v-if="row.status !== '服务中'">续费</el-button>
          <span v-else class="empty-text">-</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination background layout="total, prev, pager, next" :total="serviceList.length" :page-size="10" />
    </div>

    <el-dialog v-model="buyDialogVisible" title="购买服务" width="500px">
      <el-form :model="buyForm" label-width="100px">
        <el-form-item label="选择客户">
          <el-select v-model="buyForm.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="c in customers" :key="c.id" :label="`${c.name} (${c.bedNo})`" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称">
          <el-select v-model="buyForm.serviceName" placeholder="请选择服务" style="width: 100%">
            <el-option v-for="s in serviceOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务时长">
          <el-radio-group v-model="buyForm.duration">
            <el-radio v-for="d in durationOptions" :key="d.value" :value="d.value">{{ d.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="buyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBuy">确定购买</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="renewDialogVisible" title="服务续费" width="400px">
      <el-form :model="renewForm" label-width="100px">
        <el-form-item label="续费时长">
          <el-radio-group v-model="renewForm.duration">
            <el-radio v-for="d in durationOptions" :key="d.value" :value="d.value">{{ d.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRenew">确定续费</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.service-focus-page {
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
