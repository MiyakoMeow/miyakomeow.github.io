<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUpdate,
  onBeforeUnmount,
  nextTick,
  watch,
  type ComponentPublicInstance,
} from "vue";

interface MirrorTableItem {
  name: string;
  symbol?: string;
  url: string;
  url_ori?: string;
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

function scrollToTag2(tag1: string, tag2: string): void {
  const id = `tag2-group-${slugifyTag(tag1)}-${slugifyTag(tag2)}`;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}


const tableWrapperRefs = ref<HTMLDivElement[]>([]);
function setTableWrapperRef(el: Element | ComponentPublicInstance | null): void {
  if (el && el instanceof HTMLDivElement) {
    tableWrapperRefs.value.push(el);
  }
}

let isSyncing = false;
let rafId: number | null = null;
function onWrapperScroll(e: Event): void {
  if (isSyncing) return;
  const target = e.target as HTMLDivElement;
  const left = target.scrollLeft;
  isSyncing = true;
  tableWrapperRefs.value.forEach((w) => {
    if (w !== target) {
      w.scrollLeft = left;
    }
  });
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
  rafId = requestAnimationFrame(() => {
    isSyncing = false;
  });
}

function attachScrollSync(): void {
  tableWrapperRefs.value.forEach((w) => {
    w.addEventListener("scroll", onWrapperScroll, { passive: true });
  });
}

function detachScrollSync(): void {
  tableWrapperRefs.value.forEach((w) => {
    w.removeEventListener("scroll", onWrapperScroll);
  });
}

onMounted(async () => {
  await nextTick();
  attachScrollSync();
});

onBeforeUpdate(() => {
  tableWrapperRefs.value = [];
});

onBeforeUnmount(() => {
  detachScrollSync();
});

watch(
  () => props.groups,
  async () => {
    await nextTick();
    detachScrollSync();
    attachScrollSync();
  },
  { deep: true }
);

const selectedMap = ref<Record<string, boolean>>({});
</script>

<template>
  <div class="grouped-tables-section" v-if="props.groups.length > 0">
    <div class="groups-nav">
      <div
        v-for="g in props.groups"
        :key="g.tag1"
        class="group-row"
      >
        <button class="tag1-button" @click="scrollToTag1(g.tag1)">
          {{ g.tag1 }}
        </button>
        <div class="group-row-tag2">
          <button
            v-for="sg in g.subgroups"
            :key="sg.tag2"
            class="tag2-group-tab"
            @click="scrollToTag2(g.tag1, sg.tag2)"
          >
            {{ sg.tag2 }}
            <span class="chart-count">({{ sg.items.length }})</span>
          </button>
        </div>
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

