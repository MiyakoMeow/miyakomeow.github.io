<script lang="ts">
  import ProfileCard from "@/components/ProfileCard.svelte";
  import QuickActions from "@/components/QuickActions.svelte";
  import StarryBackground from "@/components/StarryBackground.svelte";
  import { blogPosts } from "@/blog/posts";
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

  <section
    class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <div class="mb-6 flex flex-wrap items-baseline justify-between gap-3">
      <h2 class="section-title m-0">博客</h2>
      <a class="text-[0.95rem] text-white/80 underline decoration-white/30 underline-offset-4" href="/blog/index.html">
        博客页
      </a>
    </div>

    {#if blogPosts.length === 0}
      <div class="text-center text-white/70">暂无文章</div>
    {:else}
      <div class="flex flex-col gap-4">
        {#each blogPosts as post (post.slug)}
          <a
            class="block rounded-[14px] border border-white/10 bg-black/20 p-6 text-white no-underline transition-[transform,background] duration-300 ease-out hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.06)]"
            href={post.url}
          >
            <div class="mb-1 flex flex-wrap items-baseline justify-between gap-3">
              <div class="text-[1.2rem] font-bold text-[#64b5f6]">{post.title}</div>
              {#if post.date}
                <div class="text-[0.85rem] text-white/60">{post.date}</div>
              {/if}
            </div>
            <div class="text-[0.95rem] text-white/80">{post.firstSentence}</div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</main>
<QuickActions />
