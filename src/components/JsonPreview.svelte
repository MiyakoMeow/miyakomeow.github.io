<script lang="ts">
  import { tick } from "svelte";

  import {
    jsonPreviewCancelHide,
    jsonPreviewHideNow,
    jsonPreviewScheduleHide,
    jsonPreviewSetFrozen,
    jsonPreviewState,
  } from "./jsonPreview";

  let popoverEl: HTMLDivElement | undefined;
  let popoverStyle = "";
  let wasOpen = false;

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

  $: state = $jsonPreviewState;
  $: jsonText = safeStringify(state.value, 2);

  function updatePositionAtPointer(clientX: number, clientY: number): void {
    if (!state.open) return;
    if (!popoverEl) return;

    const margin = 12;
    const offset = 18;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const popRect = popoverEl.getBoundingClientRect();

    let left = clientX + offset;
    if (left + popRect.width + margin > viewportW) {
      left = clientX - offset - popRect.width;
    }
    left = Math.max(margin, Math.min(left, viewportW - popRect.width - margin));

    let top = clientY + offset;
    if (top + popRect.height + margin > viewportH) {
      top = clientY - offset - popRect.height;
    }
    top = Math.max(margin, Math.min(top, viewportH - popRect.height - margin));

    popoverStyle = `left:${left}px;top:${top}px;max-height:${state.maxHeightRem}rem;`;
  }

  $: if (state.open && popoverEl) updatePositionAtPointer(state.x, state.y);

  $: if (state.open && !wasOpen) {
    wasOpen = true;
    void tick().then(() => updatePositionAtPointer(state.x, state.y));
  }

  $: if (!state.open && wasOpen) {
    wasOpen = false;
    popoverStyle = "";
  }

  async function copyJson(): Promise<void> {
    const text = jsonText;
    if (state.onCopy) {
      await state.onCopy(text);
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
</script>

<svelte:window
  on:keydown={(event) => {
    if (!state.open) return;
    if (event.key === "Escape") jsonPreviewHideNow();
  }}
/>

{#if state.open}
  <div
    bind:this={popoverEl}
    class="fixed z-2000 w-[min(44rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm"
    style={popoverStyle}
    on:pointerenter={() => {
      jsonPreviewCancelHide();
      jsonPreviewSetFrozen(true);
    }}
    on:pointerleave={() => {
      jsonPreviewSetFrozen(false);
      jsonPreviewScheduleHide();
    }}
  >
    <div class="flex items-center justify-between gap-3 border-b border-white/10 p-3">
      <div class="text-[0.9rem] font-semibold text-white/90">{state.label}</div>
      <div class="flex gap-2">
        <button
          class="cursor-pointer rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[0.85rem] font-semibold text-white transition-all duration-200 ease-in-out hover:bg-white/15"
          type="button"
          on:click={copyJson}
        >
          复制
        </button>
        <button
          class="cursor-pointer rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[0.85rem] font-semibold text-white transition-all duration-200 ease-in-out hover:bg-white/15"
          type="button"
          on:click={jsonPreviewHideNow}
        >
          关闭
        </button>
      </div>
    </div>
    <pre class="overflow-auto bg-black/20 p-3 font-mono text-[0.8rem] leading-relaxed text-white/90"><code>{jsonText}</code></pre>
  </div>
{/if}
