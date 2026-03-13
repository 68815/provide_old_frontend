<script setup>
import { ref, onMounted } from 'vue'
import { customerNurseItemApi, customerApi, nurseItemApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const serviceList = ref([])
const buyDialogVisible = ref(false)

const buyForm = ref({
  customerId: '',
  itemId: '',
  buyTime: '',
  maturityTime: '',
  nurseNumber: 1,
})

const customers = ref([])
const careItems = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await customerNurseItemApi.getCustomerItemList({})
    if (res.flag && res.data) {
      serviceList.value = res.data.records || res.data
    }
    const customerRes = await customerApi.getCustomerList({ page: 1 })
    if (customerRes.flag && customerRes.data) {
      customers.value = customerRes.data.records || customerRes.data
    }
    const itemRes = await nurseItemApi.getNurseItemList({})
    if (itemRes.flag && itemRes.data) {
      careItems.value = itemRes.data.records || itemRes.data
    }
  } finally {
    loading.value = false
  }
}

const handleBuy = () => {
  buyForm.value = { customerId: '', itemId: '', buyTime: '', maturityTime: '', nurseNumber: 1 }
  buyDialogVisible.value = true
}

const submitBuy = async () => {
  if (!buyForm.value.customerId || !buyForm.value.itemId) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const res = await customerNurseItemApi.addItemToCustomer([{
    custormerId: buyForm.value.customerId,
    itemId: buyForm.value.itemId,
    buyTime: buyForm.value.buyTime,
    maturityTime: buyForm.value.maturityTime,
    nurseNumber: buyForm.value.nurseNumber,
  }])
  if (res.flag) {
    ElMessage.success('购买成功')
    buyDialogVisible.value = false
    fetchData()
  } else {
    ElMessage.error(res.message || '购买失败')
  }
}

const getStatusText = (status) => {
  if (!status) return '服务中'
  return status === 1 ? '已到期' : '服务中'
}

const getStatusType = (status) => {
  if (!status) return 'success'
  return status === 1 ? 'danger' : 'success'
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
      <el-table-column prop="itemName" label="服务名称" width="150">
        <template #default="{ row }">
          <el-tag size="small">{{ row.itemName || row.nursingName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="buyTime" label="购买日期" width="120" />
      <el-table-column prop="maturityTime" label="到期日期" width="120" />
      <el-table-column prop="nurseNumber" label="剩余次数" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
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
            <el-option v-for="c in customers" :key="c.id" :label="`${c.customerName} (${c.bedNo})`" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务项目">
          <el-select v-model="buyForm.itemId" placeholder="请选择服务" style="width: 100%">
            <el-option v-for="s in careItems" :key="s.id" :label="s.nursingName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="购买日期">
          <el-date-picker v-model="buyForm.buyTime" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="到期日期">
          <el-date-picker v-model="buyForm.maturityTime" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="服务次数">
          <el-input-number v-model="buyForm.nurseNumber" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="buyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBuy">确定购买</el-button>
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
