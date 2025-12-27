<script lang="ts">
  import JsonPreview, {
    jsonPreview,
    type JsonPreviewHandle,
  } from "../../components/JsonPreview.svelte";
  import ScrollSyncGroup from "../../utils/ScrollSyncGroup.svelte";

  let chartPreview: JsonPreviewHandle | undefined;

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
  <div class="p-12 text-center">
    <div class="mb-4 text-[4rem]">📊</div>
    <h3 class="mb-4 text-white">暂无谱面数据</h3>
    <p class="text-white/70">难度表中没有找到谱面数据。</p>
  </div>
{:else}
  <div class="mt-8">
    <h3 class="mb-4 text-white">谱面列表 ({totalCharts} 个)</h3>

    <ScrollSyncGroup watchKeys={groups} let:setRef>
      {#if groups.length > 1}
        <div class="mb-8">
          <div class="mb-6 flex flex-wrap gap-3">
            {#each displayGroups as group, idx (group.level)}
              <button
                class="flex cursor-pointer items-center justify-center gap-2 rounded-[25px] border-2 border-transparent px-6 py-3 text-[1.1rem] font-bold text-white opacity-70 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:-translate-y-px active:opacity-90"
                type="button"
                on:click={() => scrollToDifficultyGroup(group.level)}
                style={`background-color:${segmentColor(idx, displayGroups.length)};border-color:${segmentColor(idx, displayGroups.length)};`}
              >
                {group.level}
                <span class="rounded-[10px] bg-black/20 px-2 py-[0.1rem] text-[0.9rem] opacity-90">
                  ({group.charts.length})
                </span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#each displayGroups as group, gIndex (group.level)}
        {@const groupColor = segmentColor(gIndex, displayGroups.length)}
        <div id={`difficulty-group-${group.level}`} class="mb-12 scroll-mt-5">
          <div class="mb-6 border-b-2 border-white/10 pb-4">
            <div class="flex items-center gap-4">
              <span
                class="rounded-[20px] px-6 py-2 text-[1.2rem] font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                style={`background-color:${groupColor};`}
              >
                难度 {group.level}
              </span>
              <span class="text-[1.1rem] text-white/80"> {group.charts.length} 个谱面 </span>
            </div>
          </div>

          <div class="overflow-x-auto rounded-[10px] border border-white/10 bg-black/20" use:setRef>
            <table class="w-full min-w-225 table-fixed border-collapse">
              <colgroup>
                <col style="width: 7%" />
                <col style="width: 13%" />
                <col style="width: 14%" />
                <col style="width: 26%" />
                <col style="width: 22%" />
                <col style="width: 18%" />
              </colgroup>
              <thead>
                <tr>
                  <th
                    class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                  >
                    等级
                  </th>
                  <th
                    class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                  >
                    下载
                  </th>
                  <th
                    class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                  >
                    BMS网站
                  </th>
                  <th
                    class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                  >
                    标题
                  </th>
                  <th
                    class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                  >
                    艺术家
                  </th>
                  <th
                    class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                  >
                    备注
                  </th>
                </tr>
              </thead>
              <tbody>
                {#each group.charts as chart, index (index)}
                  {@const bundleUrl = resolvedBundleUrl(chart)}
                  {@const diffUrl = resolvedDiffUrl(chart)}
                  {@const bmsLinks = getBmsLinks(chart)}
                  {@const chartJson = { ...chart, groupLevel: group.level }}
                  <tr class="hover:bg-white/5">
                    <td class="border-b border-white/5 p-4 wrap-break-word text-white/90">
                      <span
                        class="inline-block min-w-7.5 rounded-xl px-2 py-1 text-center text-[0.85rem] font-semibold text-white"
                        style={`background-color:${groupColor};`}
                      >
                        {group.level}
                      </span>
                    </td>
                    <td class="border-b border-white/5 p-4 wrap-break-word text-white/90">
                      <div class="flex flex-row flex-wrap gap-[0.3rem]">
                        {#if bundleUrl}
                          <a
                            class="flex min-w-17 flex-1 cursor-pointer items-center justify-center gap-[0.2rem] rounded-md border-none bg-[linear-gradient(135deg,#4caf50,#2e7d32)] px-2 py-[0.35rem] text-[0.85rem] font-semibold text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#66bb6a,#388e3c)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] active:translate-y-0"
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
                            class="flex min-w-17 flex-1 cursor-pointer items-center justify-center gap-[0.2rem] rounded-md border-none bg-[linear-gradient(135deg,#2196f3,#1565c0)] px-2 py-[0.35rem] text-[0.85rem] font-semibold text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#42a5f5,#1976d2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] active:translate-y-0"
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
                    <td class="border-b border-white/5 p-4 wrap-break-word text-white/90">
                      <div class="flex flex-wrap justify-center gap-[0.4rem]">
                        {#if hasMd5(chart)}
                          <a
                            class="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-none bg-[linear-gradient(135deg,#ff9800,#f57c00)] p-0 text-[1.2rem] text-white no-underline transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[linear-gradient(135deg,#ffb74d,#ff9800)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:scale-95"
                            href={bmsLinks.bmsScoreViewer}
                            title={bmsLinks.bmsScoreViewer}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📊
                          </a>
                          <a
                            class="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-none bg-[linear-gradient(135deg,#9c27b0,#7b1fa2)] p-0 text-[0.85rem] font-bold text-white no-underline transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[linear-gradient(135deg,#ba68c8,#9c27b0)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:scale-95"
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
                            class="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-none bg-[linear-gradient(135deg,#795548,#5d4037)] p-0 text-[1.2rem] text-white no-underline transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[linear-gradient(135deg,#a1887f,#795548)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:scale-95"
                            href={bmsLinks.mocha}
                            title={bmsLinks.mocha}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src="/assets/logo/mocha_logo.gif"
                              alt="Mocha"
                              class="h-6 w-6 object-contain"
                            />
                          </a>
                          <a
                            class="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border-none bg-[linear-gradient(135deg,#00bcd4,#0097a7)] p-0 text-[1.2rem] text-white no-underline transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[linear-gradient(135deg,#4dd0e1,#00bcd4)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] active:scale-95"
                            href={bmsLinks.minir}
                            title={bmsLinks.minir}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src="/assets/logo/minir_logo.gif"
                              alt="Minir"
                              class="h-6 w-6 object-contain"
                            />
                          </a>
                        {/if}
                      </div>
                    </td>
                    <td class="border-b border-white/5 p-4 wrap-break-word text-white/90">
                      <strong
                        class="cursor-default"
                        use:jsonPreview={{
                          preview: chartPreview,
                          options: { value: chartJson, label: "谱面 JSON", maxHeightRem: 14 },
                        }}
                      >
                        {chart.title || "未知标题"}
                      </strong>
                    </td>
                    <td class="border-b border-white/5 p-4 wrap-break-word text-white/90">
                      {chart.artist || "未知艺术家"}
                    </td>
                    <td class="border-b border-white/5 p-4 wrap-break-word text-white/90">
                      {chart.comment || ""}
                    </td>
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

<JsonPreview bind:this={chartPreview} />
