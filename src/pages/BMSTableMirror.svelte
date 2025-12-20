<script lang="ts">
  import { onMount } from "svelte";
  import BlogLayout from "@/layout/BlogLayout.svelte";
  import GroupedTablesSection from "./BMSTableMirror/GroupedTablesSection.svelte";
  import QuickActions from "@/components/QuickActions.svelte";
  import "@/styles/main.css";

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

  interface LinkItem {
    href: string;
    title: string;
    desc: string;
  }

  let loading = true;
  let error: string | null = null;

  let copied = false;
  const tablesJsonPath = new URL(
    "/bms/table-mirror/tables.json",
    window.location.origin
  ).toString();

  let tables: MirrorTableItem[] = [];
  let selectedMap: Record<string, boolean> = {};

  const links: LinkItem[] = [
    { href: "/bms", title: "返回 BMS", desc: "返回 BMS 页面" },
    {
      href: "https://github.com/MiyakoMeow/bms-table-mirror",
      title: "镜像仓库",
      desc: "查看镜像项目",
    },
  ];

  async function copySelected(data: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(data);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = data;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        await navigator.clipboard.writeText(textarea.value);
        document.body.removeChild(textarea);
      }
    } catch {}
  }

  async function copyTables(): Promise<void> {
    await copySelected(tablesJsonPath);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1500);
  }

  $: selectedCount = Object.values(selectedMap).filter(Boolean).length;
  $: totalCount = tables.length;

  $: selectedMirrorArray = Object.entries(selectedMap)
    .filter(([, v]) => !!v)
    .map(([url]) => url);

  $: urlToOrigin = (() => {
    const m = new Map<string, string>();
    tables.forEach((t) => {
      if (t.url) {
        m.set(t.url, t.url_ori || "");
      }
    });
    return m;
  })();

  $: selectedOriginArray = selectedMirrorArray
    .map((u) => urlToOrigin.get(u) || "")
    .filter((v) => v.length > 0);

  $: tooltipMirror = JSON.stringify(selectedMirrorArray, null, 2);
  $: tooltipOrigin = JSON.stringify(selectedOriginArray, null, 2);

  $: groupedByTags = (() => {
    const groupsMap = new Map<string, { order: number; tag2Map: Map<string, MirrorTableItem[]> }>();

    tables.forEach((item) => {
      const tag1 = item.tag1 || "未分类";
      const tag2 = item.tag2 || "其它";
      const orderRaw = item.tag_order;
      const order =
        typeof orderRaw === "number" ? orderRaw : parseInt(String(orderRaw || "999"), 10);

      if (!groupsMap.has(tag1)) {
        groupsMap.set(tag1, { order, tag2Map: new Map<string, MirrorTableItem[]>() });
      } else {
        const existing = groupsMap.get(tag1)!;
        existing.order = Math.min(existing.order, isNaN(order) ? 999 : order);
      }

      const tag2Map = groupsMap.get(tag1)!.tag2Map;
      if (!tag2Map.has(tag2)) {
        tag2Map.set(tag2, []);
      }

      tag2Map.get(tag2)!.push(item);
    });

    const tag1Groups: Tag1Group[] = Array.from(groupsMap.entries()).map(
      ([tag1, { order, tag2Map }]) => {
        const subgroups: Tag2Group[] = Array.from(tag2Map.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([tag2, items]) => ({
            tag2,
            items: items.sort((x, y) => (x.name || "").localeCompare(y.name || "")),
          }));
        return { tag1, order: isNaN(order) ? 999 : order, subgroups };
      }
    );

    tag1Groups.sort((a, b) => a.order - b.order || a.tag1.localeCompare(b.tag1));
    return tag1Groups;
  })();

  async function loadTablesJson(): Promise<void> {
    try {
      const url = new URL("/bms/table-mirror/tables.json", window.location.origin).toString();
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        throw new Error(`无法加载tables.json: ${res.status}`);
      }
      const data = (await res.json()) as unknown;
      if (!Array.isArray(data)) {
        throw new Error("tables.json 格式错误：不是数组");
      }

      tables = (data as MirrorTableItem[]).map((item) => {
        const dir = String(item.dir_name || "").replace(/^\/+|\/+$/g, "");
        if (!dir) return item;
        return { ...item, url: `/bms/table-mirror/${dir}/` };
      });
      error = null;
    } catch (e) {
      error = e instanceof Error ? e.message : "未知错误";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    setTimeout(() => {
      loadTablesJson();
    }, 250);
  });
