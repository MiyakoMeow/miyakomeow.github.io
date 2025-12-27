<script lang="ts">
  import { onMount } from "svelte";
  import {
    createSvelteFloatingPanelBindings,
    cubicInOut,
    fade,
  } from "../utils/floatingPanelVisibility";

  const sessionKey = "miyakomeow_profile_card_seen";

  let cardContainer: HTMLDivElement | undefined;

  const { open, enableTransitions, fadeDurationMs, visibility } = createSvelteFloatingPanelBindings({
    sessionKey,
    getContainer: () => cardContainer,
  });

  onMount(() => visibility.mount());
</script>

<div
  class="fixed top-4 left-4 z-1000"
  bind:this={cardContainer}
  role="presentation"
  on:mouseenter={visibility.onPointerEnter}
  on:mousemove={visibility.onPointerMove}
  on:mouseleave={visibility.onPointerLeave}
>
  {#key $open}
    {@const keyedOpen = $open}
    <div
      class="relative overflow-hidden border border-white/20 bg-white/10 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[10px] transition-opacity duration-200 ease-in-out"
      class:max-h-[600px]={keyedOpen}
      class:w-[min(380px,calc(100vw-2rem))]={keyedOpen}
      class:p-8={keyedOpen}
      class:rounded-2xl={keyedOpen}
      class:max-h-14={!keyedOpen}
      class:w-14={!keyedOpen}
      class:p-2={!keyedOpen}
      class:rounded-full={!keyedOpen}
      in:fade={{
        delay: $enableTransitions ? fadeDurationMs : 0,
        duration: $enableTransitions ? fadeDurationMs : 0,
        easing: cubicInOut,
      }}
      out:fade={{ duration: $enableTransitions ? fadeDurationMs : 0, easing: cubicInOut }}
      role="button"
      aria-label={keyedOpen ? "个人信息卡片" : "展开个人信息卡片"}
      aria-expanded={keyedOpen}
      tabindex={0}
      on:click={() => {
        if (!keyedOpen) visibility.requestOpen();
      }}
      on:keydown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!keyedOpen) visibility.requestOpen();
        }
      }}
    >
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-in-out"
        class:opacity-0={keyedOpen}
        class:opacity-100={!keyedOpen}
      >
        <img
          class="size-11 rounded-full border-2 border-white/30"
          src="https://github.com/MiyakoMeow.png"
          alt="Miyako Meow"
        />
      </div>

      <div
        class="text-center transition-opacity duration-200 ease-in-out"
        class:opacity-100={keyedOpen}
        class:opacity-0={!keyedOpen}
      >
        <div>
          <div>
            <img
              class="mx-auto mb-4 h-30 w-30 rounded-full border-4 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-[5deg]"
              src="https://github.com/MiyakoMeow.png"
              alt="Miyako Meow"
            />
          </div>
          <h1
            class="my-2 bg-[linear-gradient(90deg,#a78bfa,#f472b6,#60a5fa)] bg-clip-text text-[2.5rem] text-transparent"
          >
            MiyakoMeow
          </h1>
          <p class="mb-8 text-[1.1rem] text-[#a5b4fc]">喵喵喵！</p>
        </div>

        <div class="mb-10 leading-[1.6] text-white/90">
          <p>追逐成就感中</p>
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
            X (Twitter)
          </a>
        </div>
      </div>
    </div>
  {/key}
</div>
