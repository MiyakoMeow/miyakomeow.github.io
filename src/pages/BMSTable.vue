<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import StarryBackground from "../components/StarryBackground.vue";
import ChartsTableSection from "./BMSTable/ChartsTableSection.vue";
import type { ChartData, DifficultyGroup } from "./BMSTable/ChartsTableSection.vue";
import "../styles/main.pcss";

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

interface TableStats {
  totalCharts: number;
  difficulties: string[];
  averageLevel: string | number;
}

const props = defineProps<{ header: string; origin_url?: string }>();

const pageTitle = ref("加载难度表header中");

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

const copied = ref(false);

async function copySiteUrl(): Promise<void> {
  try {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      await navigator.clipboard.writeText(textarea.value);
      document.body.removeChild(textarea);
    }
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    copied.value = false;
  }
}

const originUrl = computed<string | null>(() => {
  if (!props.origin_url) return null;
  return String(props.origin_url);
});

// 模拟进度更新
function updateProgress(step: string, progress: number): void {
  loadingState.currentStep = step;
  loadingState.progress = progress;
}

// 懒加载JSON数据
async function lazyLoadTableData(): Promise<void> {
  try {
    pageTitle.value = "加载难度表header中";
    document.title = pageTitle.value;
    updateProgress("正在加载表头信息...", 25);

    if (!props.header) {
      throw new Error("必须提供header参数");
    }
    const headerUrlBase = new URL(props.header, window.location.href).toString();

    const headerResponse = await fetch(headerUrlBase, { redirect: "follow" });
    if (!headerResponse.ok) {
      throw new Error(`无法加载表头信息: ${headerResponse.status}`);
    }
    headerData.value = await headerResponse.json();

    pageTitle.value = String(headerData.value?.name || "未命名");
    document.title = pageTitle.value;

    updateProgress("表头信息加载完成", 50);

    const dataUrl = headerData.value?.data_url;
    if (!dataUrl) {
      throw new Error("表头信息中未找到data_url");
    }

    updateProgress("正在加载谱面数据...", 75);

    const isAbsolute = (u: string) => /^(https?:)?\/\//i.test(u) || u.startsWith("/");
    const dataFetchUrl = isAbsolute(String(dataUrl))
      ? String(dataUrl)
      : new URL(String(dataUrl), headerUrlBase).toString();
    const dataResponse = await fetch(dataFetchUrl, { redirect: "follow" });
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
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div v-if="headerData && headerData.symbol" class="page-subtitle">
        难度表符号: {{ headerData.symbol }}
      </div>
      <div class="page-subtitle usage-subtitle">
        使用方式：复制本网站链接（<button class="copy-action" type="button" @click="copySiteUrl">
          点击复制</button
        >），然后在BeMusicSeeker或beatoraja中，粘贴至对应选项处。
        <span v-if="copied" class="copy-feedback">已复制</span>
      </div>
      <div v-if="originUrl" class="page-subtitle origin-subtitle">
        <a class="copy-action" :href="originUrl" target="_blank" rel="noopener noreferrer"
          >原链接</a
        >
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
        <div
          v-if="headerData && headerData.name && headerData.name.startsWith('MiyakoMeow')"
          class="rank-reference-section"
        >
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
        <ChartsTableSection
          v-if="sortedDifficultyGroups.length > 0"
          :groups="sortedDifficultyGroups"
          :total-charts="tableData?.length || 0"
          :level-order="(headerData?.level_order as string[]) || []"
        />

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

<style lang="postcss" scoped>
@reference "tailwindcss";
.bms-table-container {
  @apply max-w-[1500px] my-8 mx-auto p-8 bg-white/5 backdrop-blur-[10px] rounded-[20px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)];
  @media (max-width: 768px) {
    @apply p-4 m-4 max-w-[calc(100%_-_2rem)];
  }
  @media (max-width: 480px) {
    @apply p-4 my-4 mx-auto rounded-[15px] overflow-x-auto;
    h1 {
      @apply text-[2rem];
    }
  }
}

.page-header {
  @apply mb-8 text-center;
  @media (max-width: 768px) {
    @apply mb-6;
  }
  @media (max-width: 480px) {
    @apply mb-4;
  }
}

.page-title {
  @apply text-white text-[2.5rem] font-bold mb-2 bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] bg-clip-text text-transparent;
  -background-clip: text;
  -text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  @media (max-width: 768px) {
    @apply text-[2rem] mb-2;
  }
  @media (max-width: 480px) {
    @apply text-[1.75rem] mb-2;
  }
}

