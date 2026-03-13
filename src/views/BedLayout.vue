<script setup>
import { ref, onMounted } from 'vue'
import { roomApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const currentFloor = ref('一层')
const bedData = ref(null)

const floorOptions = ['一层', '二层', '三层']

const stats = ref({
  total: 0,
  kx: 0,
  yr: 0,
  wc: 0
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await roomApi.getCwsyBedVo(currentFloor.value)
    if (res.flag && res.data) {
      bedData.value = res.data
      stats.value = {
        total: res.data.zcw || 0,
        kx: res.data.kx || 0,
        yr: res.data.yr || 1,
        wc: res.data.wc || 1
      }
    }
  } finally {
    loading.value = false
  }
}

const getBedStatusText = (status) => {
  const map = { 1: '空闲', 2: '有人', 3: '外出' }
  return map[status] || '未知'
}

const getBedStatusClass = (status) => {
  if (status === 1) return 'status-free'
  if (status === 2) return 'status-occupied'
  if (status === 3) return 'status-outing'
  return ''
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="bed-layout-page">
    <div class="filter-bar">
      <div class="filter-left">
        <span class="label">楼层：</span>
        <el-select v-model="currentFloor" placeholder="请选择楼层" style="width: 140px" @change="fetchData">
          <el-option v-for="floor in floorOptions" :key="floor" :label="floor" :value="floor" />
        </el-select>
      </div>
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-icon total">🛏</span>
          <span>总床位: {{ stats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon free">🛏</span>
          <span>空闲: {{ stats.kx }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon occupied">👤</span>
          <span>有人: {{ stats.yr }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon outing">🚶</span>
          <span>外出: {{ stats.wc }}</span>
        </div>
      </div>
    </div>

    <div class="bed-grid-wrap" v-loading="loading">
      <div class="room-grid">
        <div v-for="room in bedData?.roomList || []" :key="room.id" class="room-card">
          <div class="room-header">房间 {{ room.roomNo }}</div>
          <div class="bed-list">
            <div 
              v-for="bed in room.bedList || []" 
              :key="bed.id" 
              class="bed-item"
              :class="getBedStatusClass(bed.bedStatus)"
            >
              <div class="bed-no">{{ bed.bedNo }}</div>
              <div class="bed-status">{{ getBedStatusText(bed.bedStatus) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bed-layout-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.filter-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-left .label {
  font-size: 14px;
  color: #606266;
}
.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #303133;
}
.stat-icon {
  font-size: 16px;
}
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px));
  gap: 16px;
}
.room-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e4e7ed;
}
.room-header {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
  text-align: center;
}
.bed-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.bed-item {
  flex: 1;
  min-width: 60px;
  padding: 16px 8px;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}
.bed-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.bed-no {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}
.bed-status {
  font-size: 12px;
}
.status-free {
  background: #f0f9eb;
  border: 2px solid #67c23a;
}
.status-free .bed-status {
  color: #67c23a;
}
.status-occupied {
  background: #ecf5ff;
  border: 2px solid #409eff;
}
.status-occupied .bed-status {
  color: #409eff;
}
.status-outing {
  background: #fdf6ec;
  border: 2px solid #e6a23c;
}
.status-outing .bed-status {
  color: #e6a23c;
}
</style>
