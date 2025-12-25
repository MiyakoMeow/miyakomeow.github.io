<script lang="ts">
  import JsonPreview from "../../components/JsonPreview.svelte";
  import { jsonPreviewMove, jsonPreviewScheduleHide, jsonPreviewShow } from "../../components/jsonPreview";
  import { cubicIn, cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  interface MirrorTableItem {
    url: string;
    url_ori?: string;
  }

  export let tables: MirrorTableItem[] = [];
  export let selectedMap: Record<string, boolean> = {};
  export let copySelected: (data: string) => Promise<void>;

  $: totalCount = tables.length;
  $: selectedCount = Object.values(selectedMap).filter(Boolean).length;

  $: selectedMirrorArray = Object.entries(selectedMap)
    .filter(([, v]) => !!v)
    .map(([url]) => new URL(url, window.location.origin).toString());

  $: urlToOrigin = (() => {
    const m = new Map<string, string>();
    for (const t of tables) {
      if (t.url) m.set(t.url, t.url_ori || "");
    }
    return m;
  })();

  $: selectedOriginArray = selectedMirrorArray
    .map((u) => urlToOrigin.get(u) || "")
    .filter((v) => v.length > 0);
</script>

{#if selectedCount > 0}
  <div
    class="fixed bottom-4 left-1/2 z-999 max-w-[calc(100vw-2rem)] translate-x-[-50%] overflow-x-auto"
    in:fly={{ y: 24, opacity: 0, duration: 180, easing: cubicOut }}
    out:fly={{ y: 24, opacity: 0, duration: 140, easing: cubicIn }}
  >
    <div
      class="flex w-max flex-nowrap items-center gap-4 rounded-xl border border-white/20 bg-white/10 p-3 px-4 shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-[6px]"
    >
      <div class="font-semibold whitespace-nowrap text-white">
        已选中 {selectedCount} / {totalCount}
      </div>
      <div class="flex flex-nowrap gap-3">
        <button
          class="cursor-pointer rounded-lg border-none bg-[linear-gradient(135deg,#2196f3,#1565c0)] px-[0.8rem] py-2 text-[0.9rem] font-semibold text-white transition-all duration-200 ease-in-out"
          type="button"
          on:click={() => copySelected(JSON.stringify(selectedMirrorArray, null, 2))}
          on:pointerenter={(event) => {
            jsonPreviewShow(
              { value: selectedMirrorArray, label: "镜像链接 JSON", maxHeightRem: 14, onCopy: copySelected },
              event.clientX,
              event.clientY
            );
          }}
          on:pointermove={(event) => jsonPreviewMove(event.clientX, event.clientY)}
          on:pointerleave={jsonPreviewScheduleHide}
        >
          复制镜像链接
        </button>
        <button
          class="cursor-pointer rounded-lg border-none bg-[linear-gradient(135deg,#ff9800,#f57c00)] px-[0.8rem] py-2 text-[0.9rem] font-semibold text-white transition-all duration-200 ease-in-out"
          type="button"
          on:click={() => copySelected(JSON.stringify(selectedOriginArray, null, 2))}
          on:pointerenter={(event) => {
            jsonPreviewShow(
              { value: selectedOriginArray, label: "原链接 JSON", maxHeightRem: 14, onCopy: copySelected },
              event.clientX,
              event.clientY
            );
          }}
          on:pointermove={(event) => jsonPreviewMove(event.clientX, event.clientY)}
          on:pointerleave={jsonPreviewScheduleHide}
        >
          复制原链接
        </button>
      </div>
    </div>
  </div>
{/if}

<JsonPreview />
