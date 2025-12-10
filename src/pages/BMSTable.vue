<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import StarryBackground from "../components/StarryBackground.vue";
import ChartsTableSection from "./BMSTable/ChartsTableSection.vue";
import LevelRefTable from "./BMSTable/LevelRefTable.vue";
import type { ChartData, DifficultyGroup } from "./BMSTable/ChartsTableSection.vue";
import "../styles/main.pcss";
import QuickActions from "../components/QuickActions.vue";
import "./BMSTable.pcss";

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
const dataFetchUrl = ref<string | null>(null);
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
    dataFetchUrl.value = isAbsolute(String(dataUrl))
      ? String(dataUrl)
      : new URL(String(dataUrl), headerUrlBase).toString();
    const dataResponse = await fetch(dataFetchUrl.value, { redirect: "follow" });
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

// 计算难度表统计数据（基于已分组的谱面数据）
const tableStats = computed<TableStats>(() => {
  const groups = groupedCharts.value;
  if (!groups || groups.length === 0) {
    return {
      totalCharts: 0,
      difficulties: [],
    };
  }

  // 使用reduce方法简化计算
  const { totalCharts, difficulties } = groups.reduce(
    (acc, group) => {
      acc.difficulties.add(group.level);
      acc.totalCharts += group.charts.length;
      return acc;
    },
    { totalCharts: 0, difficulties: new Set<string>() }
  );

  return {
    totalCharts,
    difficulties: Array.from(difficulties),
  };
});

// 按难度分组谱面数据（保持出现顺序，不在此处排序）
const groupedCharts = computed<DifficultyGroup[]>(() => {
  if (!tableData.value || !Array.isArray(tableData.value)) {
    return [];
  }
  const groupsMap = new Map<string, DifficultyGroup>();
  const charts = tableData.value;
  charts.forEach((chart) => {
    const level = chart.level || "unknown";
    if (!groupsMap.has(level)) {
      groupsMap.set(level, { level, charts: [] });
    }
    groupsMap.get(level)!.charts.push(chart);
  });
  return Array.from(groupsMap.values());
});

// 获取用于展示的难度组列表（排序在展示层处理）
const sortedDifficultyGroups = computed<DifficultyGroup[]>(() => groupedCharts.value);

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
      <div class="page-subtitle origin-subtitle">
        <a
          v-if="originUrl"
          class="copy-action"
          :href="originUrl"
          target="_blank"
          rel="noopener noreferrer"
          >原链接</a
        >
        <span v-if="originUrl && props.header" class="mx-2"> | </span>
        <a
          v-if="props.header"
          class="copy-action"
          :href="props.header"
          target="_blank"
          rel="noopener noreferrer"
          >查看header.json</a
        >
        <span v-if="(props.header || originUrl) && dataFetchUrl" class="mx-2">|</span>
        <a
          v-if="dataFetchUrl"
          class="copy-action"
          :href="dataFetchUrl"
          target="_blank"
          rel="noopener noreferrer"
          >查看data.json</a
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
            </div>
          </div>
        </div>

        <!-- 难度对照表 -->
        <LevelRefTable :header-url="props.header" />

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
  <QuickActions />
</template>
