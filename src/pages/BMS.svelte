<script lang="ts">
  import { onMount, tick } from "svelte";

  import ProfileCard from "../components/ProfileCard.svelte";
  import FloatingToc, {
    buildTocFromHeadings,
    type TocItem,
  } from "../components/FloatingToc.svelte";
  import QuickActions from "../components/QuickActions.svelte";
  import StarryBackground from "../components/StarryBackground.svelte";
  import MarkdownContent from "../components/MarkdownContent.svelte";
  import BmsContent from "../content/bms/index.md";

  interface LinkItem {
    href: string;
    title: string;
    desc: string;
  }

  const links: LinkItem[] = [
    { href: "/bms/table/self-sp/", title: "MiyakoMeow谱面合集（SP）", desc: "SP 谱面合集" },
    { href: "/bms/table/self-dp/", title: "MiyakoMeow谱面合集（DP）", desc: "DP 谱面合集" },
    { href: "/bms/table-mirror/", title: "表镜像", desc: "无参数显示导航，有参数跳转" },
  ];

  let tocItems: TocItem[] = [];

  onMount(async () => {
    await tick();
    tocItems = buildTocFromHeadings({ minLevel: 2, maxLevel: 6 });
  });
</script>

<StarryBackground />
<ProfileCard />
<main class="m-0 mx-auto box-border w-full max-w-350 p-8">
  <!-- 菜单部分 -->
  <div
    class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <h1 class="page-title text-center">BMS</h1>
    <div class="mt-4 flex flex-wrap items-stretch justify-center gap-4">
      {#each links as link (link.href)}
        <a
          class="flex w-80 flex-col rounded-[14px] border border-white/10 bg-black/20 p-5 text-white no-underline transition-[transform,background] duration-300 ease-out hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.06)]"
          href={link.href}
        >
          <div class="mb-2 text-[1.2rem] font-bold text-[#64b5f6]">{link.title}</div>
          <div class="text-[0.95rem] text-white/80">{link.desc}</div>
        </a>
      {/each}
    </div>
  </div>

  <!-- Markdown内容部分 -->
  <div
    class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <MarkdownContent>
      <BmsContent />
    </MarkdownContent>
  </div>
</main>
<FloatingToc items={tocItems} />
<QuickActions />
