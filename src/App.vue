<script setup>
</script>

<template>
  <div>
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}
nav a {
  color: #42b883;
  text-decoration: none;
}
nav a.router-link-active {
  font-weight: bold;
}
main {
  padding: 1rem;
}
</style>
