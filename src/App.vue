<script setup lang="ts">
import BlogLayout from "./layout/BlogLayout.vue";
import "./styles/main.pcss";
import QuickActions from "./components/QuickActions.vue";
import "./App.pcss";
</script>

<template>
  <BlogLayout>
    <section class="glass-container">
      <h1 class="content-title">导航</h1>
      <div class="link-list">
        <a class="link-item" href="/bms/index.html">BMS</a>
        <a class="link-item" href="/bms/table/self-sp/index.html">谱面合集（SP）</a>
        <a class="link-item" href="/bms/table/self-dp/index.html">谱面合集（DP）</a>
        <a class="link-item" href="/bms/table-mirror/index.html">表镜像</a>
      </div>
    </section>
  </BlogLayout>
  <QuickActions />
</template>
