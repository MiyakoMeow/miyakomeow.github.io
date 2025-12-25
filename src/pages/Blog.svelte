<script lang="ts">
  import ProfileCard from "@/components/ProfileCard.svelte";
  import QuickActions from "@/components/QuickActions.svelte";
  import StarryBackground from "@/components/StarryBackground.svelte";
  import { blogPosts } from "@/blog/posts";
</script>

<StarryBackground />
<ProfileCard />
<main class="m-0 mx-auto box-border w-full max-w-350 p-8">
  <section
    class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
    <h1 class="page-title mb-2 text-center">博客</h1>
    <div class="text-center text-[0.95rem] text-white/70">
      <a class="text-white/90 underline decoration-white/30 underline-offset-4" href="/index.html">
        返回首页
      </a>
    </div>
  </section>

  <section
    class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
  >
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
