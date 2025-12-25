<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  const sessionKey = "miyakomeow_profile_card_seen";
  const hasSeenProfileCard = (() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(sessionKey) === "1";
    } catch {
      return false;
    }
  })();

  let open = !hasSeenProfileCard;
  let enableTransitions = false;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;

  let cardContainer: HTMLDivElement | undefined;

  let isPointerInside = false;

  const fadeDurationMs = 200;

  function openCard() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = undefined;
    if (open) return;
    open = true;
  }

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    if (!open) return;
    closeTimer = setTimeout(() => {
      open = false;
      closeTimer = undefined;
    }, 500);
  }

  onMount(() => {
    try {
      window.sessionStorage.setItem(sessionKey, "1");
    } catch {}

    function closeImmediately() {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = undefined;

      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      autoCloseTimer = undefined;

      isPointerInside = false;

      open = false;
    }

    function onOutsidePointerDown(event: PointerEvent) {
      if (!cardContainer) return;
      if (event.target instanceof Node && cardContainer.contains(event.target)) return;
      closeImmediately();
    }

    function onOutsideKeyDown(event: KeyboardEvent) {
      if (!cardContainer) return;
      if (event.target instanceof Node && cardContainer.contains(event.target)) return;
      closeImmediately();
    }

    function onOutsideWheel(event: WheelEvent) {
      if (!cardContainer) return;
      if (event.target instanceof Node && cardContainer.contains(event.target)) return;
      closeImmediately();
    }

    function onOutsideFocusIn(event: FocusEvent) {
      if (!cardContainer) return;
      if (event.target instanceof Node && cardContainer.contains(event.target)) return;
      closeImmediately();
    }

    document.addEventListener("pointerdown", onOutsidePointerDown, true);
    document.addEventListener("keydown", onOutsideKeyDown, true);
    document.addEventListener("wheel", onOutsideWheel, { capture: true, passive: true });
    document.addEventListener("focusin", onOutsideFocusIn, true);

    enableTransitions = true;

    if (open) {
      autoCloseTimer = setTimeout(() => {
        if (!isPointerInside && open) open = false;
        autoCloseTimer = undefined;
      }, 3000);
    }

    return () => {
      document.removeEventListener("pointerdown", onOutsidePointerDown, true);
      document.removeEventListener("keydown", onOutsideKeyDown, true);
      document.removeEventListener("wheel", onOutsideWheel, true);
      document.removeEventListener("focusin", onOutsideFocusIn, true);
    };
  });

  onDestroy(() => {
    if (closeTimer) clearTimeout(closeTimer);
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
  });
</script>

<div
  class="fixed top-4 left-4 z-1000"
  bind:this={cardContainer}
  role="presentation"
  on:mouseenter={() => {
    isPointerInside = true;
    openCard();
  }}
  on:mousemove={openCard}
  on:mouseleave={() => {
    isPointerInside = false;
    scheduleClose();
  }}
>
  {#key open}
    <div
      class="relative overflow-hidden border border-white/20 bg-white/10 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[10px] transition-opacity duration-200 ease-in-out"
      class:max-h-[600px]={open}
      class:w-[min(380px,calc(100vw-2rem))]={open}
      class:p-8={open}
      class:rounded-2xl={open}
      class:max-h-14={!open}
      class:w-14={!open}
      class:p-2={!open}
      class:rounded-full={!open}
      in:fade={{
        delay: enableTransitions ? fadeDurationMs : 0,
        duration: enableTransitions ? fadeDurationMs : 0,
        easing: cubicInOut,
      }}
      out:fade={{ duration: enableTransitions ? fadeDurationMs : 0, easing: cubicInOut }}
      role="button"
      aria-label={open ? "个人信息卡片" : "展开个人信息卡片"}
      aria-expanded={open}
      tabindex={0}
      on:click={() => {
        if (!open) openCard();
      }}
      on:keydown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!open) openCard();
        }
      }}
    >
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out"
        class:opacity-0={open}
        class:opacity-100={!open}
      >
        <img
          class="size-11 rounded-full border-2 border-white/30"
          src="https://github.com/MiyakoMeow.png"
          alt="Miyako Meow"
        />
      </div>

      <div
        class="transition-opacity duration-200 ease-in-out"
        class:opacity-100={open}
        class:opacity-0={!open}
      >
        <div>
          <div>
            <img
              class="mb-4 h-30 w-30 rounded-full border-4 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-[5deg]"
              src="https://github.com/MiyakoMeow.png"
              alt="Miyako Meow"
            />
          </div>
          <h1
            class="my-2 bg-[linear-gradient(90deg,#a78bfa,#f472b6,#60a5fa)] bg-clip-text text-[2.5rem] text-transparent"
          >
            MiyakoMeow
          </h1>
          <p class="mb-8 text-[1.1rem] text-[#a5b4fc]">一个天天摸鱼的大学生。</p>
        </div>

        <div class="mb-10 leading-[1.6] text-white/90">
          <p>欢迎来到我的个人主页！</p>
        </div>

        <div class="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/MiyakoMeow"
            target="_blank"
            class="rounded-[50px] border border-white/20 bg-white/10 px-6 py-[0.8rem] font-medium text-white no-underline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
          >
            GitHub
          </a>
          <a
            href="https://space.bilibili.com/215242890"
            class="rounded-[50px] border border-white/20 bg-white/10 px-6 py-[0.8rem] font-medium text-white no-underline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
          >
            Bilibili
          </a>
          <a
            href="https://x.com/MiyakoWoW"
            class="rounded-[50px] border border-white/20 bg-white/10 px-6 py-[0.8rem] font-medium text-white no-underline transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
          >
            X
          </a>
        </div>
      </div>
    </div>
  {/key}
</div>
