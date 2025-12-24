<script lang="ts">
  interface LevelRefItem {
    level: string;
    ref: string;
  }

  export let headerUrl: string | undefined = undefined;

  let levelRefData: LevelRefItem[] = [];
  let shouldShow = false;

  let leftTableData: LevelRefItem[] = [];
  let rightTableData: LevelRefItem[] = [];

  let tableHalves: Array<{ id: "left" | "right"; items: LevelRefItem[] }> = [];

  $: {
    const data = levelRefData;
    const midIndex = Math.ceil(data.length / 2);
    leftTableData = data.slice(0, midIndex);
    rightTableData = data.slice(midIndex);
  }

  $: tableHalves = [
    { id: "left", items: leftTableData },
    { id: "right", items: rightTableData },
  ];

  function buildLevelRefUrl(headerUrlRaw: string): string {
    try {
      const baseUrl = new URL(headerUrlRaw, window.location.href);
      const pathParts = baseUrl.pathname.split("/");
      pathParts[pathParts.length - 1] = "level-ref.json";
      baseUrl.pathname = pathParts.join("/");
      return baseUrl.toString();
    } catch (err) {
      console.error("构建 level-ref.json URL 失败:", err);
      return "";
    }
  }

  let requestToken = 0;

  async function loadLevelRefData(header: string | undefined): Promise<void> {
    if (!header) {
      shouldShow = false;
      return;
    }

    requestToken += 1;
    const token = requestToken;

    try {
      const levelRefUrl = buildLevelRefUrl(header);
      if (!levelRefUrl) {
        shouldShow = false;
        return;
      }

      const response = await fetch(levelRefUrl);
      if (token !== requestToken) return;

      if (response.ok) {
        const data = await response.json();
        if (token !== requestToken) return;

        if (Array.isArray(data)) {
          levelRefData = data;
          shouldShow = true;
        } else {
          console.warn("level-ref.json 格式不正确，应为数组");
          shouldShow = false;
        }
      } else if (response.status === 404) {
        shouldShow = false;
      } else {
        throw new Error(`加载失败: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error("加载难度对照表数据失败:", err);
      shouldShow = false;
    }
  }

  $: void loadLevelRefData(headerUrl);
</script>

{#if shouldShow && levelRefData.length > 0}
  <div class="mt-8 mb-8 rounded-[15px] border border-white/10 bg-black/20 p-6">
    <h3 class="mt-0 mb-6 text-center text-[1.3rem] text-white">难度对照表</h3>
    <div class="flex flex-wrap items-start justify-center gap-8">
      {#each tableHalves as half (half.id)}
        <div class="min-w-[18rem] flex-1">
          <table
            class="w-full table-fixed border-collapse overflow-hidden rounded-[10px] bg-white/5"
          >
            <colgroup>
              {#each ["40%", "60%"] as w (w)}
                <col style={`width: ${w}`} />
              {/each}
            </colgroup>
            <thead>
              <tr>
                {#each ["难度等级", "对应难度"] as label (label)}
                  <th
                    class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.3)] px-4 py-3 text-left font-semibold text-white"
                    >{label}</th
                  >
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each half.items as item (item.level)}
                <tr class="hover:bg-white/5 last:[&>td]:border-b-0">
                  <td class="border-b border-white/5 px-4 py-3 text-white/90">{item.level}</td>
                  <td class="border-b border-white/5 px-4 py-3 text-white/90">{item.ref}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/each}
    </div>
  </div>
{/if}