.page-subtitle {
  @apply text-white/70 text-[1.2rem] italic;
  @media (max-width: 768px) {
    @apply text-[1.1rem];
  }
  @media (max-width: 480px) {
    @apply text-[1rem];
  }
}

.usage-subtitle {
  @apply mt-2;
}

.origin-subtitle {
  @apply mt-2;
}

.copy-action {
  @apply text-[#64b5f6] underline cursor-pointer bg-transparent border-0 p-0 m-0 font-medium;
}

.copy-action {
  &:hover {
    @apply text-[#42a5f5];
  }
}

.copy-feedback {
  @apply ml-2 text-[#4caf50];
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
  @media (max-width: 480px) {
    @apply flex-col items-start gap-2;
  }
}

.progress-header {
  h3 {
    @apply text-white m-0 text-[1.5rem];
  }
}

.progress-percentage {
  @apply bg-[#64b5f6]/20 text-[#64b5f6] px-4 py-2 rounded-[20px] font-bold text-[1.2rem];
  @media (max-width: 480px) {
    @apply self-start;
  }
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
  @media (max-width: 480px) {
    @apply grid-cols-1;
  }
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

.retry-button {
  &:hover {
    @apply bg-[#42a5f5];
  }
}

/* 数据展示样式 */
.data-section {
  @apply py-4;
}

.table-header {
  @apply grid grid-cols-2 gap-8 mb-8 p-6 bg-black/20 rounded-[15px];
  @media (max-width: 768px) {
    @apply flex flex-col gap-6;
  }
}

.header-info {
  h2 {
    @apply text-white mt-0 mb-4;
  }
}

.header-details {
  p {
    @apply my-2 text-white/80;
  }
  strong {
    @apply text-[#64b5f6];
  }
}

.stats-summary {
  h3 {
    @apply text-white mt-0 mb-4;
  }
}

.stats-grid {
  @apply grid grid-cols-3 gap-4;
  @media (max-width: 768px) {
    @apply grid-cols-2;
  }
  @media (max-width: 480px) {
    @apply grid-cols-3 gap-3;
  }
  @media (max-width: 480px) {
    @apply grid-cols-1;
  }
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
  @media (max-width: 768px) {
    @apply p-4 mt-6 mb-6;
  }
  @media (max-width: 480px) {
    @apply p-3 mt-4 mb-4;
  }
}

.rank-reference-section {
  h3 {
    @apply text-white mt-0 mb-6 text-[1.3rem] text-center;
  }
}

.rank-reference-tables {
  @apply flex gap-8 justify-center;
  @media (max-width: 768px) {
    @apply gap-4;
  }
  @media (max-width: 480px) {
    @apply flex-col gap-4;
  }
}

.rank-reference-left,
.rank-reference-right {
  @apply flex-1 min-w-0;
  table {
    @apply w-full border-collapse bg-white/5 rounded-[10px] overflow-hidden;
  }
  th {
    @apply bg-[rgba(100,181,246,0.3)] text-white px-4 py-3 text-left font-semibold border-b-2 border-white/10;
  }
  td {
    @apply px-4 py-3 border-b border-white/5 text-white/90;
  }
  tbody tr {
    &:hover {
      @apply bg-white/5;
    }
    &:last-child td {
      @apply border-b-0;
    }
  }
  @media (max-width: 768px) {
    th,
    td {
      @apply px-3 py-2 text-[0.9rem];
    }
  }
  @media (max-width: 480px) {
    th,
    td {
      @apply px-2 py-[0.4rem] text-[0.85rem];
    }
  }
}

/* 空状态样式 */
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
