<script setup lang="ts">
import BlogLayout from "./layout/BlogLayout.vue";
import "./styles/main.css";
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
@reference "tailwindcss";

.link-list {
  @apply flex flex-col gap-4 items-center;
}

.link-item {
  @apply inline-block px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[12px] text-white no-underline;
  transition: all 0.2s ease;
}

.link-item:hover {
  @apply bg-white/20;
  transform: translateY(-2px);
}
</style>
