<script setup lang="ts">
import { computed } from "vue";
import ScrollSyncGroup from "@/components/ScrollSyncGroup.vue";
export interface ChartData {
  title?: string;
  artist?: string;
  level?: string;
  sha256?: string;
  md5?: string;
  comment?: string;
  url?: string;
  url_diff?: string;
  [key: string]: unknown;
}

export interface DifficultyGroup {
  level: string;
  charts: ChartData[];
}

interface BmsLinks {
  bmsScoreViewer: string;
  lr2ir: string;
  mocha: string;
  minir: string;
}

const props = defineProps<{
  groups: DifficultyGroup[];
  totalCharts: number;
  levelOrder?: string[];
}>();

const displayGroups = computed<DifficultyGroup[]>(() => {
  const order = props.levelOrder ?? [];
  const orderIndex = new Map<string, number>();
  order.forEach((lv, idx) => orderIndex.set(String(lv), idx));
  const defined: DifficultyGroup[] = [];
  const others: DifficultyGroup[] = [];
  for (const g of props.groups) {
    (orderIndex.has(String(g.level)) ? defined : others).push(g);
  }
  defined.sort(
    (a, b) => (orderIndex.get(String(a.level)) ?? 0) - (orderIndex.get(String(b.level)) ?? 0)
  );
  others.sort((a, b) => {
    const as = String(a.level).trim();
    const bs = String(b.level).trim();
    const intRe = /^-?\d+$/;
    const ai = intRe.test(as);
    const bi = intRe.test(bs);
    if (ai && bi) return parseInt(as, 10) - parseInt(bs, 10);
    if (ai && !bi) return -1;
    if (!ai && bi) return 1;
    return as.localeCompare(bs);
  });
  return [...defined, ...others];
});

function segmentColor(index: number, total: number): string {
  const palette = ["#4caf50", "#2196f3", "#ff9800", "#f44336", "#ce50d8", "#9c27b0"];
  if (total <= 0) return palette[1];
  const bins = palette.length;
  const size = Math.ceil(total / bins);
  const ci = Math.min(bins - 1, Math.floor(index / size));
  return palette[ci];
}

function getBmsLinks(chart: ChartData): BmsLinks {
  const md5 = typeof chart.md5 === "string" ? chart.md5.trim() : "";
  const sha = typeof chart.sha256 === "string" ? chart.sha256.trim() : "";
  return {
    bmsScoreViewer: `https://bms-score-viewer.pages.dev/view?md5=${encodeURIComponent(md5)}`,
    lr2ir: `http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=${encodeURIComponent(md5)}`,
    mocha: `https://mocha-repository.info/song.php?sha256=${encodeURIComponent(sha)}`,
    minir: `https://www.gaftalk.com/minir/#/viewer/song/${encodeURIComponent(sha)}/0`,
  };
}

function hasMd5(chart: ChartData): boolean {
  const v = chart.md5;
  return typeof v === "string" && v.trim().length > 0;
}

function hasSha256(chart: ChartData): boolean {
  const v = chart.sha256;
  return typeof v === "string" && v.trim().length > 0;
}

