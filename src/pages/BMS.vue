<script setup lang="ts">
import BlogLayout from "../layout/BlogLayout.vue";
import "../styles/main.pcss";

interface LinkItem {
  href: string;
  title: string;
  desc: string;
}

const links: LinkItem[] = [
  { href: "./table/self-sp/", title: "MiyakoMeow谱面合集（SP）", desc: "SP 谱面合集" },
  { href: "./table/self-dp/", title: "MiyakoMeow谱面合集（DP）", desc: "DP 谱面合集" },
  { href: "./table-mirror/", title: "表镜像", desc: "无参数显示导航，有参数跳转" },
];
</script>

<template>
  <BlogLayout>
    <div class="glass-container bms-index-container">
      <h1 class="content-title">BMS</h1>
      <div class="links-grid">
        <a v-for="link in links" :key="link.href" class="link-card" :href="link.href">
          <div class="link-title">{{ link.title }}</div>
          <div class="link-desc">{{ link.desc }}</div>
        </a>
      </div>
    </div>
  </BlogLayout>
</template>

<style lang="postcss" scoped>
@reference "tailwindcss";

.links-grid {
  @apply grid grid-cols-[repeat(2,minmax(240px,1fr))] gap-4 mt-4;
  @media (max-width: 768px) {
    @apply grid-cols-1;
  }
}

.link-card {
  @apply block p-[1.25rem] rounded-[14px] bg-black/20 border border-white/10 text-white no-underline;
  transition:
    transform 0.15s ease,
    background 0.3s ease;
  &:hover {
    @apply bg-[rgba(255,255,255,0.06)];
    transform: translateY(-2px);
  }
}

.link-title {
  @apply text-[1.2rem] font-bold mb-[0.5rem] text-[#64b5f6];
}

.link-desc {
  @apply text-[0.95rem] text-white/80;
}
</style>