      <div
        v-for="sg in g.subgroups"
        :key="sg.tag2"
        :id="`tag2-group-${slugifyTag(g.tag1)}-${slugifyTag(sg.tag2)}`"
        class="tag2-section"
      >
        <h3 class="tag2-title">{{ sg.tag2 }}</h3>
        <div class="table-wrapper" :ref="setTableWrapperRef">
          <table class="tables-table">
            <colgroup>
              <col class="col-select" />
              <col class="col-symbol" />
              <col class="col-name" />
              <col class="col-mirror" />
              <col class="col-origin" />
            </colgroup>
            <thead>
              <tr>
                <th>选择</th>
                <th>符号</th>
                <th>名称</th>
                <th>镜像</th>
                <th>原链接</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in sg.items" :key="item.url">
                <td class="select-cell">
                  <input type="checkbox" class="select-checkbox" v-model="selectedMap[item.url]" />
                </td>
                <td>
                  {{ item.symbol || "" }}
                </td>
                <td class="name-cell">
                  <strong>{{ item.name }}</strong>
                </td>
                <td class="mirror-cell">
                  <a
                    class="link-button mirror-link"
                    :href="item.url"
                    :title="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    镜像
                  </a>
                </td>
                <td class="origin-cell">
                  <a
                    v-if="item.url_ori"
                    class="link-button origin-link"
                    :href="item.url_ori"
                    :title="item.url_ori"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    原链接
                  </a>
                  <span v-else class="link-missing">无</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-state">
    <div class="empty-icon">📊</div>
    <h3>暂无镜像数据</h3>
    <p>未找到镜像列表。</p>
  </div>
</template>

<style lang="postcss" scoped>
@reference "tailwindcss";
.grouped-tables-section {
  @apply mt-8;
}

.groups-nav { @apply mb-8 mt-6; }
.group-row { @apply mb-4; }
.tag1-button { @apply px-4 py-2 rounded-[18px] font-bold text-white cursor-pointer transition-all duration-300 ease-in-out opacity-80 bg-white/10 mr-3; }
.tag1-button:hover { @apply opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.2)]; transform: translateY(-2px); }
.group-row-tag2 { @apply flex flex-wrap gap-2 mt-2; }
.tag2-group-tab { @apply px-4 py-2 rounded-[18px] font-bold text-white cursor-pointer transition-all duration-300 ease-in-out opacity-80 bg-white/10; }
.tag2-group-tab:hover { @apply opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.2)]; transform: translateY(-2px); }

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
  @apply px-6 py-2 rounded-[20px] font-bold text-[1.2rem] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] bg-[rgba(100,181,246,0.3)];
}

.tag2-groups-nav {
  @apply mt-4;
}

.tag2-groups-tabs {
  @apply flex flex-wrap gap-3 mb-6;
}

.tag2-group-tab {
  @apply px-4 py-2 rounded-[18px] font-bold text-white cursor-pointer transition-all duration-300 ease-in-out opacity-80 bg-white/10;
}

.tag2-group-tab:hover {
  @apply opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.2)];
  transform: translateY(-2px);
}

.chart-count {
  @apply text-[0.9rem] opacity-90 bg-black/20 py-[0.1rem] px-2 rounded-[10px];
}

.tag2-section {
  @apply mt-4;
}

.tag2-title {
  @apply text-white mt-2 mb-2 text-[1.1rem];
}

.table-wrapper {
  @apply overflow-x-auto rounded-[10px] bg-black/20 border border-white/10;
}

.tables-table {
  @apply w-full border-collapse min-w-[800px] table-fixed;
}

.tables-table th {
  @apply bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10;
}

.tables-table td {
  @apply p-4 border-b border-white/5 text-white/90 break-words;
}

.tables-table col.col-select { width: 60px; }
.tables-table col.col-symbol { width: 120px; }
.tables-table col.col-name { width: 320px; }
.tables-table col.col-mirror { width: 160px; }
.tables-table col.col-origin { width: 160px; }

.name-cell { @apply min-w-[200px]; }
.mirror-cell, .origin-cell { @apply min-w-[130px]; }

.link-button {
  @apply px-[0.5rem] py-[0.35rem] border-none rounded-[6px] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-[0.2rem] min-w-[60px] no-underline text-inherit;
}

.link-button:hover { @apply shadow-[0_4px_8px_rgba(0,0,0,0.2)]; transform: translateY(-2px); }

.mirror-link { @apply bg-[linear-gradient(135deg,#2196f3,#1565c0)] text-white; }
.mirror-link:hover { @apply bg-[linear-gradient(135deg,#42a5f5,#1976d2)]; }

.origin-link { @apply bg-[linear-gradient(135deg,#ff9800,#f57c00)] text-white; }
.origin-link:hover { @apply bg-[linear-gradient(135deg,#ffb74d,#ff9800)]; }

.link-missing { @apply text-white/50; }

.empty-state { @apply text-center p-12; }
.empty-state h3 { @apply text-white mb-4; }
.empty-state p { @apply text-white/70; }
.empty-icon { @apply text-[4rem] mb-4; }
</style>
.select-checkbox { width: 22px; height: 22px; transform: scale(1.2); }
