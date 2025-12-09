<script setup lang="ts">
import { onMounted, ref } from "vue";
import BlogLayout from "../layout/BlogLayout.vue";
import "../styles/main.pcss";

interface LinkItem {
  href: string;
  title: string;
  desc: string;
}

const redirecting = ref(false);
const links: LinkItem[] = [
  { href: "../index.html", title: "返回 BMS", desc: "返回 BMS 页面" },
  { href: "https://github.com/MiyakoMeow/bms-table-mirror", title: "镜像仓库", desc: "查看镜像项目" },
];

onMounted(() => {
  const proxyUrl = "https://proxy.pipers.cn/";
  const params = new URLSearchParams(window.location.search);
  const tableName = params.get("table");
  if (!tableName) {
    redirecting.value = false;
    return;
  }
  const encodedTableName = encodeURIComponent(tableName);
  const targetUrl = `${proxyUrl}https://raw.githubusercontent.com/MiyakoMeow/bms-table-mirror/main/tables/${encodedTableName}/header.json`;
  redirecting.value = true;
  window.location.replace(targetUrl);
});
</script>

<template>
  <BlogLayout>
    <section class="glass-container bms-index-container">
      <h1 class="content-title">BMS 难度表镜像</h1>
      <div v-if="redirecting">正在跳转...</div>
      <div v-else class="links-grid">
        <a v-for="link in links" :key="link.href" class="link-card" :href="link.href">
          <div class="link-title">{{ link.title }}</div>
          <div class="link-desc">{{ link.desc }}</div>
        </a>
      </div>
    </section>
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
