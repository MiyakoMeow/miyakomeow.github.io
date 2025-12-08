<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import StarryBackground from "../components/StarryBackground.vue";
import "../styles/main.pcss";

interface ChartData {
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

interface HeaderData {
  name?: string;
  symbol?: string;
  data_url?: string;
  [key: string]: unknown;
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
}

interface DifficultyGroup {
  level: string;
  formattedLevel: string;
  color: string;
  charts: ChartData[];
}

interface TableStats {
  totalCharts: number;
  difficulties: string[];
  averageLevel: string | number;
}

interface ChartDisplayInfo {
  title: string;
  artist: string;
  level: string;
  sha256: string | undefined;
  md5: string | undefined;
  comment: string;
  url: string;
  url_diff: string;
}

interface BmsLinks {
  bmsScoreViewer: string;
  lr2ir: string;
  mocha: string;
  minir: string;
}

// 从URL路径获取难度表类型
function getTableTypeFromPath(): "sp" | "dp" {
  const path = window.location.pathname;
  if (path.includes("self-table-dp")) {
    return "dp";
  }
  return "sp"; // 默认为sp
}

const tableType = ref<"sp" | "dp">(getTableTypeFromPath());
const title = computed(() => {
  if (headerData.value && headerData.value.name) {
    return headerData.value.name;
  }
  return "加载中...";
});

// 加载状态管理
const loadingState = reactive<LoadingState>({
  isLoading: true,
  progress: 0,
  currentStep: "正在初始化...",
  totalSteps: 4,
});

const tableData = ref<ChartData[] | null>(null);
const headerData = ref<HeaderData | null>(null);
const error = ref<string | null>(null);

// 模拟进度更新
function updateProgress(step: string, progress: number): void {
  loadingState.currentStep = step;
  loadingState.progress = progress;
}

// 懒加载JSON数据
async function lazyLoadTableData(): Promise<void> {
  try {
    updateProgress("正在加载表头信息...", 25);

    // 加载header.json
    const headerResponse = await fetch(`/bms/self-table-${tableType.value}/header.json`);
    if (!headerResponse.ok) {
      throw new Error(`无法加载表头信息: ${headerResponse.status}`);
    }
    headerData.value = await headerResponse.json();

    updateProgress("表头信息加载完成", 50);

    // 从header.json中获取data_url
    const dataUrl = headerData.value?.data_url;
    if (!dataUrl) {
      throw new Error("表头信息中未找到data_url");
    }

    updateProgress("正在加载谱面数据...", 75);

    // 加载data.json
    const dataResponse = await fetch(`/bms/self-table-${tableType.value}/${dataUrl}`);
    if (!dataResponse.ok) {
      throw new Error(`无法加载谱面数据: ${dataResponse.status}`);
    }
    tableData.value = await dataResponse.json();

    updateProgress("数据加载完成", 100);

    // 延迟显示完成状态
    setTimeout(() => {
      loadingState.isLoading = false;
    }, 500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "未知错误";
    loadingState.isLoading = false;
    console.error("加载BMS难度表数据失败:", err);
  }
}

// 滚动到指定难度组
function scrollToDifficultyGroup(level: string): void {
  const element = document.getElementById(`difficulty-group-${level}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// 计算难度表统计数据
const tableStats = computed<TableStats>(() => {
  if (!tableData.value || !Array.isArray(tableData.value)) {
    return {
      totalCharts: 0,
      difficulties: [],
      averageLevel: 0,
    };
  }

  const charts = tableData.value;
  const difficulties = new Set<string>();
  let totalLevel = 0;
  let validLevelCount = 0;

  charts.forEach((chart) => {
    if (chart.level) {
      difficulties.add(chart.level);
      // 尝试解析等级为数字
      const levelNum = parseFloat(chart.level);
      if (!isNaN(levelNum)) {
        totalLevel += levelNum;
        validLevelCount++;
      }
    }
  });

  return {
    totalCharts: charts.length,
    difficulties: Array.from(difficulties).sort(sortDifficultyLevels),
    averageLevel: validLevelCount > 0 ? (totalLevel / validLevelCount).toFixed(2) : "N/A",
  };
});

// 按难度分组谱面数据
const groupedCharts = computed<Record<string, DifficultyGroup>>(() => {
  if (!tableData.value || !Array.isArray(tableData.value)) {
    return {};
  }

  const groups: Record<string, DifficultyGroup> = {};
  const charts = tableData.value;

  charts.forEach((chart) => {
    const level = chart.level || "unknown";
    if (!groups[level]) {
      groups[level] = {
        level: level,
        formattedLevel: formatLevel(level),
        color: getDifficultyColor(level),
        charts: [],
      };
    }
    groups[level].charts.push(chart);
  });

  // 按难度排序：数字部分按整数大小排序，非数字部分按字符编码排序
  // 首先获取所有难度等级
  const levels = Object.keys(groups);

  // 对难度等级进行排序
  // 按难度排序：数字部分按整数大小排序，非数字部分按字符编码排序
  const sortedKeys = levels.sort(sortDifficultyLevels);

  // 使用Map保持插入顺序，然后转换为数组
  const sortedGroupsMap = new Map<string, DifficultyGroup>();
  sortedKeys.forEach((key) => {
    sortedGroupsMap.set(key, groups[key]);
  });

  // 将Map转换为对象（Vue模板需要普通对象）
  const sortedGroups: Record<string, DifficultyGroup> = {};
  sortedGroupsMap.forEach((value, key) => {
    sortedGroups[key] = value;
  });

  return sortedGroups;
});

// 获取排序后的难度组列表
const sortedDifficultyGroups = computed<DifficultyGroup[]>(() => {
  // 确保按排序后的键顺序获取值
  const groups = groupedCharts.value;
  const sortedKeys = Object.keys(groups).sort(sortDifficultyLevels);
  return sortedKeys.map((key) => groups[key]);
});

// 难度等级排序函数
function sortDifficultyLevels(a: string, b: string): number {
  // 使用正则表达式检查是否为整数（包括负数）
  const intRegex = /^-?\d+$/;
  const aIsInt = intRegex.test(a.trim());
  const bIsInt = intRegex.test(b.trim());

  if (aIsInt && bIsInt) {
    // 都是整数，按数值大小排序
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    return numA - numB;
  }

  // 如果只有a是整数，a排在前面
  if (aIsInt && !bIsInt) {
    return -1;
  }

  // 如果只有b是整数，b排在后面
  if (!aIsInt && bIsInt) {
    return 1;
  }

  // 如果都不是整数，按字符编码排序
  return a.localeCompare(b);
}

// 格式化等级显示
function formatLevel(level: string): string {
  if (!level) return "N/A";
  const num = parseInt(level, 10);
  return isNaN(num) ? level : num.toString();
}

// 获取难度颜色
function getDifficultyColor(level: string): string {
  const num = parseInt(level, 10);
  if (isNaN(num)) return "#ddbb00"; // 黄色 - 其它

  // 按照新规则设置颜色
  if (num <= -5) return "#4caf50"; // 绿色 - -5及以下
  if (num <= -4) return "#4caf50"; // 绿色 - -4
  if (num <= -3) return "#5050fa"; // 浅蓝色 - -3
  if (num <= -2) return "#ff9800"; // 橙色 - -2
  if (num <= -1) return "#ff9800"; // 橙色 - -1
  if (num <= 0) return "#f44336"; // 红色 - 0
  if (num <= 12) return "#ce50d8"; // 浅紫色 - 1-12
  if (num <= 24) return "#9c27b0"; // 深紫色 - 13-24

  return "#ddbb00"; // 黄色 - 其它（25及以上）
}

// 获取谱面显示信息
function getChartDisplayInfo(chart: ChartData): ChartDisplayInfo {
  return {
    title: chart.title || "未知标题",
    // 如果没有artist字段，显示"未知艺术家"
    artist: chart.artist || "未知艺术家",
    level: chart.level || "N/A",
    // 其他可能存在的字段
    sha256: chart.sha256,
    md5: chart.md5,
    comment: chart.comment || "",
    url: chart.url || "",
    url_diff: chart.url_diff || "",
  };
}

// 生成BMS网站链接
function getBmsLinks(chart: ChartData): BmsLinks {
  const info = getChartDisplayInfo(chart);
  return {
    bmsScoreViewer: `https://bms-score-viewer.pages.dev/view?md5=${info.md5}`,
    lr2ir: `http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=${info.md5}`,
    mocha: `https://mocha-repository.info/song.php?sha256=${info.sha256}`,
    minir: `https://www.gaftalk.com/minir/#/viewer/song/${info.sha256}/0`,
  };
}

onMounted(() => {
  // 延迟开始加载，让用户看到初始状态
  setTimeout(() => {
    lazyLoadTableData();
  }, 300);
});
</script>

<template>
  <StarryBackground />
  <div class="bms-table-container">
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <div v-if="headerData && headerData.symbol" class="page-subtitle">
        难度表符号: {{ headerData.symbol }}
      </div>
    </div>
    <div class="bms-table-content">
      <!-- 加载状态 -->
      <div v-if="loadingState.isLoading" class="loading-section">
        <div class="progress-container">
          <div class="progress-header">
            <h3>正在加载BMS难度表数据...</h3>
            <div class="progress-percentage">{{ Math.round(loadingState.progress) }}%</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: loadingState.progress + '%' }"></div>
          </div>
          <div class="progress-steps">
            <div class="step-info">
              <span class="step-label">当前步骤:</span>
              <span class="step-text">{{ loadingState.currentStep }}</span>
            </div>
            <div class="step-info">
              <span class="step-label">总步骤数:</span>
              <span class="step-text">{{ loadingState.totalSteps }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-section">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p class="error-message">{{ error }}</p>
        <p>请检查网络连接或稍后重试。</p>
        <button class="retry-button" @click="lazyLoadTableData">重新加载</button>
      </div>

      <!-- 数据展示 -->
      <div v-else class="data-section">
        <!-- 表格信息 -->
        <div class="table-header">
          <div class="header-info">
            <h2>难度表信息</h2>
            <div class="header-details">
              <p v-if="headerData">
                <strong>难度表名称:</strong>
                {{ headerData.name || "未命名" }}
              </p>
              <p v-if="headerData">
                <strong>难度表符号:</strong>
                {{ headerData.symbol || "未定义" }}
              </p>
              <p v-if="headerData && headerData.level_order">
                <strong>难度顺序:</strong>
                {{ (headerData.level_order as string[])?.join(", ") || "N/A" }}
              </p>
            </div>
          </div>

          <div class="stats-summary">
            <h3>统计摘要</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">
                  {{ tableStats.totalCharts }}
                </div>
                <div class="stat-label">总谱面数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">
                  {{ tableStats.difficulties.length }}
                </div>
                <div class="stat-label">难度等级数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">
                  {{ tableStats.averageLevel }}
                </div>
                <div class="stat-label">平均难度</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 难度对照表 -->
        <div class="rank-reference-section">
          <h3>难度对照表</h3>
          <div class="rank-reference-tables">
            <!-- 左边：负数部分 -->
            <div class="rank-reference-left">
              <table>
                <thead>
                  <tr>
                    <th>难度等级</th>
                    <th>对应难度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>-5</td>
                    <td>☆1-☆2</td>
                  </tr>
                  <tr>
                    <td>-4</td>
                    <td>☆3-☆4</td>
                  </tr>
                  <tr>
                    <td>-3</td>
                    <td>☆5-☆6</td>
                  </tr>
                  <tr>
                    <td>-2</td>
                    <td>☆7-☆8</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 右边：0及以上部分 -->
            <div class="rank-reference-right">
              <table>
                <thead>
                  <tr>
                    <th>难度等级</th>
                    <th>对应难度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>-1</td>
                    <td>☆9-☆10</td>
                  </tr>
                  <tr>
                    <td>0</td>
                    <td>☆11-☆12（sl0）</td>
                  </tr>
                  <tr>
                    <td>1-12</td>
                    <td>sl1-12 + st0下</td>
                  </tr>
                  <tr>
                    <td>13-24</td>
                    <td>st0上 + st1-12</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 按难度分组的谱面表格 -->
        <div class="charts-table-section" v-if="sortedDifficultyGroups.length > 0">
          <h3>谱面列表 ({{ tableData?.length || 0 }} 个)</h3>

          <!-- 难度组导航 -->
          <div class="difficulty-groups-nav" v-if="sortedDifficultyGroups.length > 1">
            <div class="difficulty-groups-tabs">
              <button
                v-for="group in sortedDifficultyGroups"
                :key="group.level"
                class="difficulty-group-tab"
                @click="scrollToDifficultyGroup(group.level)"
                :style="{
                  backgroundColor: group.color,
                  borderColor: group.color,
                }"
              >
                {{ group.formattedLevel }}
                <span class="chart-count">({{ group.charts.length }})</span>
              </button>
            </div>
          </div>

