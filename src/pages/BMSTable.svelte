<script lang="ts">
  import { onMount } from "svelte";

  import StarryBackground from "../components/StarryBackground.svelte";
  import QuickActions from "../components/QuickActions.svelte";
  import ChartsTableSection from "./BMSTable/ChartsTableSection.svelte";
  import LevelRefTable from "./BMSTable/LevelRefTable.svelte";
  import "../styles/main.css";

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

  interface DifficultyGroup {
    level: string;
    charts: ChartData[];
  }

  interface HeaderData {
    name?: string;
    symbol?: string;
    data_url?: string;
    level_order?: string[];
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

  export let header: string;
  export let origin_url: string | undefined = undefined;

  let pageTitle = "加载难度表header中";

  let loadingState: LoadingState = {
    isLoading: true,
    progress: 0,
    currentStep: "正在初始化...",
    totalSteps: 4,
  };

  let tableData: ChartData[] | null = null;
  let headerData: HeaderData | null = null;
  let dataFetchUrl: string | null = null;
  let error: string | null = null;

  let copied = false;

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
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      copied = false;
    }
  }

  let originUrl: string | null = null;
  $: originUrl = origin_url ? String(origin_url) : null;

  function updateProgress(step: string, progress: number): void {
    loadingState = { ...loadingState, currentStep: step, progress };
  }

  async function lazyLoadTableData(): Promise<void> {
    try {
      error = null;
      tableData = null;
      headerData = null;
      dataFetchUrl = null;

      loadingState = {
        ...loadingState,
        isLoading: true,
        progress: 0,
        currentStep: "正在初始化...",
      };

      pageTitle = "加载难度表header中";
      document.title = pageTitle;
      updateProgress("正在加载表头信息...", 25);

      if (!header) {
        throw new Error("必须提供header参数");
      }
      const headerUrlBase = new URL(header, window.location.href).toString();

      const headerResponse = await fetch(headerUrlBase, { redirect: "follow" });
      if (!headerResponse.ok) {
        throw new Error(`无法加载表头信息: ${headerResponse.status}`);
      }
      headerData = await headerResponse.json();

      pageTitle = String(headerData?.name || "未命名");
      document.title = pageTitle;

      updateProgress("表头信息加载完成", 50);

      const dataUrl = headerData?.data_url;
      if (!dataUrl) {
        throw new Error("表头信息中未找到data_url");
      }

      updateProgress("正在加载谱面数据...", 75);

      const isAbsolute = (u: string) => /^(https?:)?\/\//i.test(u) || u.startsWith("/");
      dataFetchUrl = isAbsolute(String(dataUrl))
        ? String(dataUrl)
        : new URL(String(dataUrl), headerUrlBase).toString();

      const dataResponse = await fetch(dataFetchUrl, { redirect: "follow" });
      if (!dataResponse.ok) {
        throw new Error(`无法加载谱面数据: ${dataResponse.status}`);
      }
      tableData = await dataResponse.json();

      updateProgress("数据加载完成", 100);

      setTimeout(() => {
        loadingState = { ...loadingState, isLoading: false };
      }, 500);
    } catch (err) {
      error = err instanceof Error ? err.message : "未知错误";
      loadingState = { ...loadingState, isLoading: false };
      console.error("加载BMS难度表数据失败:", err);
    }
  }

  let groupedCharts: DifficultyGroup[] = [];
  $: {
    if (!tableData || !Array.isArray(tableData)) {
      groupedCharts = [];
    } else {
      const groupsMap = new Map<string, DifficultyGroup>();
      const charts = tableData;
      for (const chart of charts) {
        const level = chart.level || "unknown";
        if (!groupsMap.has(level)) {
          groupsMap.set(level, { level, charts: [] });
        }
        groupsMap.get(level)?.charts.push(chart);
      }
      groupedCharts = Array.from(groupsMap.values());
    }
  }

  let tableStats: TableStats = { totalCharts: 0, difficulties: [] };
  $: {
    const groups = groupedCharts;
    if (!groups || groups.length === 0) {
      tableStats = { totalCharts: 0, difficulties: [] };
    } else {
      const { totalCharts, difficulties } = groups.reduce(
        (acc, group) => {
          acc.difficulties.add(group.level);
          acc.totalCharts += group.charts.length;
          return acc;
        },
        { totalCharts: 0, difficulties: new Set<string>() }
      );
      tableStats = { totalCharts, difficulties: Array.from(difficulties) };
    }
  }

  let sortedDifficultyGroups: DifficultyGroup[] = [];
  $: sortedDifficultyGroups = groupedCharts;

  onMount(() => {
    setTimeout(() => {
      void lazyLoadTableData();
    }, 300);
  });
