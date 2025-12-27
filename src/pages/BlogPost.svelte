<script lang="ts">
  import { onMount, tick } from "svelte";

  import ProfileCard from "@/components/ProfileCard.svelte";
  import FloatingToc, { buildTocFromHeadings, type TocItem } from "@/components/FloatingToc.svelte";
  import QuickActions from "@/components/QuickActions.svelte";
  import StarryBackground from "@/components/StarryBackground.svelte";
  import MarkdownContent from "@/components/MarkdownContent.svelte";
  import { getBlogPost } from "@/defines/blog-posts";

  export let slug: string;

  const post = getBlogPost(slug);

  let tocItems: TocItem[] = [];

  onMount(async () => {
    await tick();
    tocItems = buildTocFromHeadings({ minLevel: 2, maxLevel: 6 });
  });
</script>

<StarryBackground />
<ProfileCard />
<main class="m-0 mx-auto box-border w-full max-w-350 p-8">
  {#if !post}
    <section
      class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
    >
      <h1
        class="mb-2 text-center text-[clamp(2rem,3vw,2.5rem)] leading-tight font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        文章未找到
      </h1>
      <div class="text-center text-[0.95rem] text-white/70">
        <a
          class="text-white/90 underline decoration-white/30 underline-offset-4"
          href="/index.html#blog"
        >
          返回博客
        </a>
      </div>
    </section>
  {:else}
    <section
      class="mt-8 w-full animate-fadeIn rounded-[20px] border border-white/10 bg-white/10 p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-[10px]"
    >
      <div class="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <a
          class="text-white/90 underline decoration-white/30 underline-offset-4"
          href="/index.html#blog"
        >
          返回博客
        </a>
        {#if post.date}
          <div class="text-[0.9rem] text-white/60">{post.date}</div>
        {/if}
      </div>
      <MarkdownContent>
        <svelte:component this={post.component} />
      </MarkdownContent>
    </section>
  {/if}
</main>
<FloatingToc items={tocItems} />
<QuickActions />
