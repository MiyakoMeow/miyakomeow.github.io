<script lang="ts">
import BlogLayout from "../layout/BlogLayout.svelte";
import QuickActions from "../components/QuickActions.svelte";
import "../styles/main.css";

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
</script>

<BlogLayout>
  <div class="glass-container bms-index-container">
    <h1 class="content-title">BMS</h1>
    <div class="links-grid">
      {#each links as link (link.href)}
        <a class="link-card" href={link.href}>
          <div class="link-title">{link.title}</div>
          <div class="link-desc">{link.desc}</div>
        </a>
      {/each}
    </div>
  </div>
</BlogLayout>
<QuickActions />

<style>
@reference "tailwindcss";

.glass-container {
  @apply bg-white/10 backdrop-blur-[10px] rounded-[20px] p-8 mt-8 border border-white/10 text-white w-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-[fadeIn_0.8s_ease-out];
}

.links-grid {
  @apply grid grid-cols-[repeat(2,minmax(240px,1fr))] gap-4 mt-4;
  .link-card {
    @apply block p-[1.25rem] rounded-[14px] bg-black/20 border border-white/10 text-white no-underline;
    transition:
      transform 0.15s ease,
      background 0.3s ease;
    &:hover {
      @apply bg-[rgba(255,255,255,0.06)];
      transform: translateY(-2px);
    }
  }
  .link-title {
    @apply text-[1.2rem] font-bold mb-[0.5rem] text-[#64b5f6];
  }
  .link-desc {
    @apply text-[0.95rem] text-white/80;
  }
}
</style>
