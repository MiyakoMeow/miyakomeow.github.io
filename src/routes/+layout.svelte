<script lang="ts">
	import { page } from "$app/state";
	import { getLocale } from "$lib/paraglide/runtime";
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

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
