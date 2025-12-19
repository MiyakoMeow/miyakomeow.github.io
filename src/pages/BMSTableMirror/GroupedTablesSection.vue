<script setup lang="ts">
import { ref } from "vue";
import ScrollSyncGroup from "@/components/ScrollSyncGroup.vue";

export interface MirrorTableItem {
  name: string;
  symbol?: string;
  url: string;
  url_ori?: string;
  comment?: string;
  tag1?: string;
  tag2?: string;
  tag_order?: string | number;
  dir_name?: string;
}

export interface Tag2Group {
  tag2: string;
  items: MirrorTableItem[];
}

export interface Tag1Group {
  tag1: string;
  order: number;
  subgroups: Tag2Group[];
}

enum CheckboxState {
  Unchecked,
  Indeterminate,
  Checked,
}

const props = defineProps<{
  groups: Tag1Group[];
  selectedMap?: Record<string, boolean>;
}>();

const selectedMap = ref<Record<string, boolean>>(props.selectedMap || {});

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

const emit = defineEmits<{
  (e: "update:selectedMap", value: Record<string, boolean>): void;
}>();

function emitSelected(): void {
  emit("update:selectedMap", selectedMap.value);
}

function getTag1Urls(g: Tag1Group): string[] {
  const urls: string[] = [];
  for (const sg of g.subgroups) {
    for (const item of sg.items) {
      urls.push(item.url);
    }
  }
  return urls;
}

function getTag2Urls(sg: Tag2Group): string[] {
  return sg.items.map((item) => item.url);
}

function aggregateCheckboxState(urls: string[]): CheckboxState {
  if (urls.length === 0) return CheckboxState.Unchecked;
  let selected = 0;
  for (const u of urls) if (selectedMap.value[u]) selected++;
  if (selected === 0) return CheckboxState.Unchecked;
  if (selected === urls.length) return CheckboxState.Checked;
  return CheckboxState.Indeterminate;
}

function tag1State(g: Tag1Group): CheckboxState {
  return aggregateCheckboxState(getTag1Urls(g));
}

function tag2State(sg: Tag2Group): CheckboxState {
  return aggregateCheckboxState(getTag2Urls(sg));
}

function onTag1Change(checked: boolean, g: Tag1Group): void {
  for (const url of getTag1Urls(g)) {
    selectedMap.value[url] = checked;
  }
  emitSelected();
}

function onTag2Change(checked: boolean, sg: Tag2Group): void {
  for (const url of getTag2Urls(sg)) {
    selectedMap.value[url] = checked;
  }
  emitSelected();
}

function onRowChange(checked: boolean, url: string): void {
  selectedMap.value[url] = checked;
  emitSelected();
}

// Custom directive: v-indeterminate
const vIndeterminate = {
  mounted(el: Element, binding: { value: boolean }): void {
    if (el instanceof HTMLInputElement) {
      el.indeterminate = !!binding.value;
    }
  },
  updated(el: Element, binding: { value: boolean }): void {
    if (el instanceof HTMLInputElement) {
      el.indeterminate = !!binding.value;
    }
  },
};
</script>

<template>
  <div v-if="groups.length === 0" class="empty-state">
    <div class="empty-icon">📊</div>
    <h3>暂无镜像数据</h3>
    <p>未找到镜像列表。</p>
  </div>

  <div v-else class="grouped-tables-section">
    <ScrollSyncGroup :watch-keys="groups">
      <template #default="{ setRef }">
        <div class="groups-nav">
          <div v-for="g in groups" :key="g.tag1" class="group-row">
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
          v-for="g in groups"
          :key="g.tag1"
          :id="`tag1-group-${slugifyTag(g.tag1)}`"
          class="tag1-group-container"
        >
          <div class="tag1-group-header">
            <div class="tag1-group-title">
              <input
                type="checkbox"
                class="select-checkbox"
                v-indeterminate="tag1State(g) === CheckboxState.Indeterminate"
                :checked="tag1State(g) === CheckboxState.Checked"
                @change="(e) => onTag1Change((e.target as HTMLInputElement).checked, g)"
              />
              <span class="tag1-badge">分类 {{ g.tag1 }}</span>
            </div>
          </div>

          <div
            v-for="sg in g.subgroups"
            :key="sg.tag2"
            :id="`tag2-group-${slugifyTag(g.tag1)}-${slugifyTag(sg.tag2)}`"
            class="tag2-section"
          >
            <h3 class="tag2-title">
              <input
                type="checkbox"
                class="select-checkbox"
                v-indeterminate="tag2State(sg) === CheckboxState.Indeterminate"
                :checked="tag2State(sg) === CheckboxState.Checked"
                @change="(e) => onTag2Change((e.target as HTMLInputElement).checked, sg)"
              />
              {{ sg.tag2 }}
            </h3>
            <div class="table-wrapper" :ref="setRef">
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
                      <input
                        type="checkbox"
                        class="select-checkbox"
                        :checked="!!selectedMap[item.url]"
                        @change="
                          (e) => onRowChange((e.target as HTMLInputElement).checked, item.url)
                        "
                      />
                    </td>
                    <td>{{ item.symbol || "" }}</td>
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
      </template>
    </ScrollSyncGroup>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.grouped-tables-section {
  @apply mt-8;
}