</script>

<BlogLayout>
  <section class="glass-container bms-index-container">
    <h1 class="content-title">BMS 难度表镜像</h1>

    <div class="page-subtitle usage-subtitle">
      对于BeMusicSeeker用户，可以使用tables.json链接（
      <button class="copy-action" type="button" on:click={copyTables}>点击复制</button>
      ），导入难度表清单至BeMusicSeeker。
      <a
        class="copy-action"
        href="https://darksabun.club/table/tablelist.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        使用教程
      </a>
      {#if copied}
        <span class="copy-feedback">已复制</span>
      {/if}
    </div>

    <div class="links-grid">
      {#each links as link (link.href)}
        <a class="link-card" href={link.href}>
          <div class="link-title">{link.title}</div>
          <div class="link-desc">{link.desc}</div>
        </a>
      {/each}
    </div>

    {#if loading}
      <div class="loading-section">正在加载镜像列表...</div>
    {:else if error}
      <div class="error-section">加载失败：{error}</div>
    {:else}
      <GroupedTablesSection bind:selectedMap groups={groupedByTags} />
    {/if}
  </section>
</BlogLayout>

{#if selectedCount > 0}
  <div class="selection-float">
    <div class="selection-content">
      <div class="selection-summary">已选中 {selectedCount} / {totalCount}</div>
      <div class="selection-actions">
        <button
          class="copy-button mirror-copy"
          type="button"
          title={tooltipMirror}
          on:click={() => copySelected(JSON.stringify(selectedMirrorArray, null, 2))}
        >
          复制镜像链接
        </button>
        <button
          class="copy-button origin-copy"
          type="button"
          title={tooltipOrigin}
          on:click={() => copySelected(JSON.stringify(selectedOriginArray, null, 2))}
        >
          复制原链接
        </button>
      </div>
    </div>
  </div>
{/if}
<QuickActions />

<style>
  @config "../../tailwind.config.mjs";
  @reference "tailwindcss";

  .glass-container {
    @apply mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px];
  }

  .links-grid {
    @apply mt-4 grid grid-cols-[repeat(2,minmax(240px,1fr))] gap-4;
    .link-card {
      @apply block rounded-[14px] border border-white/10 bg-black/20 p-[1.25rem] text-white no-underline;
      transition:
        transform 0.15s ease,
        background 0.3s ease;
      &:hover {
        @apply bg-[rgba(255,255,255,0.06)];
        transform: translateY(-2px);
      }
    }
    .link-title {
      @apply mb-[0.5rem] text-[1.2rem] font-bold text-[#64b5f6];
    }
    .link-desc {
      @apply text-[0.95rem] text-white/80;
    }
  }

  .loading-section {
    @apply mt-6 text-white/80;
  }

  .error-section {
    @apply mt-6 text-red-300;
  }

  .page-subtitle {
    @apply text-[1.1rem] text-white/70 italic;
    .copy-action {
      @apply m-0 cursor-pointer border-0 bg-transparent p-0 font-medium text-[#64b5f6] underline;
      &:hover {
        @apply text-[#42a5f5];
      }
    }
    .copy-feedback {
      @apply ml-2 text-[#4caf50];
    }
  }

  .usage-subtitle {
    @apply mt-2;
  }

  .selection-float {
    @apply fixed bottom-4 left-1/2 z-[999] translate-x-[-50%];
    .selection-content {
      @apply flex items-center gap-4 rounded-[12px] border border-white/20 bg-white/10 p-3 px-4 shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-[6px];
      .selection-summary {
        @apply font-semibold text-white;
      }
      .selection-actions {
        @apply flex gap-3;
        .copy-button {
          @apply cursor-pointer rounded-[8px] border-none px-[0.8rem] py-[0.5rem] text-[0.9rem] font-semibold text-white transition-all duration-200 ease-in-out;
        }
        .mirror-copy {
          @apply bg-[linear-gradient(135deg,#2196f3,#1565c0)];
        }
        .origin-copy {
          @apply bg-[linear-gradient(135deg,#ff9800,#f57c00)];
        }
      }
    }
  }
</style>
