<script context="module" lang="ts">
  export type TocItem = {
    id: string;
    title: string;
    href?: string;
    children?: TocItem[];
  };

  type HeadingInfo = {
    id: string;
    title: string;
    level: number;
  };

  export type BuildTocFromHeadingsOptions = {
    root?: ParentNode | null;
    minLevel?: number;
    maxLevel?: number;
  };

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

  function collectHeadingInfo(root: ParentNode, minLevel: number, maxLevel: number): HeadingInfo[] {
    const headings = Array.from(root.querySelectorAll("h1,h2,h3,h4,h5,h6")).filter((el) => {
      if (!(el instanceof HTMLHeadingElement)) return false;
      const level = Number(el.tagName.slice(1));
      return level >= minLevel && level <= maxLevel;
    }) as HTMLHeadingElement[];

    const usedIds = new Map<string, number>();
    return headings
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
      .filter((v): v is HeadingInfo => v !== null);
  }

  function buildTreeFromHeadingInfo(
    headingInfo: HeadingInfo[],
    minLevel: number
  ): Array<TocItem & { level: number }> {
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

    return rootItems;
  }

  function stripLevel(nodes: Array<TocItem & { level: number }>): TocItem[] {
    return nodes.map((n) => ({
      id: n.id,
      title: n.title,
      ...(n.children && n.children.length > 0
        ? { children: stripLevel(n.children as Array<TocItem & { level: number }>) }
        : {}),
    }));
  }

  export function buildTocFromHeadings(options: BuildTocFromHeadingsOptions = {}): TocItem[] {
    if (typeof document === "undefined") return [];

    const minLevel = options.minLevel ?? 2;
    const maxLevel = options.maxLevel ?? 6;
    const root =
      options.root ??
      (document.querySelector("main") as HTMLElement | null) ??
      (document.body as HTMLElement);

    const headingInfo = collectHeadingInfo(root, minLevel, maxLevel);
    const tree = buildTreeFromHeadingInfo(headingInfo, minLevel);
    return stripLevel(tree);
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import FloatingPanel from "./FloatingPanel.svelte";

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

  let activeId: string | null = null;
  let scrollScheduled = false;

  $: flatItems = flattenItems(items);

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

  function onNavigate(item: FlatTocItem, event: MouseEvent): void {
    if (!item.href.startsWith("#")) return;
    event.preventDefault();

    const id = decodeURIComponent(item.href.slice(1));
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  }

  onMount(() => {
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("hashchange", onScrollOrResize);

    scheduleUpdateActive();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("hashchange", onScrollOrResize);
    };
  });

  $: if (flatItems) scheduleUpdateActive();
</script>

{#if flatItems.length > 0}
  <FloatingPanel
    sessionKey="miyakomeow_floating_toc_seen"
    initiallyOpen={false}
    position="top-right"
    size="medium"
    ariaLabel="目录"
  >
    {#snippet children()}
      <div class="mb-3 flex items-center justify-between gap-3">
        <div class="text-[0.95rem] font-semibold text-white/90">{title}</div>
        <div class="text-[0.8rem] text-white/60">{flatItems.length}</div>
      </div>

      <nav class="max-h-[calc(60vh-3rem)] overflow-auto pr-1">
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
    {/snippet}
  </FloatingPanel>
{/if}