</script>

<StarryBackground />
<div class="bms-table-container">
  <div class="page-header">
    <h1 class="page-title">{pageTitle}</h1>
    {#if headerData?.symbol}
      <div class="page-subtitle">难度表符号: {headerData.symbol}</div>
    {/if}
    <div class="page-subtitle usage-subtitle">
      使用方式：复制本网站链接（
      <button class="copy-action" type="button" on:click={copySiteUrl}>点击复制</button>
      ），然后在BeMusicSeeker或beatoraja中，粘贴至对应选项处。
      {#if copied}
        <span class="copy-feedback">已复制</span>
      {/if}
    </div>
    <div class="page-subtitle origin-subtitle">
      {#if originUrl}
        <a class="copy-action" href={originUrl} target="_blank" rel="noopener noreferrer">原链接</a>
      {/if}
      {#if originUrl && header}
        <span class="mx-2"> | </span>
      {/if}
      {#if header}
        <a class="copy-action" href={header} target="_blank" rel="noopener noreferrer">
          查看header.json
        </a>
      {/if}
      {#if (header || originUrl) && dataFetchUrl}
        <span class="mx-2">|</span>
      {/if}
      {#if dataFetchUrl}
        <a class="copy-action" href={dataFetchUrl} target="_blank" rel="noopener noreferrer">
          查看data.json
        </a>
      {/if}
    </div>
  </div>
  <div class="bms-table-content">
    {#if loadingState.isLoading}
      <div class="loading-section">
        <div class="progress-container">
          <div class="progress-header">
            <h3>正在加载BMS难度表数据...</h3>
            <div class="progress-percentage">{Math.round(loadingState.progress)}%</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style={`width:${loadingState.progress}%;`}></div>
          </div>
          <div class="progress-steps">
            <div class="step-info">
              <span class="step-label">当前步骤:</span>
              <span class="step-text">{loadingState.currentStep}</span>
            </div>
            <div class="step-info">
              <span class="step-label">总步骤数:</span>
              <span class="step-text">{loadingState.totalSteps}</span>
            </div>
          </div>
        </div>
      </div>
    {:else if error}
      <div class="error-section">
        <div class="error-icon">⚠️</div>
        <h3>加载失败</h3>
        <p class="error-message">{error}</p>
        <p>请检查网络连接或稍后重试。</p>
        <button class="retry-button" type="button" on:click={lazyLoadTableData}>重新加载</button>
      </div>
    {:else}
      <div class="data-section">
        <div class="table-header">
          <div class="header-info">
            <h2>难度表信息</h2>
            <div class="header-details">
              {#if headerData}
                <p>
                  <strong>难度表名称:</strong>
                  {headerData.name || "未命名"}
                </p>
                <p>
                  <strong>难度表符号:</strong>
                  {headerData.symbol || "未定义"}
                </p>
              {/if}
            </div>
          </div>

          <div class="stats-summary">
            <h3>统计摘要</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{tableStats.totalCharts}</div>
                <div class="stat-label">总谱面数</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{tableStats.difficulties.length}</div>
                <div class="stat-label">难度等级数</div>
              </div>
            </div>
          </div>
        </div>

        <LevelRefTable headerUrl={header} />

        {#if sortedDifficultyGroups.length > 0}
          <ChartsTableSection
            groups={sortedDifficultyGroups}
            totalCharts={tableData?.length || 0}
            levelOrder={headerData?.level_order || []}
          />
        {:else}
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>暂无谱面数据</h3>
            <p>难度表中没有找到谱面数据。</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
<QuickActions />

<style>
  @reference "tailwindcss";

  .bms-table-container {
    @apply mx-auto my-8 max-w-[1500px] rounded-[20px] border border-white/10 bg-white/5 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[10px];
  }

  .page-header {
    @apply mb-8 text-center;
  }

  .page-title {
    @apply mb-2 bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] bg-clip-text text-[2.5rem] font-bold text-transparent text-white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .page-subtitle {
    @apply text-[1.2rem] text-white/70 italic;
  }

  .usage-subtitle {
    @apply mt-2;
  }

  .origin-subtitle {
    @apply mt-2;
  }

  .copy-action {
    @apply m-0 cursor-pointer border-0 bg-transparent p-0 font-medium text-[#64b5f6] underline;
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
    @apply w-full text-[1.1rem] leading-[1.6] text-white/90;
  }

  .loading-section {
    @apply p-8;
    .progress-container {
      @apply rounded-[15px] border border-white/10 bg-black/20 p-8;
    }
    .progress-header {
      @apply mb-6 flex items-center justify-between;
      h3 {
        @apply m-0 text-[1.5rem] text-white;
      }
    }
    .progress-percentage {
      @apply rounded-[20px] bg-[#64b5f6]/20 px-4 py-2 text-[1.2rem] font-bold text-[#64b5f6];
    }
    .progress-bar {
      @apply mb-6 h-[12px] overflow-hidden rounded-[6px] bg-white/10;
    }
    .progress-fill {
      @apply h-full rounded-[6px] bg-[linear-gradient(90deg,#4caf50,#64b5f6)];
      transition: width 0.3s ease;
    }
    .progress-steps {
      @apply grid grid-cols-2 gap-4;
    }
    .step-info {
      @apply flex flex-col gap-2;
    }
    .step-label {
      @apply text-[0.9rem] text-white/60;
    }
    .step-text {
      @apply font-medium text-white;
    }
  }

  .error-section {
    @apply p-12 text-center;
    .error-icon {
      @apply mb-4 text-[4rem];
    }
    h3 {
      @apply mb-4 text-[#ff6b6b];
    }
    .error-message {
      @apply my-6 rounded-[10px] border-l-[4px] border-[#ff6b6b] bg-[rgba(255,107,107,0.1)] p-4;
    }
    .retry-button {
      @apply mt-4 cursor-pointer rounded-[25px] border-none bg-[#64b5f6] px-8 py-3 text-[1rem] font-semibold text-white;
      transition: background 0.3s ease;
      &:hover {
        @apply bg-[#42a5f5];
      }
    }
  }

  .data-section {
    @apply py-4;
  }

  .table-header {
    @apply mb-8 grid grid-cols-2 gap-8 rounded-[15px] bg-black/20 p-6;
  }

  .header-info {
    h2 {
      @apply mt-0 mb-4 text-white;
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
      @apply mt-0 mb-4 text-white;
    }
  }

  .stats-grid {
    @apply grid grid-cols-3 gap-4;
  }

  .stat-card {
    @apply rounded-[10px] border border-white/10 bg-white/5 p-4 text-center;
  }

  .stat-value {
    @apply mb-2 text-[2rem] font-bold text-[#64b5f6];
  }

  .stat-label {
    @apply text-[0.9rem] text-white/70;
  }

  .empty-state {
    @apply p-12 text-center;
  }

  .empty-state {
    h3 {
      @apply mb-4 text-white;
    }
    p {
      @apply text-white/70;
    }
  }

  .empty-icon {
    @apply mb-4 text-[4rem];
  }
</style>
