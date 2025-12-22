<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  type CardState = "open" | "openHidden" | "closed" | "closedHidden";

  let cardState: CardState = "open";
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let fadeTimer: ReturnType<typeof setTimeout> | undefined;
  let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;

  let autoCloseArmed = false;
  let isPointerInside = false;

  const fadeDurationMs = 200;

  function isOpen(state: CardState) {
    return state === "open" || state === "openHidden";
  }

  function clearFadeTimer() {
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = undefined;
  }

  function transitionTo(nextOpen: boolean) {
    clearFadeTimer();

    const currentOpen = isOpen(cardState);
    cardState = currentOpen ? "openHidden" : "closedHidden";

    fadeTimer = setTimeout(() => {
      cardState = nextOpen ? "openHidden" : "closedHidden";
      requestAnimationFrame(() => (cardState = nextOpen ? "open" : "closed"));
      fadeTimer = undefined;
    }, fadeDurationMs);
  }

  function openCard() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = undefined;
    clearFadeTimer();
    cardState = isOpen(cardState) ? "open" : "closed";
    if (isOpen(cardState)) return;
    transitionTo(true);
  }

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    if (!autoCloseArmed) return;
    if (!isOpen(cardState)) return;
    closeTimer = setTimeout(() => {
      transitionTo(false);
      closeTimer = undefined;
    }, 500);
  }

  onMount(() => {
    autoCloseTimer = setTimeout(() => {
      autoCloseArmed = true;
      if (!isPointerInside && isOpen(cardState)) transitionTo(false);
      autoCloseTimer = undefined;
    }, 3000);
  });

  onDestroy(() => {
    if (closeTimer) clearTimeout(closeTimer);
    clearFadeTimer();
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
  });
</script>

<div class="fixed top-4 left-4 z-1000">
  <div
    class="relative overflow-hidden border border-white/20 bg-white/10 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[10px] transition-opacity duration-200 ease-in-out"
    class:max-h-[600px]={isOpen(cardState)}
    class:w-[min(380px,calc(100vw-2rem))]={isOpen(cardState)}
    class:p-8={isOpen(cardState)}
    class:rounded-2xl={isOpen(cardState)}
    class:max-h-14={!isOpen(cardState)}
    class:w-14={!isOpen(cardState)}
    class:p-2={!isOpen(cardState)}
    class:rounded-full={!isOpen(cardState)}
    class:opacity-100={cardState === "open" || cardState === "closed"}
    class:opacity-0={cardState === "openHidden" || cardState === "closedHidden"}
    role="button"
    aria-label={isOpen(cardState) ? "个人信息卡片" : "展开个人信息卡片"}
    aria-expanded={isOpen(cardState)}
    tabindex={0}
    on:mouseenter={() => {
      isPointerInside = true;
      openCard();
    }}
    on:mousemove={openCard}
    on:click={() => {
      if (!isOpen(cardState)) openCard();
    }}
    on:keydown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!isOpen(cardState)) openCard();
      }
    }}
    on:mouseleave={() => {
      isPointerInside = false;
      scheduleClose();
    }}
  >
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out"
      class:opacity-0={isOpen(cardState)}
      class:opacity-100={!isOpen(cardState)}
    >
      <img
        class="size-11 rounded-full border-2 border-white/30"
        src="https://github.com/MiyakoMeow.png"
        alt="Miyako Meow"
      />
    </div>

    <div
      class="transition-opacity duration-200 ease-in-out"
      class:opacity-100={isOpen(cardState)}
      class:opacity-0={!isOpen(cardState)}
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
</div>
