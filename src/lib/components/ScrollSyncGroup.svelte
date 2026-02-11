<script lang="ts">
  import { onDestroy } from 'svelte';

  export let watchKeys: unknown = undefined;

  const containers = new Set<HTMLDivElement>();

  let isSyncing = false;
  let rafId: number | null = null;

  function onWrapperScroll(e: Event): void {
    if (isSyncing) return;
    const target = e.currentTarget;
    if (!(target instanceof HTMLDivElement)) return;

    const left = target.scrollLeft;
    isSyncing = true;
    for (const el of containers) {
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

  function attach(el: HTMLDivElement): void {
    el.addEventListener('scroll', onWrapperScroll, { passive: true });
  }

  function detach(el: HTMLDivElement): void {
    el.removeEventListener('scroll', onWrapperScroll);
  }

  function refresh(): void {
    for (const el of containers) {
      detach(el);
      attach(el);
    }
  }

  function setRef(node: HTMLDivElement) {
    containers.add(node);
    attach(node);

    return {
      destroy() {
        detach(node);
        containers.delete(node);
      },
    };
  }

  $: if (watchKeys !== undefined) refresh();

  onDestroy(() => {
    for (const el of containers) {
      detach(el);
    }
    containers.clear();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  });
</script>

<slot {setRef} />
