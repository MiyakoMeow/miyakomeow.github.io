<script setup lang="ts">
import BlogLayout from "@/layout/BlogLayout.vue";
import QuickActions from "@/components/QuickActions.vue";
import "@/styles/main.css";
</script>

<template>
  <BlogLayout>
    <section class="glass-container">
      <h1 class="link-title">BMS</h1>
      <div class="link-list bms-main-link">
        <a class="link-item" href="/bms/index.html"> BMS 主页 </a>
      </div>

      <h2 class="link-title">其他链接</h2>
      <div class="link-list-horizontal">
        <a class="link-item" href="/bms/table/self-sp/index.html"> 谱面合集（SP） </a>
        <a class="link-item" href="/bms/table/self-dp/index.html"> 谱面合集（DP） </a>
        <a class="link-item" href="/bms/table-mirror/index.html"> 表镜像 </a>
      </div>
    </section>
  </BlogLayout>
  <QuickActions />
</template>

<style scoped>
@reference "tailwindcss";

/* 通用链接项样式 */
.link-item {
  @apply inline-block px-[1.5rem] py-[0.8rem] bg-white/10 border border-white/20 rounded-[12px] text-white no-underline;
  transition: all 0.2s ease;

  &:hover {
    @apply bg-white/20;
    transform: translateY(-2px);
  }
}

/* 链接标题样式 */
.link-title {
  @apply text-white text-center mb-8 text-[2.5rem];
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.link-list {
  @apply flex flex-col gap-4 items-center;
}

.bms-main-link {
  @apply mb-8;
}

.link-list-horizontal {
  @apply flex flex-row gap-4 justify-center items-center flex-wrap;
}

/* 通用玻璃态效果容器 */
.glass-container {
  @apply bg-white/10 backdrop-blur-[10px] rounded-[20px] p-8 mt-8 border border-white/10 text-white w-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-[fadeIn_0.8s_ease-out];
}
</style>
