<script setup>
import { ref, onMounted } from 'vue'
import { bedApi, roomApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const recordList = ref([])
const customerName = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isDeleted = ref(0)

const dialogVisible = ref(false)
const formRef = ref(null)

const roomData = ref([])
const buildingOptions = ref([])
const roomNoOptions = ref([])
const bedNoOptions = ref([])

const detailDialogVisible = ref(false)
const detailFormRef = ref(null)

const exchangeForm = ref({
  id: null,
  customerId: null,
  customerName: '',
  oldBedId: null,
  oldRoomNo: '',
  newBedId: null,
  newRoomNo: '',
  buildingNo: '',
  endDate: '',
})

const detailForm = ref({
  id: null,
  customerId: null,
  customerName: '',
  bedId: null,
  roomNo: '',
  bedDetails: '',
  startDate: '',
  endDate: '',
  isDeleted: 0,
})

const detailRules = {
  endDate: [{ required: true, message: '请选择床位结束日期', trigger: 'change' }],
}

const rules = {
  newBedId: [{ required: true, message: '请选择新床位', trigger: 'change' }],
  newRoomNo: [{ required: true, message: '请输入新房间号', trigger: 'blur' }],
  buildingNo: [{ required: true, message: '请输入新楼号', trigger: 'blur' }],
}

const isDeletedOptions = [
  { label: '正在使用', value: 0 },
  { label: '使用历史', value: 1 },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await bedApi.getBedDetailsList({
      page: currentPage.value,
      customerName: customerName.value,
      startDate: dateRange.value?.[0] || '',
      endDate: dateRange.value?.[1] || '',
      isDeleted: isDeleted.value,
    })
    if (res.flag && res.data) {
      recordList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const bedExchange = async (row) => {
  exchangeForm.value = {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customerName,
    oldBedId: row.bedId,
    oldRoomNo: row.roomNo,
    newBedId: null,
    newRoomNo: '',
    buildingNo: '',
    endDate: row.endDate,
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    const res = await bedApi.exchangeBed({
      id: exchangeForm.value.id,
      customerId: exchangeForm.value.customerId,
      oldBedId: exchangeForm.value.oldBedId,
      newBedId: exchangeForm.value.newBedId,
      newRoomNo: exchangeForm.value.newRoomNo,
      buildingNo: exchangeForm.value.buildingNo,
      endDate: exchangeForm.value.endDate,
    })
    if (res.flag) {
      ElMessage.success('床位调换成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.message || '调换失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '调换失败')
  }
}

const showDetail = (row) => {
  detailForm.value = {
    id: row.id,
    customerId: row.customerId,
    customerName: row.customerName,
    bedId: row.bedId,
    roomNo: row.roomNo,
    bedDetails: row.bedDetails,
    startDate: row.startDate,
    endDate: row.endDate,
    isDeleted: row.isDeleted,
  }
  detailDialogVisible.value = true
}

const handleDetailSubmit = async () => {
  const valid = await detailFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    const res = await bedApi.updateBedDetails({
      id: detailForm.value.id,
      bedId: detailForm.value.bedId,
      customerId: detailForm.value.customerId,
      startDate: detailForm.value.startDate,
      endDate: detailForm.value.endDate,
      bedDetails: detailForm.value.bedDetails,
      isDeleted: detailForm.value.isDeleted,
    })
    if (res.flag) {
      ElMessage.success('更新成功')
      detailDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const formatDate = (date) => {
  if (!date) return '-'
  return date
}

const loadRoomData = async () => {
  const res = await roomApi.getRoomList()
  if (res.flag && res.data) {
    roomData.value = res.data
    buildingOptions.value = [...new Set(res.data.map(r => r.roomFloor))].map(f => ({
      value: f,
      label: f
    }))
  }
}

const handleBuildingChange = (buildingNo) => {
  exchangeForm.value.newRoomNo = ''
  exchangeForm.value.newBedId = null
  roomNoOptions.value = []
  bedNoOptions.value = []
  
  if (buildingNo) {
    const rooms = roomData.value.filter(r => r.roomFloor === buildingNo)
    roomNoOptions.value = [...new Set(rooms.map(r => r.roomNo))].map(no => ({
      value: no,
      label: String(no)
    }))
  }
}

const handleRoomNoChange = (roomNo) => {
  exchangeForm.value.newBedId = null
  bedNoOptions.value = []
  
  const buildingNo = exchangeForm.value.buildingNo
  if (buildingNo && roomNo) {
    const room = roomData.value.find(r => r.roomFloor === buildingNo && r.roomNo === roomNo)
    if (room && room.bedList) {
      bedNoOptions.value = room.bedList.filter(b => b.bedStatus === 1).map(b => ({
        value: b.id,
        label: b.bedNo
      }))
    }
  }
}

const handleBedChange = (bedId) => {
  const buildingNo = exchangeForm.value.buildingNo
  const roomNo = exchangeForm.value.newRoomNo
  if (buildingNo && roomNo && bedId) {
    const room = roomData.value.find(r => r.roomFloor === buildingNo && r.roomNo === roomNo)
    if (room && room.bedList) {
      const bed = room.bedList.find(b => b.id === bedId)
      if (bed) {
        exchangeForm.value.buildingNo = buildingNo
        exchangeForm.value.newRoomNo = String(roomNo)
        exchangeForm.value.newBedId = bedId
      }
    }
  }
}

onMounted(() => {
  fetchData()
  loadRoomData()
})
</script>

<template>
  <div class="bed-record-page">
    <div class="page-header">
      <h3 class="page-title">床位使用记录</h3>
    </div>
    
    <div class="filter-bar">
      <div class="filter-left">
        <span class="label">姓名：</span>
        <el-input v-model="customerName" placeholder="请输入姓名" style="width: 120px" clearable @keyup.enter="fetchData" />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px; margin-left: 16px"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" style="margin-left: 8px" @click="fetchData">搜索</el-button>
      </div>
    </div>
    <div style="margin-bottom: 16px">
      <el-radio-group v-model="isDeleted" @change="fetchData">
        <el-radio-button 
          v-for="item in isDeletedOptions" 
          :key="item.value" 
          :value="item.value"
        >
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </div>
    <el-table :data="recordList" v-loading="loading" stripe style="width: 100%">
      <el-table-column type="index" label="序号" width="80" header-align="left" />
      <el-table-column prop="customerName" label="客户姓名" width="100" header-align="left" />
      <el-table-column prop="customerSex" label="性别" width="80" header-align="left">
        <template #default="{ row }">
          {{ row.customerSex === 0 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="roomNo" label="房间号" width="100" header-align="left" />
      <el-table-column prop="bedDetails" label="床位详情" min-width="150" header-align="left" />
      <el-table-column prop="startDate" label="床位使用起始日期" width="160" header-align="left">
        <template #default="{ row }">
          {{ formatDate(row.startDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="endDate" label="床位使用结束日期" width="160" header-align="left">
        <template #default="{ row }">
          {{ formatDate(row.endDate) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" fixed="right" header-align="left">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click = "bedExchange(row)">床位调换</el-button>
          <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="床位调换" width="500px">
      <el-form ref="formRef" :model="exchangeForm" :rules="rules" label-width="100px">
        <el-form-item label="客户姓名">
          <el-input v-model="exchangeForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="床位结束使用日期">
          <el-input v-model="exchangeForm.endDate" disabled />
        </el-form-item>
        <el-form-item label="原房间号">
          <el-input v-model="exchangeForm.oldRoomNo" disabled />
        </el-form-item>
        <el-form-item label="新楼号" prop="buildingNo">
          <el-select 
            v-model="exchangeForm.buildingNo" 
            placeholder="请选择楼号" 
            style="width: 100%"
            @change="handleBuildingChange"
          >
            <el-option 
              v-for="item in buildingOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="新房间号" prop="newRoomNo">
          <el-select 
            v-model="exchangeForm.newRoomNo" 
            placeholder="请选择房间号" 
            style="width: 100%"
            :disabled="!exchangeForm.buildingNo"
            @change="handleRoomNoChange"
          >
            <el-option 
              v-for="item in roomNoOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="新床位" prop="newBedId">
          <el-select 
            v-model="exchangeForm.newBedId" 
            placeholder="请选择床位" 
            style="width: 100%"
            :disabled="!exchangeForm.newRoomNo"
          >
            <el-option 
              v-for="item in bedNoOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="床位详情" width="500px">
      <el-form ref="detailFormRef" :model="detailForm" :rules="detailRules" label-width="120px">
        <el-form-item label="客户姓名">
          <el-input v-model="detailForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="房间号">
          <el-input v-model="detailForm.roomNo" disabled />
        </el-form-item>
        <el-form-item label="床位详情">
          <el-input v-model="detailForm.bedDetails" disabled />
        </el-form-item>
        <el-form-item label="床位使用起始日期">
          <el-input v-model="detailForm.startDate" disabled />
        </el-form-item>
        <el-form-item label="床位使用结束日期" prop="endDate">
          <el-date-picker
            v-model="detailForm.endDate"
            type="datetime"
            placeholder="请选择床位结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDetailSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.bed-record-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 12px;
}
.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}
.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
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
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
