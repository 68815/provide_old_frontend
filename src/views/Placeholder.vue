<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta?.title || route.path)
</script>

<template>
  <div class="placeholder-page">
    <el-empty :description="`${title} - 功能开发中`" />
  </div>
</template>

<style scoped>
.placeholder-page {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
