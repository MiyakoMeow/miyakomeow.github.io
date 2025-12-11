import { defineComponent, ref, onMounted, computed, reactive } from "vue";
import StarryBackground from "../components/StarryBackground";
import ChartsTableSection from "./BMSTable/ChartsTableSection";
import LevelRefTable from "./BMSTable/LevelRefTable";
import type { ChartData, DifficultyGroup } from "./BMSTable/ChartsTableSection";
import QuickActions from "../components/QuickActions";

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

export default defineComponent({
  name: "BMSTable",
  props: {
    header: {
      type: String,
      required: true,
    },
    origin_url: {
      type: String,
      required: false,
    },
  },
  setup(props) {
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

    return () => (
      <>
        <StarryBackground />
        <div class="max-w-[1500px] my-8 mx-auto p-8 bg-white/5 backdrop-blur-[10px] rounded-[20px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div class="mb-8 text-center">
            <h1
              class="text-white text-[2.5rem] font-bold mb-2 bg-clip-text text-transparent"
              style={{
                background: "linear-gradient(135deg,#667eea_0%,#764ba2_100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              }}
            >
              {pageTitle.value}
            </h1>
            {headerData.value && headerData.value.symbol && (
              <div class="text-white/70 text-[1.2rem] italic">
                难度表符号: {headerData.value.symbol}
              </div>
            )}
            <div class="text-white/70 text-[1.2rem] italic mt-2">
              使用方式：复制本网站链接（
              <button
                class="text-[#64b5f6] underline cursor-pointer bg-transparent border-0 p-0 m-0 font-medium hover:text-[#42a5f5]"
                type="button"
                onClick={copySiteUrl}
              >
                点击复制
              </button>
              ），然后在BeMusicSeeker或beatoraja中，粘贴至对应选项处。
              {copied.value && <span class="ml-2 text-[#4caf50]">已复制</span>}
            </div>
            <div class="text-white/70 text-[1.2rem] italic mt-2">
              {originUrl.value && (
                <a
                  class="text-[#64b5f6] underline cursor-pointer bg-transparent border-0 p-0 m-0 font-medium hover:text-[#42a5f5]"
                  href={originUrl.value}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  原链接
                </a>
              )}
              {originUrl.value && props.header && <span class="mx-2"> | </span>}
              {props.header && (
                <a
                  class="text-[#64b5f6] underline cursor-pointer bg-transparent border-0 p-0 m-0 font-medium hover:text-[#42a5f5]"
                  href={props.header}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  查看header.json
                </a>
              )}
              {(props.header || originUrl.value) && dataFetchUrl.value && (
                <span class="mx-2">|</span>
              )}
              {dataFetchUrl.value && (
                <a
                  class="text-[#64b5f6] underline cursor-pointer bg-transparent border-0 p-0 m-0 font-medium hover:text-[#42a5f5]"
                  href={dataFetchUrl.value}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  查看data.json
                </a>
              )}
            </div>
          </div>
          <div class="text-white/90 text-[1.1rem] leading-[1.6] w-full">
            {/* 加载状态 */}
            {loadingState.isLoading ? (
              <div class="p-8">
                <div class="bg-black/20 rounded-[15px] p-8 border border-white/10">
                  <div class="flex justify-between items-center mb-6">
                    <h3 class="text-white m-0 text-[1.5rem]">正在加载BMS难度表数据...</h3>
                    <div class="bg-[#64b5f6]/20 text-[#64b5f6] px-4 py-2 rounded-[20px] font-bold text-[1.2rem]">
                      {Math.round(loadingState.progress)}%
                    </div>
                  </div>
                  <div class="h-[12px] bg-white/10 rounded-[6px] overflow-hidden mb-6">
                    <div
                      class="h-full rounded-[6px]"
                      style={{
                        width: `${loadingState.progress}%`,
                        background: "linear-gradient(90deg,#4caf50,#64b5f6)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                      <span class="text-white/60 text-[0.9rem]">当前步骤:</span>
                      <span class="text-white font-medium">{loadingState.currentStep}</span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <span class="text-white/60 text-[0.9rem]">总步骤数:</span>
                      <span class="text-white font-medium">{loadingState.totalSteps}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : error.value ? (
              <div class="text-center p-12">
                <div class="text-[4rem] mb-4">⚠️</div>
                <h3 class="text-[#ff6b6b] mb-4">加载失败</h3>
                <p class="bg-[rgba(255,107,107,0.1)] p-4 rounded-[10px] my-6 border-l-[4px] border-[#ff6b6b]">
                  {error.value}
                </p>
                <p>请检查网络连接或稍后重试。</p>
                <button
                  class="bg-[#64b5f6] text-white border-none px-8 py-3 rounded-[25px] text-[1rem] font-semibold cursor-pointer mt-4 transition-colors duration-300 ease-in-out hover:bg-[#42a5f5]"
                  onClick={lazyLoadTableData}
                >
                  重新加载
                </button>
              </div>
            ) : (
              <div class="py-4">
                {/* 表格信息 */}
                <div class="grid grid-cols-2 gap-8 mb-8 p-6 bg-black/20 rounded-[15px]">
                  <div>
                    <h2 class="text-white mt-0 mb-4">难度表信息</h2>
                    <div>
                      {headerData.value && (
                        <p class="my-2 text-white/80">
                          <strong class="text-[#64b5f6]">难度表名称:</strong>
                          {headerData.value.name || "未命名"}
                        </p>
                      )}
                      {headerData.value && (
                        <p class="my-2 text-white/80">
                          <strong class="text-[#64b5f6]">难度表符号:</strong>
                          {headerData.value.symbol || "未定义"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 class="text-white mt-0 mb-4">统计摘要</h3>
                    <div class="grid grid-cols-3 gap-4">
                      <div class="bg-white/5 rounded-[10px] p-4 text-center border border-white/10">
                        <div class="text-[2rem] font-bold text-[#64b5f6] mb-2">
                          {tableStats.value.totalCharts}
                        </div>
                        <div class="text-white/70 text-[0.9rem]">总谱面数</div>
                      </div>
                      <div class="bg-white/5 rounded-[10px] p-4 text-center border border-white/10">
                        <div class="text-[2rem] font-bold text-[#64b5f6] mb-2">
                          {tableStats.value.difficulties.length}
                        </div>
                        <div class="text-white/70 text-[0.9rem]">难度等级数</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 难度对照表 */}
                <LevelRefTable header-url={props.header} />

                {/* 按难度分组的谱面表格 */}
                {sortedDifficultyGroups.value.length > 0 ? (
                  <ChartsTableSection
                    groups={sortedDifficultyGroups.value}
                    totalCharts={tableData.value?.length || 0}
                    levelOrder={(headerData.value?.level_order as string[]) || []}
                  />
                ) : (
                  <div class="text-center p-12">
                    <div class="text-[4rem] mb-4">📊</div>
                    <h3 class="text-white mb-4">暂无谱面数据</h3>
                    <p class="text-white/70">难度表中没有找到谱面数据。</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <QuickActions />
      </>
    );
  },
});
