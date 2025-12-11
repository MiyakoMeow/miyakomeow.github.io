import { defineComponent, computed, type ComponentPublicInstance } from "vue";
import ScrollSyncGroup from "@/components/ScrollSyncGroup";

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

export default defineComponent({
  name: "ChartsTableSection",
  props: {
    groups: {
      type: Array as () => DifficultyGroup[],
      required: true,
    },
    totalCharts: {
      type: Number,
      required: true,
    },
    levelOrder: {
      type: Array as () => string[],
      required: false,
    },
  },
  setup(props) {
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

    return () => {
      if (props.groups.length === 0) {
        return (
          <div class="text-center p-12">
            <div class="text-[4rem] mb-4">📊</div>
            <h3 class="text-white mb-4">暂无谱面数据</h3>
            <p class="text-white/70">难度表中没有找到谱面数据。</p>
          </div>
        );
      }

      return (
        <div class="mt-8">
          <h3 class="text-white mb-4">谱面列表 ({props.totalCharts} 个)</h3>

          <ScrollSyncGroup watch-keys={props.groups}>
            {{
              default: ({
                setRef,
              }: {
                setRef: (el: Element | ComponentPublicInstance | null) => void;
              }) => (
                <>
                  {props.groups.length > 1 && (
                    <div class="mb-8">
                      <div class="flex flex-wrap gap-3 mb-6">
                        {displayGroups.value.map((group, idx) => (
                          <button
                            key={group.level}
                            class="px-6 py-3 border-2 border-transparent rounded-[25px] font-bold text-[1.1rem] text-white cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 opacity-70 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:opacity-90 active:-translate-y-[1px]"
                            onClick={() => scrollToDifficultyGroup(group.level)}
                            style={{
                              backgroundColor: segmentColor(idx, displayGroups.value.length),
                              borderColor: segmentColor(idx, displayGroups.value.length),
                            }}
                          >
                            {group.level}
                            <span class="text-[0.9rem] opacity-90 bg-black/20 py-[0.1rem] px-2 rounded-[10px]">
                              ({group.charts.length})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {displayGroups.value.map((group, gIndex) => (
                    <div
                      key={group.level}
                      id={`difficulty-group-${group.level}`}
                      class="mb-12 scroll-mt-[20px]"
                    >
                      <div class="mb-6 pb-4 border-b-2 border-white/10">
                        <div class="flex items-center gap-4">
                          <span
                            class="px-6 py-2 rounded-[20px] font-bold text-[1.2rem] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                            style={{
                              backgroundColor: segmentColor(gIndex, displayGroups.value.length),
                            }}
                          >
                            难度 {group.level}
                          </span>
                          <span class="text-[1.1rem] text-white/80">
                            {" "}
                            {group.charts.length} 个谱面{" "}
                          </span>
                        </div>
                      </div>

                      <div
                        class="overflow-x-auto rounded-[10px] bg-black/20 border border-white/10"
                        ref={setRef}
                      >
                        <table class="w-full border-collapse min-w-[900px] table-fixed">
                          <colgroup>
                            <col style={{ width: "50px" }} />
                            <col style={{ width: "140px" }} />
                            <col style={{ width: "140px" }} />
                            <col style={{ width: "260px" }} />
                            <col style={{ width: "200px" }} />
                            <col style={{ width: "260px" }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                等级
                              </th>
                              <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                下载
                              </th>
                              <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                BMS网站
                              </th>
                              <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                标题
                              </th>
                              <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                艺术家
                              </th>
                              <th class="bg-[rgba(100,181,246,0.2)] text-white p-4 text-left font-semibold border-b-2 border-white/10">
                                备注
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.charts.map((chart, index) => (
                              <tr key={index} class="hover:bg-white/5">
                                <td class="p-4 border-b border-white/5 text-white/90 break-words">
                                  <span
                                    class="inline-block px-2 py-1 rounded-[12px] text-white font-semibold text-[0.85rem] min-w-[30px] text-center"
                                    style={{
                                      backgroundColor: segmentColor(
                                        gIndex,
                                        displayGroups.value.length
                                      ),
                                    }}
                                  >
                                    {group.level}
                                  </span>
                                </td>
                                <td class="p-4 border-b border-white/5 text-white/90 break-words min-w-[130px] max-w-[180px]">
                                  <div class="flex flex-row gap-[0.3rem] flex-wrap">
                                    {resolvedBundleUrl(chart) && (
                                      <a
                                        class="px-[0.5rem] py-[0.35rem] border-none rounded-[6px] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-[0.2rem] min-w-[60px] flex-1 no-underline text-inherit bg-[linear-gradient(135deg,#4caf50,#2e7d32)] text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 hover:bg-[linear-gradient(135deg,#66bb6a,#388e3c)]"
                                        href={resolvedBundleUrl(chart)}
                                        title={resolvedBundleUrl(chart)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        📦 同捆
                                      </a>
                                    )}
                                    {resolvedDiffUrl(chart) && (
                                      <a
                                        class="px-[0.5rem] py-[0.35rem] border-none rounded-[6px] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-[0.2rem] min-w-[60px] flex-1 no-underline text-inherit bg-[linear-gradient(135deg,#2196f3,#1565c0)] text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 hover:bg-[linear-gradient(135deg,#42a5f5,#1976d2)]"
                                        href={resolvedDiffUrl(chart)}
                                        title={resolvedDiffUrl(chart)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        🔄 差分
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td class="p-4 border-b border-white/5 text-white/90 break-words min-w-[140px] max-w-[180px]">
                                  <div class="flex flex-wrap gap-[0.4rem] justify-center">
                                    {hasMd5(chart) && (
                                      <a
                                        class="w-[36px] h-[36px] border-none rounded-full text-[1.2rem] cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center p-0 overflow-hidden no-underline text-inherit bg-[linear-gradient(135deg,#ff9800,#f57c00)] text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 hover:bg-[linear-gradient(135deg,#ffb74d,#ff9800)]"
                                        href={getBmsLinks(chart).bmsScoreViewer}
                                        title={getBmsLinks(chart).bmsScoreViewer}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        📊
                                      </a>
                                    )}
                                    {hasMd5(chart) && (
                                      <a
                                        class="w-[36px] h-[36px] border-none rounded-full text-[1.2rem] cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center p-0 overflow-hidden no-underline text-inherit bg-[linear-gradient(135deg,#9c27b0,#7b1fa2)] text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 hover:bg-[linear-gradient(135deg,#ba68c8,#9c27b0)]"
                                        href={getBmsLinks(chart).lr2ir}
                                        title={getBmsLinks(chart).lr2ir}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        LR2
                                      </a>
                                    )}
                                    {hasSha256(chart) && (
                                      <a
                                        class="w-[36px] h-[36px] border-none rounded-full text-[1.2rem] cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center p-0 overflow-hidden no-underline text-inherit bg-[linear-gradient(135deg,#795548,#5d4037)] text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 hover:bg-[linear-gradient(135deg,#a1887f,#795548)]"
                                        href={getBmsLinks(chart).mocha}
                                        title={getBmsLinks(chart).mocha}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <img
                                          src="/assets/logo/mocha_logo.gif"
                                          alt="Mocha"
                                          class="w-6 h-6 object-contain"
                                        />
                                      </a>
                                    )}
                                    {hasSha256(chart) && (
                                      <a
                                        class="w-[36px] h-[36px] border-none rounded-full text-[1.2rem] cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center p-0 overflow-hidden no-underline text-inherit bg-[linear-gradient(135deg,#00bcd4,#0097a7)] text-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 hover:bg-[linear-gradient(135deg,#4dd0e1,#00bcd4)]"
                                        href={getBmsLinks(chart).minir}
                                        title={getBmsLinks(chart).minir}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <img
                                          src="/assets/logo/minir_logo.gif"
                                          alt="Minir"
                                          class="w-6 h-6 object-contain"
                                        />
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td class="p-4 border-b border-white/5 text-white/90 break-words min-w-[200px]">
                                  <strong>{chart.title || "未知标题"}</strong>
                                </td>
                                <td class="p-4 border-b border-white/5 text-white/90 break-words">
                                  {chart.artist || "未知艺术家"}
                                </td>
                                <td class="p-4 border-b border-white/5 text-white/90 break-words min-w-[150px] max-w-[300px]">
                                  {chart.comment || ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </>
              ),
            }}
          </ScrollSyncGroup>
        </div>
      );
    };
  },
});
