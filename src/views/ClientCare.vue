<script setup>
import { ref, onMounted } from 'vue'
import { customerApi, nurseLevelApi, customerNurseItemApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const customerList = ref([])
const careLevels = ref([])
const dialogVisible = ref(false)
const levelDialogVisible = ref(false)
const currentCustomer = ref(null)

const form = ref({
  levelId: '',
})

const levelForm = ref({
  levelId: '',
})
const nurseItems = ref([])
const selectedItems = ref([])
const levelLoading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await customerApi.getCustomerList({ page: 1 })
    if (res.flag && res.data) {
      customerList.value = res.data.records || res.data
    }
    const levelRes = await nurseLevelApi.getNurseLevelList({})
    if (levelRes.flag && levelRes.data) {
      careLevels.value = levelRes.data
    }
  } finally {
    loading.value = false
  }
}

const handleConfig = (row) => {
  currentCustomer.value = row
  form.value = {
    levelId: row.levelId || '',
  }
  dialogVisible.value = true
}

const handleSetLevel = (row) => {
  currentCustomer.value = row
  levelForm.value = { levelId: '' }
  selectedItems.value = []
  nurseItems.value = []
  levelDialogVisible.value = true
}

const handleRemoveLevel = (row) => {
  ElMessageBox.confirm('确定要移除该客户的护理级别吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await customerNurseItemApi.removeCustomerLevelAndItem(row.id, row.levelId)
    if (res.flag) {
      ElMessage.success('已移除护理级别')
      fetchData()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  }).catch(() => {})
}

const handleLevelChange = async (levelId) => {
  if (!levelId) {
    nurseItems.value = []
    return
  }
  levelLoading.value = true
  try {
    const res = await nurseLevelApi.getNurseItemsByLevel(levelId)
    if (res.flag && res.data) {
      nurseItems.value = (res.data || []).map(item => ({
        ...item,
        quantity: 1,
        expireDate: '',
      }))
    }
  } catch (e) {
    console.error('获取护理项目失败', e)
  } finally {
    levelLoading.value = false
  }
}

const handleLevelSubmit = async () => {
  const customerId = currentCustomer.value.id
  const levelId = levelForm.value.levelId
  
  await customerApi.editCustomer({
    id: customerId,
    levelId: levelId,
  })
  
  const itemsToAdd = nurseItems.value
    .filter(item => item.quantity > 0)
    .map(item => ({
      custormerId: customerId,
      levelId: levelId,
      itemId: item.id,
      nurseNumber: item.quantity || 1,
      maturityTime: item.expireDate || '',
      buyTime: new Date().toISOString().split('T')[0],
      isDeleted: 0,
    }))
  
  if (itemsToAdd.length > 0) {
    const res = await customerNurseItemApi.addItemToCustomer(itemsToAdd)
    if (res.flag) {
      ElMessage.success('设置成功')
    } else {
      ElMessage.error(res.message || '添加护理项目失败')
    }
  } else {
    ElMessage.success('设置成功')
  }
  
  levelDialogVisible.value = false
  fetchData()
}

const handleSubmit = async () => {
  const res = await customerApi.editCustomer({
    id: currentCustomer.value.id,
    levelId: form.value.levelId,
  })
  if (res.flag) {
    ElMessage.success('配置成功')
    dialogVisible.value = false
    fetchData()
  } else {
    ElMessage.error(res.message || '配置失败')
  }
}

const getGenderText = (sex) => {
  return sex === 0 ? '男' : '女'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="client-care-page">
    <div class="filter-bar">
      <div class="page-title">客户护理设置</div>
    </div>

    <el-table :data="customerList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="customerName" label="姓名" min-width="100" />
      <el-table-column prop="customerSex" label="性别" min-width="60">
        <template #default="{ row }">
          {{ getGenderText(row.customerSex) }}
        </template>
      </el-table-column>
      <el-table-column prop="customerAge" label="年龄" min-width="70" />
      <el-table-column prop="bedNo" label="床位号" min-width="120" />
      <el-table-column prop="levelName" label="护理级别" min-width="120">
        <template #default="{ row }">
          <el-tag size="small" v-if="row.levelName">{{ row.levelName }}</el-tag>
          <span v-else class="empty-text">未设置</span>
        </template>
      </el-table-column>
      <el-table-column prop="checkinDate" label="入住日期" min-width="120" />
      <el-table-column label="操作" min-width="150" fixed="right">
        <template #default="{ row }">
          <template v-if="row.levelName == null">
            <el-button type="primary" link size="small" @click="handleSetLevel(row)">设置护理级别</el-button>
          </template>
          <template v-else>
            <el-button type="danger" link size="small" @click="handleRemoveLevel(row)">移除护理级别</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination background layout="total, prev, pager, next" :total="customerList.length" :page-size="10" />
    </div>

    <el-dialog v-model="dialogVisible" title="配置客户护理" min-width="500px">
      <div class="customer-info-dialog">
        <span>客户：{{ currentCustomer?.customerName }}</span>
        <span style="margin-left: 20px">床位：{{ currentCustomer?.bedNo }}</span>
      </div>
      <el-form :model="form" label-width="100px" style="margin-top: 20px">
        <el-form-item label="护理级别">
          <el-select v-model="form.levelId" placeholder="请选择护理级别" style="min-width: 100%">
            <el-option v-for="level in careLevels" :key="level.id" :label="level.levelName" :value="level.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="levelDialogVisible" title="设置护理级别" min-width="600px">
      <div class="customer-info-dialog">
        <span>客户：{{ currentCustomer?.customerName }}</span>
        <span style="margin-left: 20px">床位：{{ currentCustomer?.bedNo }}</span>
      </div>
      <el-form :model="levelForm" label-width="100px" style="margin-top: 20px">
        <el-form-item label="护理级别">
          <el-select 
            v-model="levelForm.levelId" 
            placeholder="请选择护理级别" 
            style="min-width: 100%"
            @change="handleLevelChange"
          >
            <el-option v-for="level in careLevels" :key="level.id" :label="level.levelName" :value="level.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div v-loading="levelLoading" v-if="nurseItems.length > 0">
        <div style="margin-bottom: 10px; color: #606266; font-size: 14px">护理项目：</div>
        <el-table :data="nurseItems" stripe size="small" style="width: 100%">
          <el-table-column prop="serialNumber" label="编号" min-width="80" />
          <el-table-column prop="nursingName" label="项目名称" min-width="120" />
          <el-table-column prop="executionCycle" label="执行周期" min-width="80" />
          <el-table-column prop="executionTimes" label="执行次数" min-width="80" />
          <el-table-column prop="servicePrice" label="价格" min-width="80" />
          <el-table-column label="购买数量" min-width="150" >
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" style="min-width: 30px" />
            </template>
          </el-table-column>
          <el-table-column label="服务到期时间" min-width="120" >
            <template #default="{ row }">
              <el-date-picker v-model="row.expireDate" type="date" value-format="yyyy-MM-dd" placeholder="选择服务到期时间" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="levelForm.levelId && nurseItems.length === 0 && !levelLoading" style="color: #909399; text-align: center; padding: 20px">
        该护理级别暂未配置护理项目
      </div>
      <template #footer>
        <el-button @click="levelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleLevelSubmit" :disabled="!levelForm.levelId">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.client-care-page {
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
.customer-info-dialog {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}
</style>