.groups-nav {
  @apply mb-8 mt-6;
}
.group-row {
  @apply mb-4;
}
.tag1-button {
  @apply px-4 py-2 rounded-[18px] font-bold text-white cursor-pointer transition-all duration-300 ease-in-out opacity-80 bg-white/10 mr-3;
  &:hover {
    @apply opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.2)];
    transform: translateY(-2px);
  }
}
.group-row-tag2 {
  @apply flex flex-wrap gap-2 mt-2;
}
.tag2-group-tab {
  @apply px-4 py-2 rounded-[18px] font-bold text-white cursor-pointer transition-all duration-300 ease-in-out opacity-80 bg-white/10;
  &:hover {
    @apply opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.2)];
    transform: translateY(-2px);
  }
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
  @apply px-6 py-2 rounded-[20px] font-bold text-[1.2rem] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] bg-[rgba(100,181,246,0.3)];
}

.tag2-groups-nav {
  @apply mt-4;
}

.tag2-groups-tabs {
  @apply flex flex-wrap gap-3 mb-6;
}

.chart-count {
  @apply text-[0.9rem] opacity-90 bg-black/20 py-[0.1rem] px-2 rounded-[10px];
}

.tag2-section {
  @apply mt-4;
}

.tag2-title {
  @apply text-white mt-2 mb-2 text-[1.1rem] flex items-center gap-2;
}

.table-wrapper {
  @apply overflow-x-auto rounded-[10px] bg-black/20 border border-white/10;
}

.tables-table {
  @apply w-full border-collapse min-w-[800px] table-fixed;
  th {
    @apply bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10;
  }
  td {
    @apply p-4 border-b border-white/5 text-white/90 break-words;
  }
  col {
    &.col-select {
      width: 60px;
    }
    &.col-symbol {
      width: 120px;
    }
    &.col-name {
      width: 320px;
    }
    &.col-mirror {
      width: 160px;
    }
    &.col-origin {
      width: 160px;
    }
  }
  tbody tr {
    &:hover {
      @apply bg-white/5;
    }
    &:last-child td {
      @apply border-b-0;
    }
  }
}

.name-cell {
  @apply min-w-[200px];
}
.mirror-cell,
.origin-cell {
  @apply min-w-[130px];
}

.link-button {
  @apply px-[0.5rem] py-[0.35rem] border-none rounded-[6px] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-[0.2rem] min-w-[60px] no-underline text-inherit;
  &:hover {
    @apply shadow-[0_4px_8px_rgba(0,0,0,0.2)];
    transform: translateY(-2px);
  }
}

.mirror-link {
  @apply bg-[linear-gradient(135deg,#2196f3,#1565c0)] text-white;
  &:hover {
    @apply bg-[linear-gradient(135deg,#42a5f5,#1976d2)];
  }
}

.origin-link {
  @apply bg-[linear-gradient(135deg,#ff9800,#f57c00)] text-white;
  &:hover {
    @apply bg-[linear-gradient(135deg,#ffb74d,#ff9800)];
  }
}

.link-missing {
  @apply text-white/50;
}

.empty-state {
  @apply text-center p-12;
  h3 {
    @apply text-white mb-4;
  }
  p {
    @apply text-white/70;
  }
  .empty-icon {
    @apply text-[4rem] mb-4;
  }
}

.select-cell {
  .select-checkbox {
    width: 22px;
    height: 22px;
    transform: scale(1.2);
  }
}

.select-checkbox {
  width: 22px;
  height: 22px;
  transform: scale(1.2);
}
</style>
