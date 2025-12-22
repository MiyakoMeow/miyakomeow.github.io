<script lang="ts">
  import ProfileCard from "@/components/ProfileCard.svelte";
  import QuickActions from "@/components/QuickActions.svelte";
  import StarryBackground from "@/components/StarryBackground.svelte";
</script>

<StarryBackground />
<ProfileCard />
<main class="m-0 mx-auto box-border w-full max-w-350 p-8">
  <section
    class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <h1 class="mb-8 text-center text-[2.5rem] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
      BMS
    </h1>
    <div class="mb-8 flex flex-col items-center gap-4">
      <a
        class="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-[0.8rem] text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20"
        href="/bms/index.html"
      >
        BMS 主页
      </a>
    </div>

    <h2 class="mb-8 text-center text-[2.5rem] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
      其他链接
    </h2>
    <div class="flex flex-row flex-wrap items-center justify-center gap-4">
      <a
        class="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-[0.8rem] text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20"
        href="/bms/table/self-sp/index.html"
      >
        MiyakoMeow谱面合集（SP）
      </a>
      <a
        class="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-[0.8rem] text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20"
        href="/bms/table/self-dp/index.html"
      >
        MiyakoMeow谱面合集（DP）
      </a>
      <a
        class="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-[0.8rem] text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20"
        href="/bms/table-mirror/index.html"
      >
        BMS难度表镜像
      </a>
    </div>
  </section>
</main>
<QuickActions />
