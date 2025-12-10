import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUpdate,
  onBeforeUnmount,
  nextTick,
  watch,
  type ComponentPublicInstance,
} from "vue";

export default defineComponent({
  name: "ScrollSyncGroup",
  props: {
    watchKeys: {
      type: undefined as unknown as () => unknown,
      required: false,
    },
  },
  setup(props, { slots }) {
    const containerRefs = ref<HTMLDivElement[]>([]);
    function setRef(el: Element | ComponentPublicInstance | null): void {
      if (el && el instanceof HTMLDivElement) {
        containerRefs.value.push(el);
      }
    }

    let isSyncing = false;
    let rafId: number | null = null;
    function onWrapperScroll(e: Event): void {
      if (isSyncing) return;
      const target = e.target as HTMLDivElement;
      const left = target.scrollLeft;
      isSyncing = true;
      containerRefs.value.forEach((w) => {
        if (w !== target) {
          w.scrollLeft = left;
        }
      });
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        isSyncing = false;
      });
    }

    function attach(): void {
      containerRefs.value.forEach((w) => {
        w.addEventListener("scroll", onWrapperScroll, { passive: true });
      });
    }

    function detach(): void {
      containerRefs.value.forEach((w) => {
        w.removeEventListener("scroll", onWrapperScroll);
      });
    }

    onMounted(async () => {
      await nextTick();
      attach();
    });

    onBeforeUpdate(() => {
      containerRefs.value = [];
    });

    onBeforeUnmount(() => {
      detach();
    });

    watch(
      () => props.watchKeys,
      async () => {
        await nextTick();
        detach();
        attach();
      },
      { deep: true }
    );

    return () => slots.default?.({ setRef });
  },
});
