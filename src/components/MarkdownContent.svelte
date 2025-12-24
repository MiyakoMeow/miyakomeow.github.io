<script lang="ts">
  import "katex/dist/katex.min.css";
  import MarkdownIt from "markdown-it";
  import mk from "markdown-it-katex";

  export let content: string = "";
  export let className: string = "";

  let renderedContent = "";

  // 创建markdown-it实例，配置与vite-plugin-md一致
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  }).use(mk);

  // 渲染Markdown内容
  $: renderedContent = content ? md.render(content) : "";
</script>

{#if content}
  <div class="markdown-content {className}">
    {@html renderedContent}
  </div>
{/if}

<style>
  /* 组件特定样式增强 */
  :global(.markdown-content) {
    line-height: 1.6;
  }

  /* 代码块样式增强 */
  :global(.markdown-content pre code) {
    background: transparent;
    padding: 0;
  }

  /* 数学公式样式 */
  :global(.markdown-content .katex-display) {
    overflow: auto hidden;
    padding: 1rem 0;
  }

  /* 自定义容器样式 */
  :global(.markdown-content .info),
  :global(.markdown-content .warning),
  :global(.markdown-content .tip) {
    border-left: 4px solid;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 0.25rem;
    background: rgba(255, 255, 255, 0.05);
  }

  :global(.markdown-content .info) {
    border-color: #64b5f6;
  }

  :global(.markdown-content .warning) {
    border-color: #ff9800;
  }

  :global(.markdown-content .tip) {
    border-color: #4caf50;
  }
</style>
