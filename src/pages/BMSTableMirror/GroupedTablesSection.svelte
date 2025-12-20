<script lang="ts">
  interface MirrorTableItem {
    name: string;
    symbol?: string;
    url: string;
    url_ori?: string;
    comment?: string;
    tag1?: string;
    tag2?: string;
    tag_order?: string | number;
    dir_name?: string;
  }

  interface Tag2Group {
    tag2: string;
    items: MirrorTableItem[];
  }

  interface Tag1Group {
    tag1: string;
    order: number;
    subgroups: Tag2Group[];
  }

  enum CheckboxState {
    Unchecked,
    Indeterminate,
    Checked,
  }

  export let groups: Tag1Group[] = [];
  export let selectedMap: Record<string, boolean> = {};

  function slugifyTag(tag: string): string {
    return tag
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-");
  }

  function scrollToTag1(tag1: string): void {
    const id = `tag1-group-${slugifyTag(tag1)}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function scrollToTag2(tag1: string, tag2: string): void {
    const id = `tag2-group-${slugifyTag(tag1)}-${slugifyTag(tag2)}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function getTag1Urls(g: Tag1Group): string[] {
    const urls: string[] = [];
    for (const sg of g.subgroups) {
      for (const item of sg.items) {
        urls.push(item.url);
      }
    }
    return urls;
  }

  function getTag2Urls(sg: Tag2Group): string[] {
    return sg.items.map((item) => item.url);
  }

  function aggregateCheckboxState(urls: string[]): CheckboxState {
    if (urls.length === 0) return CheckboxState.Unchecked;
    let selected = 0;
    for (const u of urls) if (selectedMap[u]) selected++;
    if (selected === 0) return CheckboxState.Unchecked;
    if (selected === urls.length) return CheckboxState.Checked;
    return CheckboxState.Indeterminate;
  }

  function tag1State(g: Tag1Group): CheckboxState {
    return aggregateCheckboxState(getTag1Urls(g));
  }

  function tag2State(sg: Tag2Group): CheckboxState {
    return aggregateCheckboxState(getTag2Urls(sg));
  }

  function onTag1Change(checked: boolean, g: Tag1Group): void {
    const next = { ...selectedMap };
    for (const url of getTag1Urls(g)) {
      next[url] = checked;
    }
    selectedMap = next;
  }

  function onTag2Change(checked: boolean, sg: Tag2Group): void {
    const next = { ...selectedMap };
    for (const url of getTag2Urls(sg)) {
      next[url] = checked;
    }
    selectedMap = next;
  }

  function onRowChange(checked: boolean, url: string): void {
    selectedMap = { ...selectedMap, [url]: checked };
  }

  let isSyncing = false;
  let rafId: number | null = null;
  const scrollContainers = new Set<HTMLDivElement>();

  function handleScroll(e: Event): void {
    if (isSyncing) return;
    const target = e.currentTarget;
    if (!(target instanceof HTMLDivElement)) return;

    const left = target.scrollLeft;
    isSyncing = true;
    for (const el of scrollContainers) {
      if (el !== target) {
        el.scrollLeft = left;
      }
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      isSyncing = false;
    });
  }

  function scrollSync(node: HTMLDivElement) {
    scrollContainers.add(node);
    node.addEventListener("scroll", handleScroll, { passive: true });
    return {
      destroy() {
        scrollContainers.delete(node);
        node.removeEventListener("scroll", handleScroll);
      },
    };
  }

  function indeterminate(node: HTMLInputElement, value: boolean) {
    node.indeterminate = !!value;
    return {
      update(v: boolean) {
        node.indeterminate = !!v;
      },
    };
  }
</script>

