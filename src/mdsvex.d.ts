/**
 * MDSvex 类型声明
 *
 * 为 Markdown 和 Svx 文件提供 TypeScript 类型支持
 * 使 mdsvex 预处理器能够正确处理这些文件并生成 Svelte 组件
 */

declare module "*.md" {
	import type { SvelteComponentTyped } from "svelte";

	// MDSvex 将 Markdown 文件转换为 Svelte 组件
	class MdsvexComponent extends SvelteComponentTyped<
		Record<string, never>,
		Record<string, never>,
		Record<string, never>
	> {
		// Markdown 元数据（如果需要可以添加）
	}

	export default MdsvexComponent;
}

declare module "*.svx" {
	import type { SvelteComponentTyped } from "svelte";

	// Svx 文件与 Markdown 文件处理方式相同
	class SvexComponent extends SvelteComponentTyped<
		Record<string, never>,
		Record<string, never>,
		Record<string, never>
	> {
		//
	}

	export default SvexComponent;
}
