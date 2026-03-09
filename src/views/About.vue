<script setup>
import { useCounterStore } from '../stores/counter'
const counterStore = useCounterStore()
</script>

<template>
  <div class="about">
    <h1>关于</h1>
    <p>Pinia 计数器（全局状态）: {{ counterStore.count }}</p>
  </div>
</template>

<style scoped>
.about {
  padding: 1rem;
}
</style>