{#if groups.length === 0}
  <div class="p-12 text-center">
    <div class="mb-4 text-[4rem]">📊</div>
    <h3 class="mb-4 text-white">暂无镜像数据</h3>
    <p class="text-white/70">未找到镜像列表。</p>
  </div>
{:else}
  <div class="mt-8">
    <div class="mt-6 mb-8">
      {#each groups as g (g.tag1)}
        <div class="mb-4">
          <button
            class="mr-3 cursor-pointer rounded-[18px] bg-white/10 px-4 py-2 font-bold text-white opacity-80 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            type="button"
            on:click={() => scrollToTag1(g.tag1)}
          >
            {g.tag1}
          </button>
          <div class="mt-2 flex flex-wrap gap-2">
            {#each g.subgroups as sg (sg.tag2)}
              <button
                class="cursor-pointer rounded-[18px] bg-white/10 px-4 py-2 font-bold text-white opacity-80 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                type="button"
                on:click={() => scrollToTag2(g.tag1, sg.tag2)}
              >
                {sg.tag2}
                <span class="rounded-[10px] bg-black/20 px-2 py-[0.1rem] text-[0.9rem] opacity-90">
                  ({sg.items.length})
                </span>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    {#each groups as g (g.tag1)}
      <div id={`tag1-group-${slugifyTag(g.tag1)}`} class="mb-12 scroll-mt-[20px]">
        <div class="mb-6 border-b-2 border-white/10 pb-4">
          <div class="flex items-center gap-4">
            <input
              type="checkbox"
              class="h-[22px] w-[22px] scale-[1.2]"
              use:indeterminate={tag1State(g) === CheckboxState.Indeterminate}
              checked={tag1State(g) === CheckboxState.Checked}
              on:change={(e) => onTag1Change((e.currentTarget as HTMLInputElement).checked, g)}
            />
            <span
              class="rounded-[20px] bg-[rgba(100,181,246,0.3)] px-6 py-2 text-[1.2rem] font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
            >
              分类 {g.tag1}
            </span>
          </div>
        </div>

        {#each g.subgroups as sg (sg.tag2)}
          <div id={`tag2-group-${slugifyTag(g.tag1)}-${slugifyTag(sg.tag2)}`} class="mt-4">
            <h3 class="mt-2 mb-2 flex items-center gap-2 text-[1.1rem] text-white">
              <input
                type="checkbox"
                class="h-[22px] w-[22px] scale-[1.2]"
                use:indeterminate={tag2State(sg) === CheckboxState.Indeterminate}
                checked={tag2State(sg) === CheckboxState.Checked}
                on:change={(e) => onTag2Change((e.currentTarget as HTMLInputElement).checked, sg)}
              />
              {sg.tag2}
            </h3>
            <div
              class="overflow-x-auto rounded-[10px] border border-white/10 bg-black/20"
              use:scrollSync
            >
              <table class="w-full min-w-[800px] table-fixed border-collapse">
                <colgroup>
                  <col class="w-[60px]" />
                  <col class="w-[120px]" />
                  <col class="w-[320px]" />
                  <col class="w-[160px]" />
                  <col class="w-[160px]" />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                    >
                      选择
                    </th>
                    <th
                      class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                    >
                      符号
                    </th>
                    <th
                      class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                    >
                      名称
                    </th>
                    <th
                      class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                    >
                      镜像
                    </th>
                    <th
                      class="border-b-2 border-white/10 bg-[rgba(100,181,246,0.2)] p-4 text-left font-semibold text-white"
                    >
                      原链接
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#each sg.items as item (item.url)}
                    <tr class="hover:bg-white/5 last:[&>td]:border-b-0">
                      <td class="border-b border-white/5 p-4 break-words text-white/90">
                        <input
                          type="checkbox"
                          class="h-[22px] w-[22px] scale-[1.2]"
                          checked={!!selectedMap[item.url]}
                          on:change={(e) =>
                            onRowChange((e.currentTarget as HTMLInputElement).checked, item.url)}
                        />
                      </td>
                      <td class="border-b border-white/5 p-4 break-words text-white/90">
                        {item.symbol || ""}
                      </td>
                      <td
                        class="min-w-[200px] border-b border-white/5 p-4 break-words text-white/90"
                      >
                        <strong>{item.name}</strong>
                      </td>
                      <td
                        class="min-w-[130px] border-b border-white/5 p-4 break-words text-white/90"
                      >
                        <a
                          class="flex min-w-[60px] cursor-pointer items-center justify-center gap-[0.2rem] rounded-[6px] border-none bg-[linear-gradient(135deg,#2196f3,#1565c0)] px-[0.5rem] py-[0.35rem] text-[0.85rem] font-semibold text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#42a5f5,#1976d2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
                          href={item.url}
                          title={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          镜像
                        </a>
                      </td>
                      <td
                        class="min-w-[130px] border-b border-white/5 p-4 break-words text-white/90"
                      >
                        {#if item.url_ori}
                          <a
                            class="flex min-w-[60px] cursor-pointer items-center justify-center gap-[0.2rem] rounded-[6px] border-none bg-[linear-gradient(135deg,#ff9800,#f57c00)] px-[0.5rem] py-[0.35rem] text-[0.85rem] font-semibold text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#ffb74d,#ff9800)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
                            href={item.url_ori}
                            title={item.url_ori}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            原链接
                          </a>
                        {:else}
                          <span class="text-white/50">无</span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
{/if}