          <!-- 谱面列表 - 一次性显示所有难度组 -->
          <div
            v-for="group in sortedDifficultyGroups"
            :key="group.level"
            :id="`difficulty-group-${group.level}`"
            class="difficulty-group-container"
          >
            <div class="difficulty-group-header">
              <div class="difficulty-group-title">
                <span
                  class="difficulty-group-badge"
                  :style="{
                    backgroundColor: group.color,
                  }"
                >
                  难度 {{ group.formattedLevel }}
                </span>
                <span class="difficulty-group-count"> {{ group.charts.length }} 个谱面 </span>
              </div>
            </div>

            <div class="table-wrapper">
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
                          backgroundColor: getDifficultyColor(chart.level || 'N/A'),
                        }"
                      >
                        {{ formatLevel(chart.level || "N/A") }}
                      </span>
                    </td>
                    <td class="download-cell">
                      <div class="download-buttons">
                        <a
                          v-if="getChartDisplayInfo(chart).url"
                          class="download-button download-bundle"
                          :href="getChartDisplayInfo(chart).url"
                          :title="getChartDisplayInfo(chart).url"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📦 同捆
                        </a>
                        <a
                          v-if="getChartDisplayInfo(chart).url_diff"
                          class="download-button download-diff"
                          :href="getChartDisplayInfo(chart).url_diff"
                          :title="getChartDisplayInfo(chart).url_diff"
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
                          :href="getBmsLinks(chart).bmsScoreViewer"
                          :title="getBmsLinks(chart).bmsScoreViewer"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📊
                        </a>
                        <a
                          class="bms-link-button lr2ir"
                          :href="getBmsLinks(chart).lr2ir"
                          :title="getBmsLinks(chart).lr2ir"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LR2
                        </a>
                        <a
                          class="bms-link-button mocha"
                          :href="getBmsLinks(chart).mocha"
                          :title="getBmsLinks(chart).mocha"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img src="/assets/logo/mocha_logo.gif" alt="Mocha" class="bms-icon" />
                        </a>
                        <a
                          class="bms-link-button minir"
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
                      <strong>{{ getChartDisplayInfo(chart).title }}</strong>
                    </td>
                    <td>
                      {{ getChartDisplayInfo(chart).artist }}
                    </td>
                    <td class="comment-cell">
                      {{ getChartDisplayInfo(chart).comment }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>暂无谱面数据</h3>
          <p>难度表中没有找到谱面数据。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@reference "tailwindcss";
.bms-table-container {
  @apply max-w-[1500px] my-8 mx-auto p-8 bg-white/5 backdrop-blur-[10px] rounded-[20px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)];
}

