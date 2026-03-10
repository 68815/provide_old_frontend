<script setup>
import { ref, computed } from 'vue'

const currentFloor = ref('一层')
const floorOptions = [
  { label: '一层', value: '一层' },
  { label: '二层', value: '二层' },
  { label: '三层', value: '三层' },
]

// 床位状态统计（示例数据）
const stats = ref({
  total: 50,
  free: 20,
  occupied: 20,
  outing: 10,
})

// 床位状态：free 空闲(红) | occupied 有人(蓝) | outing 外出(蓝床+人)
const bedStatusList = [
  { room: '1001-1', status: 'free' },
  { room: '1001-2', status: 'occupied' },
  { room: '1002', status: 'free' },
  { room: '1003', status: 'occupied' },
  { room: '1004', status: 'outing' },
  { room: '1005', status: 'free' },
]

// 网格：行头 1001(下分1001-1,1001-2)、1005；列头 1002,1003,1004；公共区域 电梯厅、洗衣房、活动中心
const rowLabels = [
  { id: '1001', sub: ['1001-1', '1001-2'] },
  { id: '1005' },
]
const colLabels = ['1002', '1003', '1004']
const commonAreas = [
  { name: '电梯厅', color: '#5cadad', span: 3 },
  { name: '洗衣房', color: '#2d6a4f', span: 3 },
  { name: '活动中心', color: '#74c69d', span: 3 },
]

function getBedStatus(roomOrBed) {
  const item = bedStatusList.find((b) => b.room === roomOrBed)
  return item ? item.status : 'free'
}
</script>

<template>
  <div class="bed-layout-page">
    <!-- 顶部筛选与统计 -->
    <div class="filter-bar">
      <div class="filter-left">
        <span class="label">楼层：</span>
        <el-select
          v-model="currentFloor"
          placeholder="请选择楼层"
          style="width: 140px"
        >
          <el-option
            v-for="opt in floorOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-icon total">🛏</span>
          <span>总床位: {{ stats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon free">🛏</span>
          <span>空闲: {{ stats.free }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon occupied">👤</span>
          <span>有人: {{ stats.occupied }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon outing">🛏👤</span>
          <span>外出: {{ stats.outing }}</span>
        </div>
      </div>
    </div>

    <!-- 床位布局网格 -->
    <div class="bed-grid-wrap">
      <table class="bed-table">
        <thead>
          <tr>
            <th class="corner" />
            <th v-for="col in colLabels" :key="col" class="col-header">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="area in commonAreas" :key="area.name">
            <td class="row-header">{{ area.name }}</td>
            <td
              :colspan="area.span"
              class="area-cell"
              :style="{ background: area.color }"
            >
              {{ area.name }}
            </td>
          </tr>
          <template v-for="row in rowLabels" :key="row.id">
            <template v-if="row.sub">
              <tr v-for="sub in row.sub" :key="sub">
                <td class="row-header">
                  <span class="bed-dot" :class="getBedStatus(sub)" />
                  {{ sub }}
                </td>
                <td v-for="col in colLabels" :key="col" class="bed-cell">
                  <span class="bed-dot free" />
                  <span class="bed-num">床位</span>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td class="row-header">{{ row.id }}</td>
              <td v-for="col in colLabels" :key="col" class="bed-cell">
                <span class="bed-num">房间号</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
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
.stat-icon.total { filter: none; }
.stat-icon.free { filter: hue-rotate(-60deg); }
.stat-icon.occupied { color: #409eff; }
.stat-icon.outing { color: #409eff; }
.bed-grid-wrap {
  overflow-x: auto;
}
.bed-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 520px;
  background: #fff;
}
.bed-table th,
.bed-table td {
  border: 1px solid #e4e7ed;
  padding: 10px 12px;
  font-size: 13px;
  text-align: center;
  vertical-align: middle;
}
.corner {
  width: 100px;
  background: #f5f7fa;
}
.col-header,
.row-header {
  background: #f5f7fa;
  font-weight: 500;
  color: #303133;
}
.row-header {
  width: 100px;
  text-align: center;
}
.row-header .bed-dot {
  margin-right: 6px;
  vertical-align: middle;
}
.bed-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 2px;
}
.bed-dot.free {
  background: #f56c6c;
}
.bed-dot.occupied {
  background: #409eff;
}
.bed-dot.outing {
  background: linear-gradient(135deg, #409eff 50%, #79bbff 50%);
}
.area-cell {
  color: #fff;
  font-weight: 500;
}
.bed-cell {
  min-width: 100px;
}
.bed-cell .bed-dot {
  display: block;
  margin: 0 auto 4px;
}
.bed-num {
  font-size: 12px;
  color: #909399;
}
</style>
