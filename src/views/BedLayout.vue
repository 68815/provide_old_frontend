<script setup>
import { ref, onMounted, computed } from 'vue'
import { roomApi } from '../api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const currentFloor = ref('一楼')
const bedData = ref(null)

const floorOptions = ['一楼', '二楼', '三楼']

const stats = ref({
  total: 0,
  kx: 0,
  yr: 0,
  wc: 0
})

const specialRooms = [
  { id: 'special-1', name: '电梯厅', icon: '🛗' },
  { id: 'special-2', name: '洗衣房', icon: '🧺' },
  { id: 'special-3', name: '活动中心', icon: '🎭' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await roomApi.getCwsyBedVo(currentFloor.value)
    if (res.flag && res.data) {
      bedData.value = res.data
      stats.value = {
        total: res.data.zcw || 0,
        kx: res.data.kx || 0,
        yr: res.data.yr || 0,
        wc: res.data.wc || 0
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
    <div class="header-bar">
      <div class="floor-tabs">
        <el-select v-model="currentFloor" @change="fetchData" placeholder="楼层选择" style="width: 120px">
          <el-option
            v-for="floor in floorOptions"
            :key="floor"
            :label="floor"
            :value="floor"
          />
        </el-select>
      </div>
      <div class="stats-bar">
        <span class="stat-tag total">总床位: {{ stats.total }}</span>
        <span class="stat-tag free">空闲: {{ stats.kx }}</span>
        <span class="stat-tag occupied">有人: {{ stats.yr }}</span>
        <span class="stat-tag outing">外出: {{ stats.wc }}</span>
      </div>
    </div>

    <div class="bed-grid-wrap" v-loading="loading">
      <div class="room-grid" v-if="bedData?.roomList?.length">
        <div class="room-card special-room empty-slot"></div>
        <div 
          v-if="currentFloor==='一楼'"
          v-for="room in specialRooms" 
          :key="room.id" 
          class="room-card special-room"
        >
          <div class="room-icon">{{ room.icon }}</div>
          <div class="room-name">{{ room.name }}</div>
        </div>
        <div v-for="room in bedData.roomList" :key="room.id" class="room-card">
          <div class="room-header">{{ room.roomNo }} 房间</div>
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
      <el-empty v-else description="暂无床位数据" />
    </div>
  </div>
</template>

<style scoped>
.bed-layout-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: calc(100vh - 140px);
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}
.floor-tabs {
  display: flex;
  align-items: center;
}
.stats-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-tag {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
}
.stat-tag.total {
  background: #909399;
}
.stat-tag.free {
  background: #67c23a;
}
.stat-tag.occupied {
  background: #409eff;
}
.stat-tag.outing {
  background: #e6a23c;
}
.bed-grid-wrap {
  min-height: 300px;
}
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}
.room-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #dcdfe6;
}
.room-header {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 1px dashed #dcdfe6;
}
.bed-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}
.bed-item {
  width: 60px;
  padding: 8px 6px;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}
.bed-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.bed-no {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}
.bed-status {
  font-size: 11px;
}
.status-free {
  background: #f0f9eb;
  border: 2px solid #67c23a;
}
.status-free .bed-no {
  color: #67c23a;
}
.status-free .bed-status {
  color: #67c23a;
}
.status-occupied {
  background: #ecf5ff;
  border: 2px solid #409eff;
}
.status-occupied .bed-no {
  color: #409eff;
}
.status-occupied .bed-status {
  color: #409eff;
}
.status-outing {
  background: #fdf6ec;
  border: 2px solid #e6a23c;
}
.status-outing .bed-no {
  color: #e6a23c;
}
.status-outing .bed-status {
  color: #e6a23c;
}
.special-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}
.special-room.empty-slot {
  background: transparent;
  border: 2px dashed #dcdfe6;
  padding: 12px 16px;
}
.room-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
.room-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
</style>
