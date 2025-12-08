<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import StarryBackground from "../components/StarryBackground.vue";

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

// 打开URL链接
function openUrl(url: string): void {
  if (url) {
    window.open(url, "_blank");
  }
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
                        <button
                          v-if="getChartDisplayInfo(chart).url"
                          class="download-button download-bundle"
                          @click="openUrl(getChartDisplayInfo(chart).url)"
                          :title="getChartDisplayInfo(chart).url"
                        >
                          📦 同捆
                        </button>
                        <button
                          v-if="getChartDisplayInfo(chart).url_diff"
                          class="download-button download-diff"
                          @click="openUrl(getChartDisplayInfo(chart).url_diff)"
                          :title="getChartDisplayInfo(chart).url_diff"
                        >
                          🔄 差分
                        </button>
                      </div>
                    </td>
                    <td class="bms-links-cell">
                      <div class="bms-links">
                        <button
                          class="bms-link-button bms-score-viewer"
                          @click="openUrl(getBmsLinks(chart).bmsScoreViewer)"
                          :title="getBmsLinks(chart).bmsScoreViewer"
                        >
                          📊
                        </button>
                        <button
                          class="bms-link-button lr2ir"
                          @click="openUrl(getBmsLinks(chart).lr2ir)"
                          :title="getBmsLinks(chart).lr2ir"
                        >
                          LR2
                        </button>
                        <button
                          class="bms-link-button mocha"
                          @click="openUrl(getBmsLinks(chart).mocha)"
                          :title="getBmsLinks(chart).mocha"
                        >
                          <img src="/assets/logo/mocha_logo.gif" alt="Mocha" class="bms-icon" />
                        </button>
                        <button
                          class="bms-link-button minir"
                          @click="openUrl(getBmsLinks(chart).minir)"
                          :title="getBmsLinks(chart).minir"
                        >
                          <img src="/assets/logo/minir_logo.gif" alt="Minir" class="bms-icon" />
                        </button>
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
.bms-table-container {
  max-width: 1500px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  font-style: italic;
}

.bms-table-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.6;
  width: 100%;
}

/* 加载状态样式 */
.loading-section {
  padding: 2rem;
}

.progress-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.progress-header h3 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
}

.progress-percentage {
  background: rgba(100, 181, 246, 0.2);
  color: #64b5f6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.2rem;
}

.progress-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #64b5f6);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.step-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.step-text {
  color: white;
  font-weight: 500;
}

