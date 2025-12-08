<script setup lang="ts">
import BlogLayout from "./layout/BlogLayout.vue";
</script>

<template>
  <BlogLayout>
    <section class="glass-container">
      <h1 class="content-title">导航</h1>
      <div class="link-list">
        <a class="link-item" href="./bms/index.html">BMS</a>
        <a class="link-item" href="./bms/self-table-sp/index.html">谱面合集（SP）</a>
        <a class="link-item" href="./bms/self-table-dp/index.html">谱面合集（DP）</a>
      </div>
    </section>
  </BlogLayout>
</template>

<style scoped>
.link-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.link-item {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
}

.link-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
</style>