.page-header {
  @apply mb-8 text-center;
}

.page-title {
  @apply text-white text-[2.5rem] font-bold mb-2 bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] bg-clip-text text-transparent;
  -webkit-background-clip: text;
  -background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  @apply text-white/70 text-[1.2rem] italic;
}

.bms-table-content {
  @apply text-white/90 text-[1.1rem] leading-[1.6] w-full;
}

/* 加载状态样式 */
.loading-section {
  @apply p-8;
}

.progress-container {
  @apply bg-black/20 rounded-[15px] p-8 border border-white/10;
}

.progress-header {
  @apply flex justify-between items-center mb-6;
}

.progress-header h3 {
  @apply text-white m-0 text-[1.5rem];
}

.progress-percentage {
  @apply bg-[#64b5f6]/20 text-[#64b5f6] px-4 py-2 rounded-[20px] font-bold text-[1.2rem];
}

.progress-bar {
  @apply h-[12px] bg-white/10 rounded-[6px] overflow-hidden mb-6;
}

.progress-fill {
  @apply h-full bg-[linear-gradient(90deg,#4caf50,#64b5f6)] rounded-[6px];
  transition: width 0.3s ease;
}

.progress-steps {
  @apply grid grid-cols-2 gap-4;
}

.step-info {
  @apply flex flex-col gap-2;
}

.step-label {
  @apply text-white/60 text-[0.9rem];
}

.step-text {
  @apply text-white font-medium;
}

/* 错误状态样式 */
.error-section {
  @apply text-center p-12;
}

.error-icon {
  @apply text-[4rem] mb-4;
}

.error-section h3 {
  @apply text-[#ff6b6b] mb-4;
}

.error-message {
  @apply bg-[rgba(255,107,107,0.1)] p-4 rounded-[10px] my-6 border-l-[4px] border-[#ff6b6b];
}

.retry-button {
  @apply bg-[#64b5f6] text-white border-none px-8 py-3 rounded-[25px] text-[1rem] font-semibold cursor-pointer mt-4;
  transition: background 0.3s ease;
}

.retry-button:hover {
  @apply hover:bg-[#42a5f5];
}

/* 数据展示样式 */
.data-section {
  @apply py-4;
}

.table-header {
  @apply grid grid-cols-2 gap-8 mb-8 p-6 bg-black/20 rounded-[15px];
}

.header-info h2 {
  @apply text-white mt-0 mb-4;
}

.header-details p {
  @apply my-2 text-white/80;
}

.header-details strong {
  @apply text-[#64b5f6];
}

.stats-summary h3 {
  @apply text-white mt-0 mb-4;
}

.stats-grid {
  @apply grid grid-cols-3 gap-4;
}

.stat-card {
  @apply bg-white/5 rounded-[10px] p-4 text-center border border-white/10;
}

.stat-value {
  @apply text-[2rem] font-bold text-[#64b5f6] mb-2;
}

.stat-label {
  @apply text-white/70 text-[0.9rem];
}

/* 难度对照表样式 */
.rank-reference-section {
  @apply mt-8 mb-8 p-6 bg-black/20 rounded-[15px] border border-white/10;
}

.rank-reference-section h3 {
  @apply text-white mt-0 mb-6 text-[1.3rem] text-center;
}

.rank-reference-tables {
  @apply flex gap-8 justify-center;
}

.rank-reference-left,
.rank-reference-right {
  @apply flex-1 min-w-0;
}

.rank-reference-left table,
.rank-reference-right table {
  @apply w-full border-collapse bg-white/5 rounded-[10px] overflow-hidden;
}

.rank-reference-left th,
.rank-reference-right th {
  @apply bg-[rgba(100,181,246,0.3)] text-white px-4 py-3 text-left font-semibold border-b-2 border-white/10;
}

.rank-reference-left td,
.rank-reference-right td {
  @apply px-4 py-3 border-b border-white/5 text-white/90;
}

.rank-reference-left tbody tr:hover,
.rank-reference-right tbody tr:hover {
  @apply bg-white/5;
}

.rank-reference-left tbody tr:last-child td,
.rank-reference-right tbody tr:last-child td {
  @apply border-b-0;
}

/* 谱面列表样式 */
.charts-table-section {
  @apply mt-8;
}

.charts-table-section h3 {
  @apply text-white mb-4;
}

.table-wrapper {
  @apply overflow-x-auto rounded-[10px] bg-black/20 border border-white/10;
}

.charts-table {
  @apply w-full border-collapse min-w-[900px];
}

.charts-table th {
  @apply bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10;
}

.charts-table td {
  @apply p-4 border-b border-white/5 text-white/90 break-words;
}

.charts-table col.col-level {
  width: 50px;
}
.charts-table col.col-download {
  width: 140px;
}
.charts-table col.col-bmslinks {
  width: 140px;
}
.charts-table col.col-title {
  width: 260px;
}
.charts-table col.col-artist {
  width: 200px;
}
.charts-table col.col-comment {
  width: 260px;
}

.charts-table tbody tr:hover {
  @apply bg-white/5;
}

.chart-title {
  @apply min-w-[200px];
}

.comment-cell {
  @apply min-w-[150px] max-w-[300px];
}

.level-badge {
  @apply inline-block px-2 py-1 rounded-[12px] text-white font-semibold text-[0.85rem] min-w-[30px] text-center;
}

/* 下载按钮样式 */
.download-cell {
  @apply min-w-[130px] max-w-[180px];
}

.download-buttons {
  @apply flex flex-row gap-[0.3rem] flex-wrap;
}

.download-button {
  @apply px-[0.5rem] py-[0.35rem] border-none rounded-[6px] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-[0.2rem] min-w-[60px] flex-1 no-underline text-inherit;
}

.download-button:hover {
  @apply hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)];
  transform: translateY(-2px);
}

.download-button:active {
  transform: translateY(0);
}

.download-bundle {
  @apply bg-[linear-gradient(135deg,#4caf50,#2e7d32)] text-white;
}

.download-bundle:hover {
  @apply bg-[linear-gradient(135deg,#66bb6a,#388e3c)];
}

.download-diff {
  @apply bg-[linear-gradient(135deg,#2196f3,#1565c0)] text-white;
}

.download-diff:hover {
  @apply bg-[linear-gradient(135deg,#42a5f5,#1976d2)];
}

/* BMS网站链接样式 */
.bms-links-cell {
  @apply min-w-[140px] max-w-[180px];
}

.bms-links {
  @apply flex flex-wrap gap-[0.4rem] justify-center;
}

.bms-link-button {
  @apply w-[36px] h-[36px] border-none rounded-full text-[1.2rem] cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center p-0 overflow-hidden no-underline text-inherit;
}

.bms-icon {
  @apply w-6 h-6 object-contain;
}

.bms-link-button:hover {
  @apply hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)];
  transform: scale(1.1);
}

.bms-link-button:active {
  transform: scale(0.95);
}

.bms-score-viewer {
  @apply bg-[linear-gradient(135deg,#ff9800,#f57c00)] text-white;
}

.bms-score-viewer:hover {
  @apply bg-[linear-gradient(135deg,#ffb74d,#ff9800)];
}

.lr2ir {
  @apply bg-[linear-gradient(135deg,#9c27b0,#7b1fa2)] text-white;
}

.lr2ir:hover {
  @apply bg-[linear-gradient(135deg,#ba68c8,#9c27b0)];
}

.mocha {
  @apply bg-[linear-gradient(135deg,#795548,#5d4037)] text-white;
}

.mocha:hover {
  @apply bg-[linear-gradient(135deg,#a1887f,#795548)];
}

.minir {
  @apply bg-[linear-gradient(135deg,#00bcd4,#0097a7)] text-white;
}

.minir:hover {
  @apply bg-[linear-gradient(135deg,#4dd0e1,#00bcd4)];
}

/* 空状态样式 */
.empty-state {
  @apply text-center p-12;
}

.empty-icon {
  @apply text-[4rem] mb-4;
}

.empty-state h3 {
  @apply text-white mb-4;
}

.empty-state p {
  @apply text-white/70;
}

/* 难度分组导航样式 */
.difficulty-groups-nav {
  @apply mb-8;
}

.difficulty-groups-tabs {
  @apply flex flex-wrap gap-3 mb-6;
}

.difficulty-group-tab {
  @apply px-6 py-3 border-2 border-transparent rounded-[25px] font-bold text-[1.1rem] text-white cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 opacity-70;
}

.difficulty-group-tab:hover {
  @apply opacity-90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)];
  transform: translateY(-2px);
}

.difficulty-group-tab:active {
  @apply opacity-90;
  transform: translateY(-1px);
}

.chart-count {
  @apply text-[0.9rem] opacity-90 bg-black/20 py-[0.1rem] px-2 rounded-[10px];
}

/* 难度组容器样式 */
.difficulty-group-container {
  @apply mb-12 scroll-mt-[20px];
}

/* 难度组标题样式 */
.difficulty-group-header {
  @apply mb-6 pb-4 border-b-2 border-white/10;
}

.difficulty-group-title {
  @apply flex items-center gap-4;
}

.difficulty-group-badge {
  @apply px-6 py-2 rounded-[20px] font-bold text-[1.2rem] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)];
}

.difficulty-group-count {
  @apply text-[1.1rem] text-white/80;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bms-table-container {
    @apply p-4 m-4 max-w-[calc(100%_-_2rem)];
  }

  .rank-reference-section {
    @apply p-4 mt-6 mb-6;
  }

  .rank-reference-tables {
    @apply gap-4;
  }

  .rank-reference-left th,
  .rank-reference-left td,
  .rank-reference-right th,
  .rank-reference-right td {
    @apply px-3 py-2 text-[0.9rem];
  }
  .page-header {
    @apply mb-6;
  }
  .page-title {
    @apply text-[2rem] mb-2;
  }
  .page-subtitle {
    @apply text-[1.1rem];
  }
  .table-header {
    @apply flex flex-col gap-6;
  }
  .stats-grid {
    @apply grid-cols-2;
  }
  .difficulty-groups-tabs {
    @apply flex-wrap gap-2;
  }
  .difficulty-group-tab {
    @apply flex-[1_0_calc(33.333%_-_0.5rem)] min-w-[80px] px-4 py-[0.6rem] text-[1rem];
  }
}

@media (max-width: 480px) {
  .bms-table-container {
    @apply p-4 my-4 mx-auto;
  }

  .charts-table td:nth-child(6) {
    @apply max-w-[120px] text-[0.8em];
  }

  .bms-table-container h1 {
    @apply text-[2rem];
  }

  .progress-steps {
    @apply grid-cols-1;
  }

  .stats-grid {
    @apply grid-cols-3 gap-3;
  }

  .stat-value {
    @apply text-[1.5rem];
  }

  .charts-table th,
  .charts-table td {
    @apply p-3;
  }

  .charts-table {
    @apply min-w-[800px];
  }

  .chart-title {
    @apply min-w-[150px];
  }

  .comment-cell {
    @apply min-w-[100px] max-w-[200px];
  }

  .download-cell {
    @apply min-w-[110px] max-w-[150px];
  }

  .download-button {
    @apply px-[0.4rem] py-[0.25rem] text-[0.75rem] min-w-[55px] flex-1;
  }

  .bms-links-cell {
    @apply min-w-[120px] max-w-[140px];
  }

  .bms-link-button {
    @apply w-[32px] h-[32px] text-[1rem];
  }
}

@media (max-width: 480px) {
  .bms-table-container {
    @apply p-4 m-4 max-w-[calc(100%_-_2rem)] rounded-[15px] overflow-x-auto;
  }

  .rank-reference-section {
    @apply p-3 mt-4 mb-4;
  }

  .rank-reference-tables {
    @apply flex-col gap-4;
  }

  .rank-reference-left th,
  .rank-reference-left td,
  .rank-reference-right th,
  .rank-reference-right td {
    @apply px-2 py-[0.4rem] text-[0.85rem];
  }
  .page-header {
    @apply mb-4;
  }
  .page-title {
    @apply text-[1.75rem] mb-2;
  }
  .page-subtitle {
    @apply text-[1rem];
  }
  .stats-grid {
    @apply grid-cols-1;
  }
  .progress-header {
    @apply flex-col items-start gap-2;
  }
  .progress-percentage {
    @apply self-start;
  }
  .difficulty-groups-tabs {
    @apply flex-col;
  }
  .difficulty-group-tab {
    @apply w-full text-center;
  }
  .difficulty-group-badge {
    @apply text-[1rem] px-[0.8rem] py-[0.3rem];
  }
  .difficulty-group-title {
    @apply flex-col items-start gap-2;
  }
  .difficulty-group-count {
    @apply text-[1rem];
  }

  .charts-table {
    @apply min-w-[600px];
  }

  .chart-title {
    @apply min-w-[120px];
  }

  .comment-cell {
    @apply min-w-[80px] max-w-[150px] text-[0.85rem];
  }

  .download-cell {
    @apply min-w-[90px] max-w-[120px];
  }

  .download-button {
    @apply px-[0.3rem] py-[0.2rem] text-[0.7rem] min-w-[50px] flex-1;
  }

  .download-buttons {
    @apply gap-[0.3rem];
  }

  .bms-links-cell {
    @apply min-w-[100px] max-w-[120px];
  }

  .bms-link-button {
    @apply w-[28px] h-[28px] text-[0.9rem];
  }

  .bms-links {
    @apply gap-[0.3rem];
  }

  .charts-table th,
  .charts-table td {
    @apply p-2;
  }
}
</style>