/* 错误状态样式 */
.error-section {
  text-align: center;
  padding: 3rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-section h3 {
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.error-message {
  background: rgba(255, 107, 107, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin: 1.5rem 0;
  border-left: 4px solid #ff6b6b;
}

.retry-button {
  background: #64b5f6;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.retry-button:hover {
  background: #42a5f5;
}

/* 数据展示样式 */
.data-section {
  padding: 1rem 0;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
}

.header-info h2 {
  color: white;
  margin-top: 0;
  margin-bottom: 1rem;
}

.header-details p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.header-details strong {
  color: #64b5f6;
}

.stats-summary h3 {
  color: white;
  margin-top: 0;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #64b5f6;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* 难度对照表样式 */
.rank-reference-section {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.rank-reference-section h3 {
  color: white;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  text-align: center;
}

.rank-reference-tables {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.rank-reference-left,
.rank-reference-right {
  flex: 1;
  min-width: 0;
}

.rank-reference-left table,
.rank-reference-right table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

.rank-reference-left th,
.rank-reference-right th {
  background: rgba(100, 181, 246, 0.3);
  color: white;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.rank-reference-left td,
.rank-reference-right td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.rank-reference-left tbody tr:hover,
.rank-reference-right tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.rank-reference-left tbody tr:last-child td,
.rank-reference-right tbody tr:last-child td {
  border-bottom: none;
}

/* 谱面列表样式 */
.charts-table-section {
  margin-top: 2rem;
}

.charts-table-section h3 {
  color: white;
  margin-bottom: 1rem;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.charts-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.charts-table th {
  background: rgba(100, 181, 246, 0.2);
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.charts-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  word-break: break-word;
}

.charts-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chart-title {
  min-width: 200px;
}

.comment-cell {
  min-width: 150px;
  max-width: 300px;
}

.level-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 60px;
  text-align: center;
}

/* 下载按钮样式 */
.download-cell {
  min-width: 130px;
  max-width: 180px;
}

.download-buttons {
  display: flex;
  flex-direction: row;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.download-button {
  padding: 0.35rem 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-width: 60px;
  flex: 1;
}

.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.download-button:active {
  transform: translateY(0);
}

.download-bundle {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
}

.download-bundle:hover {
  background: linear-gradient(135deg, #66bb6a, #388e3c);
}

.download-diff {
  background: linear-gradient(135deg, #2196f3, #1565c0);
  color: white;
}

.download-diff:hover {
  background: linear-gradient(135deg, #42a5f5, #1976d2);
}

/* BMS网站链接样式 */
.bms-links-cell {
  min-width: 140px;
  max-width: 180px;
}

.bms-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}

.bms-link-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
}

.bms-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.bms-link-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.bms-link-button:active {
  transform: scale(0.95);
}

.bms-score-viewer {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.bms-score-viewer:hover {
  background: linear-gradient(135deg, #ffb74d, #ff9800);
}

.lr2ir {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
  color: white;
}

.lr2ir:hover {
  background: linear-gradient(135deg, #ba68c8, #9c27b0);
}

.mocha {
  background: linear-gradient(135deg, #795548, #5d4037);
  color: white;
}

.mocha:hover {
  background: linear-gradient(135deg, #a1887f, #795548);
}

.minir {
  background: linear-gradient(135deg, #00bcd4, #0097a7);
  color: white;
}

.minir:hover {
  background: linear-gradient(135deg, #4dd0e1, #00bcd4);
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: white;
  margin-bottom: 1rem;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7);
}

/* 难度分组导航样式 */
.difficulty-groups-nav {
  margin-bottom: 2rem;
}

.difficulty-groups-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.difficulty-group-tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid transparent;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0.7;
}

.difficulty-group-tab:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.difficulty-group-tab:active {
  opacity: 0.9;
  transform: translateY(-1px);
}

.chart-count {
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
}

/* 难度组容器样式 */
.difficulty-group-container {
  margin-bottom: 3rem;
  scroll-margin-top: 20px; /* 滚动时的偏移 */
}

/* 难度组标题样式 */
.difficulty-group-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.difficulty-group-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.difficulty-group-badge {
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.difficulty-group-count {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bms-table-container {
    padding: 1rem;
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }

  .rank-reference-section {
    padding: 1rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .rank-reference-tables {
    gap: 1rem;
  }

  .rank-reference-left th,
  .rank-reference-left td,
  .rank-reference-right th,
  .rank-reference-right td {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
  .page-header {
    margin-bottom: 1.5rem;
  }
  .page-title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .page-subtitle {
    font-size: 1.1rem;
  }
  .table-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .difficulty-groups-tabs {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .difficulty-group-tab {
    flex: 1 0 calc(33.333% - 0.5rem);
    min-width: 80px;
    padding: 0.6rem 1rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .bms-table-container {
    padding: 1rem;
    margin: 1rem auto;
  }

  .charts-table td:nth-child(6) {
    max-width: 120px;
    font-size: 0.8em;
  }

  .bms-table-container h1 {
    font-size: 2rem;
  }

  .progress-steps {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .charts-table th,
  .charts-table td {
    padding: 0.75rem;
  }

  .charts-table {
    min-width: 800px;
  }

  .chart-title {
    min-width: 150px;
  }

  .comment-cell {
    min-width: 100px;
    max-width: 200px;
  }

  .download-cell {
    min-width: 110px;
    max-width: 150px;
  }

  .download-button {
    padding: 0.25rem 0.4rem;
    font-size: 0.75rem;
    min-width: 55px;
    flex: 1;
  }

  .bms-links-cell {
    min-width: 120px;
    max-width: 140px;
  }

  .bms-link-button {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .bms-table-container {
    padding: 1rem;
    margin: 1rem;
    max-width: calc(100% - 2rem);
    border-radius: 15px;
    overflow-x: auto;
  }

  .rank-reference-section {
    padding: 0.75rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .rank-reference-tables {
    flex-direction: column;
    gap: 1rem;
  }

  .rank-reference-left th,
  .rank-reference-left td,
  .rank-reference-right th,
  .rank-reference-right td {
    padding: 0.4rem 0.5rem;
    font-size: 0.85rem;
  }
  .page-header {
    margin-bottom: 1rem;
  }
  .page-title {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  .page-subtitle {
    font-size: 1rem;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .progress-percentage {
    align-self: flex-start;
  }
  .difficulty-groups-tabs {
    flex-direction: column;
  }
  .difficulty-group-tab {
    width: 100%;
    text-align: center;
  }
  .difficulty-group-badge {
    font-size: 1rem;
    padding: 0.3rem 0.8rem;
  }
  .difficulty-group-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .difficulty-group-count {
    font-size: 1rem;
  }

  .charts-table {
    min-width: 600px;
  }

  .chart-title {
    min-width: 120px;
  }

  .comment-cell {
    min-width: 80px;
    max-width: 150px;
    font-size: 0.85rem;
  }

  .download-cell {
    min-width: 90px;
    max-width: 120px;
  }

  .download-button {
    padding: 0.2rem 0.3rem;
    font-size: 0.7rem;
    min-width: 50px;
    flex: 1;
  }

  .download-buttons {
    gap: 0.3rem;
  }

  .bms-links-cell {
    min-width: 100px;
    max-width: 120px;
  }

  .bms-link-button {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }

  .bms-links {
    gap: 0.3rem;
  }

  .charts-table th,
  .charts-table td {
    padding: 0.5rem;
  }
}
</style>
