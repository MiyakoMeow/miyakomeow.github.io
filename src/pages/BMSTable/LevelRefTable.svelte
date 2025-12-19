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

  $: {
    const data = levelRefData;
    const midIndex = Math.ceil(data.length / 2);
    leftTableData = data.slice(0, midIndex);
    rightTableData = data.slice(midIndex);
  }

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

  async function loadLevelRefData(): Promise<void> {
    const header = headerUrl;
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
    } finally {
      if (token === requestToken) {
      }
    }
  }

  $: headerUrl, void loadLevelRefData();
</script>

{#if shouldShow && levelRefData.length > 0}
  <div class="rank-reference-section">
    <h3>难度对照表</h3>
    <div class="rank-reference-tables">
      <div class="rank-reference-left">
        <table>
          <thead>
            <tr>
              <th>难度等级</th>
              <th>对应难度</th>
            </tr>
          </thead>
          <tbody>
            {#each leftTableData as item (item.level)}
              <tr>
                <td>{item.level}</td>
                <td>{item.ref}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="rank-reference-right">
        <table>
          <thead>
            <tr>
              <th>难度等级</th>
              <th>对应难度</th>
            </tr>
          </thead>
          <tbody>
            {#each rightTableData as item (item.level)}
              <tr>
                <td>{item.level}</td>
                <td>{item.ref}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}

<style>
@reference "tailwindcss";

.rank-reference-section {
  @apply mt-8 mb-8 p-6 bg-black/20 rounded-[15px] border border-white/10;
}

.rank-reference-section {
  h3 {
    @apply text-white mt-0 mb-6 text-[1.3rem] text-center;
  }
}

.rank-reference-tables {
  @apply flex gap-8 justify-center;
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
}
</style>
