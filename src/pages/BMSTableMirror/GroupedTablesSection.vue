<script setup lang="ts">
import { computed } from "vue";

interface MirrorTableItem {
  name: string;
  symbol?: string;
  url: string;
  comment?: string;
}

interface Tag2Group {
  tag2: string;
  items: MirrorTableItem[];
}

interface Tag1Group {
  tag1: string;
  order: number;
  subgroups: Tag2Group[];
}

const props = defineProps<{ groups: Tag1Group[] }>();

function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "-");
}

function scrollToTag1(tag1: string): void {
  const id = `tag1-group-${slugifyTag(tag1)}`;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

const hasMultipleGroups = computed(() => props.groups && props.groups.length > 1);
</script>

<template>
  <div>
    <div class="tags-nav" v-if="hasMultipleGroups">
      <div class="tags-tabs">
        <button
          v-for="g in props.groups"
          :key="g.tag1"
          class="tag-group-tab"
          @click="scrollToTag1(g.tag1)"
        >
          {{ g.tag1 }}
        </button>
      </div>
    </div>

    <div
      v-for="g in props.groups"
      :key="g.tag1"
      :id="`tag1-group-${slugifyTag(g.tag1)}`"
      class="tag1-group-container"
    >
      <div class="tag1-group-header">
        <div class="tag1-group-title">
          <span class="tag1-badge">分类 {{ g.tag1 }}</span>
        </div>
      </div>

      <div v-for="sg in g.subgroups" :key="sg.tag2" class="tag2-section">
        <h3 class="tag2-title">{{ sg.tag2 }}</h3>
        <div class="links-grid">
          <a
            v-for="item in sg.items"
            :key="item.url"
            class="link-card"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="link-title">{{ item.name }}</div>
            <div class="link-desc">{{ item.comment || item.symbol || item.url }}</div>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div v-if="!props.groups || props.groups.length === 0" class="empty-state">
    <div class="empty-icon">📊</div>
    <h3>暂无镜像数据</h3>
    <p>未找到镜像列表。</p>
  </div>
</template>

<style lang="postcss" scoped>
@reference "tailwindcss";
.tags-nav {
  @apply mb-8 mt-6;
}

.tags-tabs {
  @apply flex flex-wrap gap-3 mb-6;
  @media (max-width: 768px) {
    @apply flex-wrap gap-2;
  }
  @media (max-width: 480px) {
    @apply flex-col;
  }
}

.tag-group-tab {
  @apply px-6 py-3 border-2 border-transparent rounded-[25px] font-bold text-[1.1rem] text-white cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 opacity-70 bg-white/10;
}

.tag-group-tab:hover {
  @apply opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.2)];
  transform: translateY(-2px);
}

.tag1-group-container {
  @apply mb-12 scroll-mt-[20px];
}

.tag1-group-header {
  @apply mb-6 pb-4 border-b-2 border-white/10;
}

.tag1-group-title {
  @apply flex items-center gap-4;
}

.tag1-badge {
  @apply px-6 py-2 rounded-[20px] font-bold text-[1.2rem] text-white bg-[rgba(100,181,246,0.3)] shadow-[0_2px_8px_rgba(0,0,0,0.2)];
}

.tag2-section {
  @apply mt-4;
}

.tag2-title {
  @apply text-white mt-2 mb-2 text-[1.1rem];
}

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
}

.link-card:hover {
  @apply bg-[rgba(255,255,255,0.06)];
  transform: translateY(-2px);
}

.link-title {
  @apply text-[1.2rem] font-bold mb-[0.5rem] text-[#64b5f6];
}

.link-desc {
  @apply text-[0.95rem] text-white/80;
}

.empty-state {
  @apply text-center p-12;
}

.empty-state h3 {
  @apply text-white mb-4;
}

.empty-state p {
  @apply text-white/70;
}

.empty-icon {
  @apply text-[4rem] mb-4;
}
</style>
