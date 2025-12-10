<script setup lang="ts">
import { computed } from "vue";
import ScrollSyncGroup from "@/components/ScrollSyncGroup.vue";
import "./ChartsTableSection.pcss";
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