function expandToValidLink(raw: string | undefined): string | undefined {
  const s = (raw ?? "").trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/\//.test(s)) return `https:${s}`;
  if (/^\//.test(s)) return s;
  if (/^[\w.-]+\.[A-Za-z]{2,}(?:\/.*)?$/.test(s)) return `https://${s}`;
  return undefined;
}

function resolvedBundleUrl(chart: ChartData): string | undefined {
  return expandToValidLink(chart.url);
}

function resolvedDiffUrl(chart: ChartData): string | undefined {
  return expandToValidLink(chart.url_diff);
}

function scrollToDifficultyGroup(level: string): void {
  const element = document.getElementById(`difficulty-group-${level}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
</script>

<template>
  <div class="charts-table-section" v-if="props.groups.length > 0">
    <h3>谱面列表 ({{ props.totalCharts }} 个)</h3>

    <ScrollSyncGroup :watch-keys="props.groups" v-slot="{ setRef }">
      <div class="difficulty-groups-nav" v-if="props.groups.length > 1">
        <div class="difficulty-groups-tabs">
          <button
            v-for="(group, idx) in displayGroups"
            :key="group.level"
            class="difficulty-group-tab"
            @click="scrollToDifficultyGroup(group.level)"
            :style="{
              backgroundColor: segmentColor(idx, displayGroups.length),
              borderColor: segmentColor(idx, displayGroups.length),
            }"
          >
            {{ group.level }}
            <span class="chart-count">({{ group.charts.length }})</span>
          </button>
        </div>
      </div>

      <div
        v-for="(group, gIndex) in displayGroups"
        :key="group.level"
        :id="`difficulty-group-${group.level}`"
        class="difficulty-group-container"
      >
        <div class="difficulty-group-header">
          <div class="difficulty-group-title">
            <span
              class="difficulty-group-badge"
              :style="{
                backgroundColor: segmentColor(gIndex, displayGroups.length),
              }"
            >
              难度 {{ group.level }}
            </span>
            <span class="difficulty-group-count"> {{ group.charts.length }} 个谱面 </span>
          </div>
        </div>

        <div class="table-wrapper" :ref="setRef">
          <table class="charts-table">
            <colgroup>
              <col class="col-level" />
              <col class="col-download" />
              <col class="col-bmslinks" />
              <col class="col-title" />
              <col class="col-artist" />
              <col class="col-comment" />
            </colgroup>
            <thead>
              <tr>
                <th>等级</th>
                <th>下载</th>
                <th>BMS网站</th>
                <th>标题</th>
                <th>艺术家</th>
                <th class="comment-header">备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(chart, index) in group.charts" :key="index">
                <td>
                  <span
                    class="level-badge"
                    :style="{
                      backgroundColor: segmentColor(gIndex, displayGroups.length),
                    }"
                  >
                    {{ group.level }}
                  </span>
                </td>
                <td class="download-cell">
                  <div class="download-buttons">
                    <a
                      v-if="resolvedBundleUrl(chart)"
                      class="download-button download-bundle"
                      :href="resolvedBundleUrl(chart)"
                      :title="resolvedBundleUrl(chart)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📦 同捆
                    </a>
                    <a
                      v-if="resolvedDiffUrl(chart)"
                      class="download-button download-diff"
                      :href="resolvedDiffUrl(chart)"
                      :title="resolvedDiffUrl(chart)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔄 差分
                    </a>
                  </div>
                </td>
                <td class="bms-links-cell">
                  <div class="bms-links">
                    <a
                      class="bms-link-button bms-score-viewer"
                      v-if="hasMd5(chart)"
                      :href="getBmsLinks(chart).bmsScoreViewer"
                      :title="getBmsLinks(chart).bmsScoreViewer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📊
                    </a>
                    <a
                      class="bms-link-button lr2ir"
                      v-if="hasMd5(chart)"
                      :href="getBmsLinks(chart).lr2ir"
                      :title="getBmsLinks(chart).lr2ir"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LR2
                    </a>
                    <a
                      class="bms-link-button mocha"
                      v-if="hasSha256(chart)"
                      :href="getBmsLinks(chart).mocha"
                      :title="getBmsLinks(chart).mocha"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src="/assets/logo/mocha_logo.gif" alt="Mocha" class="bms-icon" />
                    </a>
                    <a
                      class="bms-link-button minir"
                      v-if="hasSha256(chart)"
                      :href="getBmsLinks(chart).minir"
                      :title="getBmsLinks(chart).minir"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src="/assets/logo/minir_logo.gif" alt="Minir" class="bms-icon" />
                    </a>
                  </div>
                </td>
                <td class="chart-title">
                  <strong>{{ chart.title || "未知标题" }}</strong>
                </td>
                <td>
                  {{ chart.artist || "未知艺术家" }}
                </td>
                <td class="comment-cell">
                  {{ chart.comment || "" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ScrollSyncGroup>
  </div>
  <div v-else class="empty-state">
    <div class="empty-icon">📊</div>
    <h3>暂无谱面数据</h3>
    <p>难度表中没有找到谱面数据。</p>
  </div>
</template>

<style lang="postcss" scoped>
@reference "tailwindcss";
.charts-table-section {
  @apply mt-8;
}

.charts-table-section {
  h3 {
    @apply text-white mb-4;
  }
}

.table-wrapper {
  @apply overflow-x-auto rounded-[10px] bg-black/20 border border-white/10;
}

.charts-table {
  @apply w-full border-collapse min-w-[900px] table-fixed;
  @media (max-width: 480px) {
    @apply min-w-[800px];
    td:nth-child(6) {
      @apply max-w-[120px] text-[0.8em];
    }
    th,
    td {
      @apply p-3;
    }
  }
}

.charts-table {
  th {
    @apply bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10;
  }
  td {
    @apply p-4 border-b border-white/5 text-white/90 break-words;
  }
  col {
    &.col-level {
      width: 50px;
    }
    &.col-download {
      width: 140px;
    }
    &.col-bmslinks {
      width: 140px;
    }
    &.col-title {
      width: 260px;
    }
    &.col-artist {
      width: 200px;
    }
    &.col-comment {
      width: 260px;
    }
  }
  tbody tr {
    &:hover {
      @apply bg-white/5;
    }
  }
  @media (max-width: 480px) {
    @apply min-w-[600px];
    th,
    td {
      @apply p-2;
    }
  }
}

.chart-title {
  @apply min-w-[200px];
  @media (max-width: 480px) {
    @apply min-w-[150px];
  }
  @media (max-width: 480px) {
    @apply min-w-[120px];
  }
}

.comment-cell {
  @apply min-w-[150px] max-w-[300px];
  @media (max-width: 480px) {
    @apply min-w-[100px] max-w-[200px];
  }
  @media (max-width: 480px) {
    @apply min-w-[80px] max-w-[150px] text-[0.85rem];
  }
}

.level-badge {
  @apply inline-block px-2 py-1 rounded-[12px] text-white font-semibold text-[0.85rem] min-w-[30px] text-center;
}

.download-cell {
  @apply min-w-[130px] max-w-[180px];
  @media (max-width: 480px) {
    @apply min-w-[110px] max-w-[150px];
  }
  @media (max-width: 480px) {
    @apply min-w-[90px] max-w-[120px];
  }
}

.download-buttons {
  @apply flex flex-row gap-[0.3rem] flex-wrap;
  @media (max-width: 480px) {
    @apply gap-[0.3rem];
  }
}

.download-button {
  @apply px-[0.5rem] py-[0.35rem] border-none rounded-[6px] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-[0.2rem] min-w-[60px] flex-1 no-underline text-inherit;
  @media (max-width: 480px) {
    @apply px-[0.4rem] py-[0.25rem] text-[0.75rem] min-w-[55px];
  }
  @media (max-width: 480px) {
    @apply px-[0.3rem] py-[0.2rem] text-[0.7rem] min-w-[50px];
  }
}

.download-button {
  &:hover {
    @apply shadow-[0_4px_8px_rgba(0,0,0,0.2)];
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
}

.download-bundle {
  @apply bg-[linear-gradient(135deg,#4caf50,#2e7d32)] text-white;
}

.download-bundle {
  &:hover {
    @apply bg-[linear-gradient(135deg,#66bb6a,#388e3c)];
  }
}

.download-diff {
  @apply bg-[linear-gradient(135deg,#2196f3,#1565c0)] text-white;
}

.download-diff {
  &:hover {
    @apply bg-[linear-gradient(135deg,#42a5f5,#1976d2)];
  }
}

.bms-links-cell {
  @apply min-w-[140px] max-w-[180px];
  @media (max-width: 480px) {
    @apply min-w-[120px] max-w-[140px];
  }
  @media (max-width: 480px) {
    @apply min-w-[100px] max-w-[120px];
  }
}

.bms-links {
  @apply flex flex-wrap gap-[0.4rem] justify-center;
  @media (max-width: 480px) {
    @apply gap-[0.3rem];
  }
}

.bms-link-button {
  @apply w-[36px] h-[36px] border-none rounded-full text-[1.2rem] cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center p-0 overflow-hidden no-underline text-inherit;
  @media (max-width: 480px) {
    @apply w-[32px] h-[32px] text-[1rem];
  }
  @media (max-width: 480px) {
    @apply w-[28px] h-[28px] text-[0.9rem];
  }
}

.bms-link-button {
  &:hover {
    @apply shadow-[0_4px_8px_rgba(0,0,0,0.3)];
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }
}

.bms-icon {
  @apply w-6 h-6 object-contain;
}

.bms-score-viewer {
  @apply bg-[linear-gradient(135deg,#ff9800,#f57c00)] text-white;
}

.bms-score-viewer {
  &:hover {
    @apply bg-[linear-gradient(135deg,#ffb74d,#ff9800)];
  }
}

.lr2ir {
  @apply bg-[linear-gradient(135deg,#9c27b0,#7b1fa2)] text-white;
}

.lr2ir {
  &:hover {
    @apply bg-[linear-gradient(135deg,#ba68c8,#9c27b0)];
  }
}

.mocha {
  @apply bg-[linear-gradient(135deg,#795548,#5d4037)] text-white;
}

.mocha {
  &:hover {
    @apply bg-[linear-gradient(135deg,#a1887f,#795548)];
  }
}

.minir {
  @apply bg-[linear-gradient(135deg,#00bcd4,#0097a7)] text-white;
}

.minir {
  &:hover {
    @apply bg-[linear-gradient(135deg,#4dd0e1,#00bcd4)];
  }
}

.difficulty-groups-nav {
  @apply mb-8;
}

.difficulty-groups-tabs {
  @apply flex flex-wrap gap-3 mb-6;
  @media (max-width: 768px) {
    @apply flex-wrap gap-2;
  }
  @media (max-width: 480px) {
    @apply flex-col;
  }
}

.difficulty-group-tab {
  @apply px-6 py-3 border-2 border-transparent rounded-[25px] font-bold text-[1.1rem] text-white cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 opacity-70;
  @media (max-width: 768px) {
    @apply flex-[1_0_calc(33.333%_-_0.5rem)] min-w-[80px] px-4 py-[0.6rem] text-[1rem];
  }
  @media (max-width: 480px) {
    @apply w-full text-center;
  }
}

.difficulty-group-tab {
  &:hover {
    @apply opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.2)];
    transform: translateY(-2px);
  }
  &:active {
    @apply opacity-90;
    transform: translateY(-1px);
  }
}

.chart-count {
  @apply text-[0.9rem] opacity-90 bg-black/20 py-[0.1rem] px-2 rounded-[10px];
}

.difficulty-group-container {
  @apply mb-12 scroll-mt-[20px];
}

.difficulty-group-header {
  @apply mb-6 pb-4 border-b-2 border-white/10;
}

.difficulty-group-title {
  @apply flex items-center gap-4;
  @media (max-width: 480px) {
    @apply flex-col items-start gap-2;
  }
}

.difficulty-group-badge {
  @apply px-6 py-2 rounded-[20px] font-bold text-[1.2rem] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)];
  @media (max-width: 480px) {
    @apply text-[1rem] px-[0.8rem] py-[0.3rem];
  }
}

.difficulty-group-count {
  @apply text-[1.1rem] text-white/80;
  @media (max-width: 480px) {
    @apply text-[1rem];
  }
}

.empty-state {
  @apply text-center p-12;
}

.empty-state {
  h3 {
    @apply text-white mb-4;
  }
  p {
    @apply text-white/70;
  }
}

.empty-icon {
  @apply text-[4rem] mb-4;
}
</style>
