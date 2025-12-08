<script setup>
import BlogLayout from "./layout/BlogLayout.vue";
</script>

<template>
  <BlogLayout>
    <section class="content-card">
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
.content-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 100%;
  animation: fadeIn 0.8s ease-out;
}

.content-title {
  margin: 0 0 1rem;
  font-size: 2rem;
  text-align: center;
}

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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
