<script lang="ts">
  let isOpen = true;
</script>

<div class="fixed top-4 left-4 z-1000">
  <div class:hidden={!isOpen} class="w-[min(380px,calc(100vw-2rem))]">
    <div
      class="relative rounded-2xl border border-white/20 bg-white/10 p-8 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[10px]"
    >
      <button
        class="absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20"
        type="button"
        aria-label="隐藏个人信息卡片"
        title="隐藏"
        on:click={() => {
          isOpen = false;
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="size-5"
          fill="currentColor"
        >
          <path
            d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z"
          />
        </svg>
      </button>

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

  <button
    class:hidden={isOpen}
    class="flex cursor-pointer items-center gap-3 rounded-full border border-white/25 bg-white/15 p-3 text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all hover:bg-white/25"
    type="button"
    aria-label="显示个人信息卡片"
    title="显示"
    on:click={() => {
      isOpen = true;
    }}
  >
    <img
      class="size-11 rounded-full border-2 border-white/30"
      src="https://github.com/MiyakoMeow.png"
      alt="Miyako Meow"
    />
    <span class="pr-1 font-semibold">MiyakoMeow</span>
  </button>
</div>
