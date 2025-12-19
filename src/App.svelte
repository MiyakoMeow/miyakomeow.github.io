<script lang="ts">
  import BlogLayout from "@/layout/BlogLayout.svelte";
  import QuickActions from "@/components/QuickActions.svelte";
  import "@/styles/main.css";
</script>

<BlogLayout>
  <section class="glass-container">
    <h1 class="link-title">BMS</h1>
    <div class="link-list bms-main-link">
      <a class="link-item" href="/bms/index.html"> BMS 主页 </a>
    </div>

    <h2 class="link-title">其他链接</h2>
    <div class="link-list-horizontal">
      <a class="link-item" href="/bms/table/self-sp/index.html"> 谱面合集（SP） </a>
      <a class="link-item" href="/bms/table/self-dp/index.html"> 谱面合集（DP） </a>
      <a class="link-item" href="/bms/table-mirror/index.html"> 表镜像 </a>
    </div>
  </section>
</BlogLayout>
<QuickActions />

<style>
  @reference "tailwindcss";

  .link-item {
    @apply inline-block rounded-[12px] border border-white/20 bg-white/10 px-[1.5rem] py-[0.8rem] text-white no-underline;
    transition: all 0.2s ease;

    &:hover {
      @apply bg-white/20;
      transform: translateY(-2px);
    }
  }

  .link-title {
    @apply mb-8 text-center text-[2.5rem] text-white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .link-list {
    @apply flex flex-col items-center gap-4;
  }

  .bms-main-link {
    @apply mb-8;
  }

  .link-list-horizontal {
    @apply flex flex-row flex-wrap items-center justify-center gap-4;
  }

  .glass-container {
    @apply mt-8 w-full animate-[fadeIn_0.8s_ease-out] rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px];
  }
</style>
