<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '../stores/data'
import { healthButlerApi, customerApi } from '../api'
import { ElMessage } from 'element-plus'

const dataStore = useDataStore()
const loading = ref(false)
const butlerList = ref([])
const dialogVisible = ref(false)
const currentButler = ref(null)

const selectedCustomers = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await healthButlerApi.getButlerList()
    butlerList.value = res.data.list
    await dataStore.fetchCustomers()
  } finally {
    loading.value = false
  }
}

const handleConfig = (row) => {
  currentButler.value = row
  selectedCustomers.value = row.customers?.map(c => c.id) || []
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await healthButlerApi.assignButler({
    butlerId: currentButler.value.id,
    customerIds: selectedCustomers.value
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
  <div class="service-target-page">
    <div class="filter-bar">
      <div class="page-title">设置服务对象</div>
    </div>

    <el-table :data="butlerList" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="name" label="健康管家" width="150" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="serviceCount" label="服务客户数" width="120">
        <template #default="{ row }">
          <el-tag size="small" type="primary">{{ row.serviceCount }}人</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="服务客户">
        <template #default="{ row }">
          <template v-if="row.customers && row.customers.length">
            <el-tag v-for="c in row.customers" :key="c.id" size="small" style="margin-right: 4px">
              {{ c.name }} ({{ c.bedNo }})
            </el-tag>
          </template>
          <span v-else class="empty-text">暂无服务对象</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleConfig(row)">配置客户</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="`配置服务对象 - ${currentButler?.name}`" width="600px">
      <div class="dialog-tip">
        请选择要分配给 <strong>{{ currentButler?.name }}</strong> 的服务客户
      </div>
      <el-transfer
        v-model="selectedCustomers"
        :data="dataStore.customers.map(c => ({ key: c.id, label: `${c.name} (${c.bedNo})` }))"
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
