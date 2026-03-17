<script setup>
import { ref, onMounted } from 'vue'
import { customerNurseItemApi, customerApi, nurseItemApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const serviceList = ref([])
const buyDialogVisible = ref(false)
const renewDialogVisible = ref(false)
const levelId = ref(0);

const buyForm = ref({
  customerId: '',
  itemId: '',
  maturityTime: '',
  nurseNumber: 1,
})

const renewForm = ref({
  id: '',
  customerId: '',
  itemId: '',
  nurseNumber: 1,
  maturityTime: '',
})

const customers = ref([])
const careItems = ref([])
const currentCustomer = ref(null)
const customerServiceList = ref([])

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

const handleSelectCustomer = async (row) => {
  currentCustomer.value = row
  const res = await customerNurseItemApi.getCustomerItemList({
    customerId: row.id,
    page: 1
  })
  if (res.flag && res.data) {
    customerServiceList.value = res.data.records || res.data || []
    levelId.value = row.levelId
  }
}

const handleBuy = () => {
  buyForm.value = { customerId: '', itemId: '', buyTime: '', maturityTime: '', nurseNumber: 1 }
  buyDialogVisible.value = true
}

const handleRenew = (row) => {
  renewForm.value = {
    id: row.id,
    customerId: row.custormerId,
    itemId: row.itemId,
    nurseNumber: row.nurseNumber || 1,
    maturityTime: '',
  }
  renewDialogVisible.value = true
}

const submitRenew = async () => {
  const res = await customerNurseItemApi.enewNurseItem({
    id: renewForm.value.id,
    custormerId: renewForm.value.customerId,
    levelId: levelId.value,
    itemId: renewForm.value.itemId,
    nurseNumber: renewForm.value.nurseNumber,
    maturityTime: renewForm.value.maturityTime,
    isDeleted: 0,
  })
  if (res.flag) {
    ElMessage.success('续费成功')
    renewDialogVisible.value = false
    if (currentCustomer.value) {
      handleSelectCustomer(currentCustomer.value)
    }
  } else {
    ElMessage.error(res.message || '续费失败')
  }
}

const handleRemove = (row) => {
  ElMessageBox.confirm('确定要移除该护理项目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await customerNurseItemApi.removeCustomerItem(row.id)
    if (res.flag) {
      ElMessage.success('已移除')
      if (currentCustomer.value) {
        handleSelectCustomer(currentCustomer.value)
      }
    } else {
      ElMessage.error(res.message || '移除失败')
    }
  }).catch(() => {})
}

const submitBuy = async () => {
  if (!buyForm.value.customerId || !buyForm.value.itemId) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const res = await customerNurseItemApi.addItemToCustomer([{
    custormerId: buyForm.value.customerId,
    itemId: buyForm.value.itemId,
    levelId: levelId.value,
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

const getGenderText = (sex) => {
  return sex === 0 ? '男' : '女'
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

    <div class="table-container">
      <div class="table-left">
        <div class="table-title">客户列表</div>
        <el-table 
          :data="customers" 
          v-loading="loading" 
          stripe 
          highlight-current-row
          @row-click="handleSelectCustomer"
          style="width: 100%"
        >
          <el-table-column prop="customerName" label="姓名" min-width="80" />
          <el-table-column prop="customerSex" label="性别" min-width="50">
            <template #default="{ row }">
              {{ getGenderText(row.customerSex) }}
            </template>
          </el-table-column>
          <el-table-column prop="bedNo" label="床位号" min-width="80" />
          <el-table-column prop="levelName" label="护理级别" min-width="100" />
        </el-table>
        <div class="pagination-wrap">
          <el-pagination background layout="total, prev, pager, next" :total="customers.length" :page-size="10" />
        </div>
      </div>

      <div class="table-right">
        <div class="table-title">
          {{ currentCustomer ? `${currentCustomer.customerName} - 护理项目` : '请选择客户' }}
        </div>
        <el-table :data="customerServiceList" stripe style="width: 100%">
          <el-table-column prop="serialNumber" label="项目编号" min-width="80" />
          <el-table-column prop="nursingName" label="项目名称" min-width="100" />
          <el-table-column prop="nurseNumber" label="购买次数" min-width="80" />
          <el-table-column prop="buyTime" label="购买日期" min-width="100" />
          <el-table-column prop="maturityTime" label="到期日期" min-width="100" />
          <el-table-column prop="servicePrice" label="价格" min-width="60" />
          <el-table-column label="操作" min-width="120">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleRenew(row)">续费</el-button>
              <el-button type="danger" link size="small" @click="handleRemove(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap">
          <el-pagination background layout="total, prev, pager, next" :total="customerServiceList.length" :page-size="10" />
        </div>
      </div>
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

    <el-dialog v-model="renewDialogVisible" title="续费服务" width="400px">
      <el-form :model="renewForm" label-width="100px">
        <el-form-item label="服务次数">
          <el-input-number v-model="renewForm.nurseNumber" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="新到期日期">
          <el-date-picker v-model="renewForm.maturityTime" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
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
.table-container {
  display: flex;
  gap: 20px;
}
.table-left {
  flex: 1;
  min-width: 300px;
}
.table-right {
  flex: 1;
  min-width: 400px;
}
.table-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}
</style>
