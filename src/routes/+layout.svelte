<script lang="ts">
  import { page } from "$app/state";
  import { getLocale, locales, localizeHref } from "$lib/paraglide/runtime";
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();

  // 客户端动态设置 HTML lang 属性
  $effect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = getLocale();
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}
<div style="display: none">
  {#each locales as locale}
    <a
      href={localizeHref(page.url.pathname, { locale })}
    >
      {locale}
    </a>
  {/each}
</div>
