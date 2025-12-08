<script setup lang="ts">
import BlogLayout from "../layout/BlogLayout.vue";

interface LinkItem {
  href: string;
  title: string;
  desc: string;
}

const links: LinkItem[] = [
  { href: "./self-table-sp/", title: "MiyakoMeow谱面合集（SP）", desc: "SP 谱面合集" },
  { href: "./self-table-dp/", title: "MiyakoMeow谱面合集（DP）", desc: "DP 谱面合集" },
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

<style>
/* 页面特定样式 */

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.link-card {
  display: block;
  padding: 1.25rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    background 0.3s ease;
}

.link-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.06);
}

.link-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #64b5f6;
}

.link-desc {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
