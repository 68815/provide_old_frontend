<script setup>
import { useCounterStore } from '../stores/counter'
const counterStore = useCounterStore()
</script>

<template>
  <div class="home">
    <h1>首页</h1>
    <p>Pinia 计数器: {{ counterStore.count }}</p>
    <el-button type="primary" @click="counterStore.increment">+1</el-button>
    <el-button type="danger" @click="counterStore.decrement">-1</el-button>
  </div>
</template>

<style scoped>
.home {
  padding: 1rem;
}
</style>
