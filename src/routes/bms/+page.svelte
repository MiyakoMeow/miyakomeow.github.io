<script lang="ts">
  import { onMount, tick } from "svelte";

  import BreadcrumbNav from "$lib/components/BreadcrumbNav.svelte";
  import ProfileCard from "$lib/components/ProfileCard.svelte";
  import FloatingToc, {
    buildTocFromHeadings,
    type TocItem,
  } from "$lib/components/FloatingToc.svelte";
  import QuickActions from "$lib/components/QuickActions.svelte";
  import StarryBackground from "$lib/components/StarryBackground.svelte";
  import MarkdownContent from "$lib/components/MarkdownContent.svelte";
  import BmsContent from "$content/bms/index.md";

  interface LinkItem {
    href: string;
    title: string;
    desc: string;
  }

  const breadcrumbs = [{ label: "主页", href: "/" }, { label: "BMS" }];

  let tocItems: TocItem[] = [];

  onMount(async () => {
    await tick();
    tocItems = buildTocFromHeadings({ minLevel: 2, maxLevel: 6 });
  });
</script>

<StarryBackground />
<ProfileCard />
<BreadcrumbNav
  items={breadcrumbs}
  sessionKey="breadcrumb-bms-home"
  initiallyOpen={false}
/>
<main class="m-0 mx-auto box-border w-full max-w-350 p-8">
  <!-- 菜单部分 -->
  <div
    class="relative animate-fadeIn mt-8 w-full rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <h1 class="page-title text-center">BMS</h1>
    <div class="mt-4 flex flex-wrap items-stretch justify-center gap-4">
      <a
        href="/bms/table-mirror"
        class="flex w-80 flex-col rounded-[14px] border border-white/10 bg-black/20 p-5 text-white no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
      >
        <div class="mb-2 text-[1.2rem] font-bold text-[#64b5f6]">
          难度表镜像
        </div>
        <div class="text-[0.95rem] text-white/80">
          BMS 难度表镜像列表（支持多语言搜索）
        </div>
      </a>
      <a
        href="/bms/table/self-sp"
        class="flex w-80 flex-col rounded-[14px] border border-white/10 bg-black/20 p-5 text-white no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
      >
        <div class="mb-2 text-[1.2rem] font-bold text-[#64b5f6]">
          谱面合集（SP）
        </div>
        <div class="text-[0.95rem] text-white/80">
          个人 SP 难度表
        </div>
      </a>
      <a
        href="/bms/table/self-dp"
        class="flex w-80 flex-col rounded-[14px] border border-white/10 bg-black/20 p-5 text-white no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
      >
        <div class="mb-2 text-[1.2rem] font-bold text-[#64b5f6]">
          谱面合集（DP）
        </div>
        <div class="text-[0.95rem] text-white/80">
          个人 DP 难度表
        </div>
      </a>
    </div>
  </div>

  <!-- Markdown内容部分 -->
  <div
    class="relative animate-fadeIn mt-8 w-full rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <MarkdownContent>
      <BmsContent />
    </MarkdownContent>
  </div>
</main>
<FloatingToc items={tocItems} />
<QuickActions />
