<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  type TocItem = {
    id: string;
    title: string;
    href?: string;
    children?: TocItem[];
  };

  type FlatTocItem = {
    id: string;
    title: string;
    href: string;
    depth: number;
  };

  export let items: TocItem[] = [];
  export let title: string = "目录";
  export let minLevel: number = 2;
  export let maxLevel: number = 6;
  export let startOpen: boolean = false;

  let open = startOpen;
  let activeId: string | null = null;
  let autoItems: TocItem[] = [];
  let mutationObserver: MutationObserver | null = null;
  let scheduled = false;
  let scrollScheduled = false;

  $: resolvedItems = items.length > 0 ? items : autoItems;
  $: flatItems = flattenItems(resolvedItems);

  function slugifyHeadingText(input: string): string {
    const normalized = input
      .trim()
      .replace(/\s+/g, " ")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const slug = normalized
      .replace(/[^a-z0-9\u4e00-\u9fff _-]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "");

    return slug || "section";
  }

  function flattenItems(source: TocItem[]): FlatTocItem[] {
    const out: FlatTocItem[] = [];
    const walk = (nodes: TocItem[], depth: number) => {
      for (const node of nodes) {
        const href = node.href?.trim() ? node.href.trim() : `#${node.id}`;
        out.push({ id: node.id, title: node.title, href, depth });
        if (node.children && node.children.length > 0) walk(node.children, depth + 1);
      }
    };
    walk(source, 0);
    return out;
  }

  function buildAutoItems(): void {
    const root = (document.querySelector("main") as HTMLElement | null) ?? document.body;
    const headings = Array.from(root.querySelectorAll("h1,h2,h3,h4,h5,h6")).filter((el) => {
      if (!(el instanceof HTMLHeadingElement)) return false;
      const level = Number(el.tagName.slice(1));
      return level >= minLevel && level <= maxLevel;
    }) as HTMLHeadingElement[];

    const usedIds = new Map<string, number>();
    const headingInfo = headings
      .map((h) => {
        const text = (h.textContent ?? "").trim();
        if (!text) return null;
        const level = Number(h.tagName.slice(1));

        let baseId = h.id?.trim() || slugifyHeadingText(text);
        const currentCount = usedIds.get(baseId) ?? 0;
        usedIds.set(baseId, currentCount + 1);

        if (!h.id?.trim()) {
          h.id = currentCount === 0 ? baseId : `${baseId}-${currentCount + 1}`;
        } else if (currentCount > 0) {
          baseId = h.id.trim();
        }

        return { id: h.id, title: text, level };
      })
      .filter((v): v is { id: string; title: string; level: number } => v !== null);

    const rootItems: Array<TocItem & { level: number }> = [];
    const stack: Array<{ level: number; children: Array<TocItem & { level: number }> }> = [
      { level: minLevel - 1, children: rootItems },
    ];

    for (const h of headingInfo) {
      while (stack.length > 0 && h.level <= stack[stack.length - 1].level) {
        stack.pop();
      }
      const parent = stack[stack.length - 1] ?? { level: minLevel - 1, children: rootItems };
      const node: TocItem & { level: number } = {
        id: h.id,
        title: h.title,
        level: h.level,
        children: [],
      };
      parent.children.push(node);
      stack.push({ level: h.level, children: node.children as Array<TocItem & { level: number }> });
    }

    const stripLevel = (nodes: Array<TocItem & { level: number }>): TocItem[] =>
      nodes.map((n) => ({
        id: n.id,
        title: n.title,
        ...(n.children && n.children.length > 0
          ? { children: stripLevel(n.children as Array<TocItem & { level: number }>) }
          : {}),
      }));

    autoItems = stripLevel(rootItems);
  }

  function scheduleBuildAutoItems(): void {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      buildAutoItems();
      scheduleUpdateActive();
    });
  }

  function updateActive(): void {
    const list = flatItems;
    if (list.length === 0) {
      activeId = null;
      return;
    }

    const offset = 120;
    let current: string | null = null;
    for (const item of list) {
      const id = item.href.startsWith("#") ? item.href.slice(1) : item.id;
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top - offset <= 0) current = id;
    }

    activeId =
      current ?? (list[0]?.href.startsWith("#") ? list[0].href.slice(1) : (list[0]?.id ?? null));
  }

  function scheduleUpdateActive(): void {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      updateActive();
    });
  }

  function onScrollOrResize(): void {
    scheduleUpdateActive();
  }

  function isSmallScreen(): boolean {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function onNavigate(item: FlatTocItem, event: MouseEvent): void {
    if (!item.href.startsWith("#")) return;
    event.preventDefault();

    const id = decodeURIComponent(item.href.slice(1));
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);

    if (isSmallScreen()) open = false;
  }

  onMount(() => {
    scheduleBuildAutoItems();

    const root = (document.querySelector("main") as HTMLElement | null) ?? document.body;
    mutationObserver = new MutationObserver(() => scheduleBuildAutoItems());
    mutationObserver.observe(root, { childList: true, subtree: true });

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("hashchange", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("hashchange", onScrollOrResize);
    };
  });

  onDestroy(() => {
    mutationObserver?.disconnect();
    mutationObserver = null;
  });
</script>

{#if flatItems.length > 0}
  <div class="fixed top-4 right-4 z-1000 flex flex-col items-end gap-3">
    <button
      class="flex size-14 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all hover:bg-white/25"
      type="button"
      aria-label={open ? "关闭目录" : "打开目录"}
      title={open ? "关闭目录" : "打开目录"}
      on:click={() => (open = !open)}
    >
      {#if open}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-9" fill="none">
          <path d="M7 7l10 10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
          <path d="M17 7L7 17" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-9" fill="currentColor">
          <path d="M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
      {/if}
    </button>

    {#if open}
      <div
        class="w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/25 bg-white/15 p-4 text-white shadow-[0_10px_28px_rgba(0,0,0,0.28)] backdrop-blur-sm"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <div class="text-[0.95rem] font-semibold text-white/90">{title}</div>
          <div class="text-[0.8rem] text-white/60">{flatItems.length}</div>
        </div>

        <nav class="max-h-[60vh] overflow-auto pr-1">
          {#each flatItems as item (item.id)}
            <a
              href={item.href}
              class={[
                "block rounded-lg py-2 pr-3 text-[0.9rem] leading-snug transition-colors",
                activeId === (item.href.startsWith("#") ? item.href.slice(1) : item.id)
                  ? "bg-white/10 text-sky-200"
                  : "text-white/85 hover:bg-white/8 hover:text-white",
              ].join(" ")}
              style={`padding-left: ${12 + item.depth * 14}px;`}
              on:click={(e) => onNavigate(item, e)}
            >
              {item.title}
            </a>
          {/each}
        </nav>
      </div>
    {/if}
  </div>
{/if}
