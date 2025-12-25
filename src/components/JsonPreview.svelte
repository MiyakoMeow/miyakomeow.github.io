<script lang="ts">
  import { jsonPreviewCancelHide, jsonPreviewHideAllNow, jsonPreviewHideNow, jsonPreviewStore, jsonPreviewScheduleHide } from "./jsonPreview";

  function safeStringify(input: unknown, space = 2): string {
    const seen = new WeakSet<object>();
    try {
      return JSON.stringify(
        input,
        (_key, v) => {
          if (typeof v === "bigint") return v.toString();
          if (typeof v === "object" && v !== null) {
            if (seen.has(v)) return "[Circular]";
            seen.add(v);
          }
          return v;
        },
        space
      );
    } catch {
      try {
        return String(input);
      } catch {
        return "[Unserializable]";
      }
    }
  }

  async function copyText(
    text: string,
    onCopy: ((text: string) => Promise<void> | void) | undefined
  ): Promise<void> {
    if (onCopy) {
      await onCopy(text);
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {}

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      await navigator.clipboard.writeText(textarea.value);
    } catch {}
    document.body.removeChild(textarea);
  }

  function positionPopover(
    node: HTMLDivElement,
    params: { x: number; y: number; open: boolean }
  ): { update: (next: typeof params) => void; destroy: () => void } {
    let raf: number | undefined;

    const apply = (p: typeof params) => {
      if (!p.open) return;
      const margin = 12;
      const offset = 18;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const popRect = node.getBoundingClientRect();

      let left = p.x + offset;
      if (left + popRect.width + margin > viewportW) {
        left = p.x - offset - popRect.width;
      }
      left = Math.max(margin, Math.min(left, viewportW - popRect.width - margin));

      let top = p.y + offset;
      if (top + popRect.height + margin > viewportH) {
        top = p.y - offset - popRect.height;
      }
      top = Math.max(margin, Math.min(top, viewportH - popRect.height - margin));

      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
    };

    const schedule = () => {
      if (typeof raf === "number") cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => apply(params));
    };

    schedule();

    return {
      update(next) {
        params = next;
        schedule();
      },
      destroy() {
        if (typeof raf === "number") cancelAnimationFrame(raf);
      },
    };
  }
</script>

<svelte:window
  on:keydown={(event) => {
    if (event.key === "Escape") jsonPreviewHideAllNow();
  }}
/>

{#each $jsonPreviewStore as preview (preview.id)}
  {#if preview.open}
    {@const jsonText = safeStringify(preview.value, 2)}
    <div
      use:positionPopover={{ x: preview.x, y: preview.y, open: preview.open }}
      class="fixed z-2000 w-[min(44rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm"
      on:pointerenter={() => jsonPreviewCancelHide(preview.id)}
      on:pointerleave={() => jsonPreviewScheduleHide(preview.id)}
    >
      <div class="flex items-center justify-between gap-3 border-b border-white/10 p-3">
        <div class="text-[0.9rem] font-semibold text-white/90">{preview.label}</div>
        <div class="flex gap-2">
          <button
            class="cursor-pointer rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[0.85rem] font-semibold text-white transition-all duration-200 ease-in-out hover:bg-white/15"
            type="button"
            on:click={() => copyText(jsonText, preview.onCopy)}
          >
            复制
          </button>
          <button
            class="cursor-pointer rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[0.85rem] font-semibold text-white transition-all duration-200 ease-in-out hover:bg-white/15"
            type="button"
            on:click={() => jsonPreviewHideNow(preview.id)}
          >
            关闭
          </button>
        </div>
      </div>
      <pre
        class="overflow-auto bg-black/20 p-3 font-mono text-[0.8rem] leading-relaxed text-white/90"
        style={`max-height:${preview.maxHeightRem}rem;`}
      ><code>{jsonText}</code></pre>
    </div>
  {/if}
{/each}
