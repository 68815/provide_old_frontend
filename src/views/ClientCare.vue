<script setup>
import { ref, onMounted } from 'vue'
import { customerApi, careLevelApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const customerList = ref([])
const careLevels = ref([])
const dialogVisible = ref(false)
const currentCustomer = ref(null)

const form = ref({
  careLevel: '',
  careItems: []
})

const allCareItems = ['喂饭', '翻身', '擦浴', '如厕护理', '服药管理', '健康监测', '康复训练', '心理疏导']

const fetchData = async () => {
  loading.value = true
  try {
    const res = await customerApi.getCustomerList({ pageSize: 50 })
    customerList.value = res.data.list
    const levelRes = await careLevelApi.getCareLevelList()
    careLevels.value = levelRes.data.list
  } finally {
    loading.value = false
  }
}

const handleConfig = (row) => {
  currentCustomer.value = row
  form.value = {
    careLevel: row.careLevel || '',
    careItems: []
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await customerApi.updateCustomer({
    id: currentCustomer.value.id,
    careLevel: form.value.careLevel,
    careItems: form.value.careItems
  })
  ElMessage.success('配置成功')
  dialogVisible.value = false
  fetchData()
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
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="60" />
      <el-table-column prop="age" label="年龄" width="70" />
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="careLevel" label="护理级别" width="120">
        <template #default="{ row }">
          <el-tag size="small" v-if="row.careLevel">{{ row.careLevel }}</el-tag>
          <span v-else class="empty-text">未设置</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag size="small" :type="row.status === '在住' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="checkInDate" label="入住日期" width="120" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleConfig(row)">配置护理</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination background layout="total, prev, pager, next" :total="customerList.length" :page-size="10" />
    </div>

    <el-dialog v-model="dialogVisible" title="配置客户护理" width="500px">
      <div class="customer-info-dialog">
        <span>客户：{{ currentCustomer?.name }}</span>
        <span style="margin-left: 20px">床位：{{ currentCustomer?.bedNo }}</span>
      </div>
      <el-form :model="form" label-width="100px" style="margin-top: 20px">
        <el-form-item label="护理级别">
          <el-select v-model="form.careLevel" placeholder="请选择护理级别" style="width: 100%">
            <el-option v-for="level in careLevels" :key="level.id" :label="level.name" :value="level.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="额外护理项目">
          <el-select v-model="form.careItems" multiple placeholder="请选择额外护理项目" style="width: 100%">
            <el-option v-for="item in allCareItems" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
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
