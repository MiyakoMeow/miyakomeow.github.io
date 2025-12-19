<script lang="ts">
  import ScrollSyncGroup from "../../components/ScrollSyncGroup.svelte";

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

  interface BmsLinks {
    bmsScoreViewer: string;
    lr2ir: string;
    mocha: string;
    minir: string;
  }

  export let groups: DifficultyGroup[] = [];
  export let totalCharts: number;
  export let levelOrder: string[] | undefined = undefined;

  let displayGroups: DifficultyGroup[] = [];

  $: {
    const order = levelOrder ?? [];
    const orderIndex = new Map<string, number>();
    order.forEach((lv, idx) => orderIndex.set(String(lv), idx));
    const defined: DifficultyGroup[] = [];
    const others: DifficultyGroup[] = [];
    for (const g of groups) {
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
    displayGroups = [...defined, ...others];
  }

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

{#if groups.length === 0}
  <div class="empty-state">
    <div class="empty-icon">📊</div>
    <h3>暂无谱面数据</h3>
    <p>难度表中没有找到谱面数据。</p>
  </div>
{:else}
  <div class="charts-table-section">
    <h3>谱面列表 ({totalCharts} 个)</h3>

    <ScrollSyncGroup watchKeys={groups} let:setRef>
      {#if groups.length > 1}
        <div class="difficulty-groups-nav">
          <div class="difficulty-groups-tabs">
            {#each displayGroups as group, idx (group.level)}
              <button
                class="difficulty-group-tab"
                type="button"
                on:click={() => scrollToDifficultyGroup(group.level)}
                style={`background-color:${segmentColor(idx, displayGroups.length)};border-color:${segmentColor(idx, displayGroups.length)};`}
              >
                {group.level}
                <span class="chart-count">({group.charts.length})</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#each displayGroups as group, gIndex (group.level)}
        {@const groupColor = segmentColor(gIndex, displayGroups.length)}
        <div id={`difficulty-group-${group.level}`} class="difficulty-group-container">
          <div class="difficulty-group-header">
            <div class="difficulty-group-title">
              <span class="difficulty-group-badge" style={`background-color:${groupColor};`}>
                难度 {group.level}
              </span>
              <span class="difficulty-group-count"> {group.charts.length} 个谱面 </span>
            </div>
          </div>

          <div class="table-wrapper" use:setRef>
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
                {#each group.charts as chart, index (index)}
                  {@const bundleUrl = resolvedBundleUrl(chart)}
                  {@const diffUrl = resolvedDiffUrl(chart)}
                  {@const bmsLinks = getBmsLinks(chart)}
                  <tr>
                    <td>
                      <span class="level-badge" style={`background-color:${groupColor};`}>
                        {group.level}
                      </span>
                    </td>
                    <td class="download-cell">
                      <div class="download-buttons">
                        {#if bundleUrl}
                          <a
                            class="download-button download-bundle"
                            href={bundleUrl}
                            title={bundleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📦 同捆
                          </a>
                        {/if}
                        {#if diffUrl}
                          <a
                            class="download-button download-diff"
                            href={diffUrl}
                            title={diffUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🔄 差分
                          </a>
                        {/if}
                      </div>
                    </td>
                    <td class="bms-links-cell">
                      <div class="bms-links">
                        {#if hasMd5(chart)}
                          <a
                            class="bms-link-button bms-score-viewer"
                            href={bmsLinks.bmsScoreViewer}
                            title={bmsLinks.bmsScoreViewer}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📊
                          </a>
                          <a
                            class="bms-link-button lr2ir"
                            href={bmsLinks.lr2ir}
                            title={bmsLinks.lr2ir}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LR2
                          </a>
                        {/if}
                        {#if hasSha256(chart)}
                          <a
                            class="bms-link-button mocha"
                            href={bmsLinks.mocha}
                            title={bmsLinks.mocha}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src="/assets/logo/mocha_logo.gif" alt="Mocha" class="bms-icon" />
                          </a>
                          <a
                            class="bms-link-button minir"
                            href={bmsLinks.minir}
                            title={bmsLinks.minir}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src="/assets/logo/minir_logo.gif" alt="Minir" class="bms-icon" />
                          </a>
                        {/if}
                      </div>
                    </td>
                    <td class="chart-title">
                      <strong>{chart.title || "未知标题"}</strong>
                    </td>
                    <td>{chart.artist || "未知艺术家"}</td>
                    <td class="comment-cell">{chart.comment || ""}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/each}
    </ScrollSyncGroup>
  </div>
{/if}

<style>
  @reference "tailwindcss";

  .charts-table-section {
    @apply mt-8;
  }

  .charts-table-section {
    h3 {
      @apply mb-4 text-white;
    }
  }

  .table-wrapper {
    @apply overflow-x-auto rounded-[10px] border border-white/10 bg-black/20;
  }

  .charts-table {
    @apply w-full min-w-[900px] table-fixed border-collapse;
    th {
      @apply border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white;
    }
    td {
      @apply border-b border-white/5 p-4 break-words text-white/90;
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
  }

  .chart-title {
    @apply min-w-[200px];
  }

  .comment-cell {
    @apply max-w-[300px] min-w-[150px];
  }

  .level-badge {
    @apply inline-block min-w-[30px] rounded-[12px] px-2 py-1 text-center text-[0.85rem] font-semibold text-white;
  }

  .download-cell {
    @apply max-w-[180px] min-w-[130px];
  }

  .download-buttons {
    @apply flex flex-row flex-wrap gap-[0.3rem];
  }

  .download-button {
    @apply flex min-w-[60px] flex-1 cursor-pointer items-center justify-center gap-[0.2rem] rounded-[6px] border-none px-[0.5rem] py-[0.35rem] text-[0.85rem] font-semibold text-inherit no-underline transition-all duration-200 ease-in-out;
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
    @apply max-w-[180px] min-w-[140px];
  }

  .bms-links {
    @apply flex flex-wrap justify-center gap-[0.4rem];
  }

  .bms-link-button {
    @apply flex h-[36px] w-[36px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-none p-0 text-[1.2rem] text-inherit no-underline transition-all duration-200 ease-in-out;
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
    @apply h-6 w-6 object-contain;
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
    @apply mb-6 flex flex-wrap gap-3;
  }

  .difficulty-group-tab {
    @apply flex cursor-pointer items-center justify-center gap-2 rounded-[25px] border-2 border-transparent px-6 py-3 text-[1.1rem] font-bold text-white opacity-70 transition-all duration-300 ease-in-out;
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
    @apply rounded-[10px] bg-black/20 px-2 py-[0.1rem] text-[0.9rem] opacity-90;
  }

  .difficulty-group-container {
    @apply mb-12 scroll-mt-[20px];
  }

  .difficulty-group-header {
    @apply mb-6 border-b-2 border-white/10 pb-4;
  }

  .difficulty-group-title {
    @apply flex items-center gap-4;
  }

  .difficulty-group-badge {
    @apply rounded-[20px] px-6 py-2 text-[1.2rem] font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)];
  }

  .difficulty-group-count {
    @apply text-[1.1rem] text-white/80;
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
