<script lang="ts">
  import ProfileCard from "@/components/ProfileCard.svelte";
  import QuickActions from "@/components/QuickActions.svelte";
  import StarryBackground from "@/components/StarryBackground.svelte";
  import MarkdownContent from "@/components/MarkdownContent.svelte";
  import HomeContent from "@/content/index.md";
</script>

<StarryBackground />
<ProfileCard />
<main class="m-0 mx-auto box-border w-full max-w-350 p-8">
  <!-- 菜单部分 -->
  <section
    class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <h1 class="page-title mb-8 text-center">BMS</h1>
    <div class="mb-8 flex flex-wrap items-center justify-center gap-4">
      <a
        class="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-[0.8rem] text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20"
        href="/bms/index.html"
      >
        BMS 主页
      </a>
      <a
        class="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-[0.8rem] text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20"
        href="/bms/table-mirror/index.html"
      >
        BMS难度表镜像
      </a>
      <a
        class="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-[0.8rem] text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20"
        href="/bms/table/self-sp/index.html"
      >
        难度表：MiyakoMeow谱面合集（SP）
      </a>
      <a
        class="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-[0.8rem] text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-white/20"
        href="/bms/table/self-dp/index.html"
      >
        难度表：MiyakoMeow谱面合集（DP）
      </a>
    </div>
  </section>

  <!-- Markdown内容部分 -->
  <section
    class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <MarkdownContent>
      <HomeContent />
    </MarkdownContent>
  </section>
</main>
<QuickActions />
