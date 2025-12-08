<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import BlogLayout from "../layout/BlogLayout.vue";

// 从URL路径获取表格类型
function getTableTypeFromPath() {
  const path = window.location.pathname;
  if (path.includes("self-table-dp")) {
    return "dp";
  }
  return "sp"; // 默认为sp
}

// 根据表格类型获取标题
function getTitleFromTableType(tableType) {
  return tableType === "dp" ? "MiyakoMeow谱面合集（DP）" : "MiyakoMeow谱面合集（SP）";
}

const tableType = ref(getTableTypeFromPath());
const title = computed(() => getTitleFromTableType(tableType.value));

// 加载状态管理
const loadingState = reactive({
  isLoading: true,
  progress: 0,
  currentStep: "正在初始化...",
  totalSteps: 4,
});

const tableData = ref(null);
const headerData = ref(null);
const error = ref(null);

// 模拟进度更新
function updateProgress(step, progress) {
  loadingState.currentStep = step;
  loadingState.progress = progress;
}

// 懒加载JSON数据
async function lazyLoadTableData() {
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
    const dataUrl = headerData.value.data_url;
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
    error.value = err.message;
    loadingState.isLoading = false;
    console.error("加载BMS表格数据失败:", err);
  }
}

// 滚动到指定难度组
function scrollToDifficultyGroup(level) {
  const element = document.getElementById(`difficulty-group-${level}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// 计算表格统计数据
const tableStats = computed(() => {
  if (!tableData.value || !Array.isArray(tableData.value)) {
    return {
      totalCharts: 0,
      difficulties: [],
      averageLevel: 0,
    };
  }

  const charts = tableData.value;
  const difficulties = new Set();
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
    difficulties: Array.from(difficulties).sort((a, b) => {
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
    }),
    averageLevel: validLevelCount > 0 ? (totalLevel / validLevelCount).toFixed(2) : "N/A",
  };
});

// 按难度分组谱面数据
const groupedCharts = computed(() => {
  if (!tableData.value || !Array.isArray(tableData.value)) {
    return {};
  }

  const groups = {};
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
  const sortedKeys = levels.sort((a, b) => {
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
  });

  // 使用Map保持插入顺序，然后转换为数组
  const sortedGroupsMap = new Map();
  sortedKeys.forEach((key) => {
    sortedGroupsMap.set(key, groups[key]);
  });

  // 将Map转换为对象（Vue模板需要普通对象）
  const sortedGroups = {};
  sortedGroupsMap.forEach((value, key) => {
    sortedGroups[key] = value;
  });

  return sortedGroups;
});

// 获取排序后的难度组列表
const sortedDifficultyGroups = computed(() => {
  // 确保按排序后的键顺序获取值
  const groups = groupedCharts.value;
  const sortedKeys = Object.keys(groups).sort((a, b) => {
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
  });

  return sortedKeys.map((key) => groups[key]);
});

// 格式化等级显示
function formatLevel(level) {
  if (!level) return "N/A";
  const num = parseInt(level, 10);
  return isNaN(num) ? level : num.toString();
}

// 获取难度颜色
function getDifficultyColor(level) {
  if (level === "???") return "#ff6b6b";

  const num = parseFloat(level);
  if (isNaN(num)) return "#64b5f6";

  if (num <= 0) return "#4caf50"; // 绿色 - 简单
  if (num <= 5) return "#ff9800"; // 橙色 - 中等
  if (num <= 10) return "#f44336"; // 红色 - 困难
  return "#9c27b0"; // 紫色 - 超难
}

// 获取谱面显示信息
function getChartDisplayInfo(chart) {
  return {
    title: chart.title || "未知标题",
    // 如果没有artist字段，显示"未知艺术家"
    artist: chart.artist || "未知艺术家",
    level: chart.level || "N/A",
    // 其他可能存在的字段
    sha256: chart.sha256,
    md5: chart.md5,
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
  <BlogLayout>
    <div class="glass-container bms-table-container">
      <h1 class="content-title">{{ title }}</h1>
      <div class="bms-table-content">
        <!-- 加载状态 -->
        <div v-if="loadingState.isLoading" class="loading-section">
          <div class="progress-container">
            <div class="progress-header">
              <h3>正在加载BMS表格数据</h3>
              <div class="progress-percentage">{{ loadingState.progress }}%</div>
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: loadingState.progress + '%',
                }"
              ></div>
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
              <h2>表格信息</h2>
              <div class="header-details">
                <p v-if="headerData">
                  <strong>表格名称:</strong>
                  {{ headerData.name || "未命名" }}
                </p>
                <p v-if="headerData">
                  <strong>表格符号:</strong>
                  {{ headerData.symbol || "无" }}
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

          <!-- 按难度分组的谱面表格 -->
          <div class="charts-table-section" v-if="sortedDifficultyGroups.length > 0">
            <h3>谱面列表 ({{ tableData.length }} 首)</h3>

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

            <!-- 谱面表格 - 一次性显示所有难度组 -->
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
                  <span class="difficulty-group-count"> {{ group.charts.length }} 首谱面 </span>
                </div>
              </div>

              <div class="table-wrapper">
                <table class="charts-table">
                  <thead>
                    <tr>
                      <th>等级</th>
                      <th>标题</th>
                      <th>艺术家</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(chart, index) in group.charts" :key="index">
                      <td>
                        <span
                          class="level-badge"
                          :style="{
                            backgroundColor: getDifficultyColor(chart.level),
                          }"
                        >
                          {{ formatLevel(chart.level) }}
                        </span>
                      </td>
                      <td class="chart-title">
                        <strong>{{ getChartDisplayInfo(chart).title }}</strong>
                      </td>
                      <td>
                        {{ getChartDisplayInfo(chart).artist }}
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
            <p>表格中没有找到谱面数据。</p>
          </div>
        </div>
      </div>
    </div>
  </BlogLayout>
</template>

<style>
.bms-table-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.6;
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

/* 谱面表格样式 */
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
  min-width: 800px;
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
}

.charts-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chart-title {
  min-width: 250px;
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
@media (max-width: 1024px) {
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

@media (max-width: 768px) {
  .bms-table-container {
    padding: 1.5rem;
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
}

@media (max-width: 480px) {
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
}
</style>
