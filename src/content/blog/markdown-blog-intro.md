---
title: "用 Markdown 写博客：从 mdsvex 到静态发布"
date: "2025-12-25"
---

# 用 Markdown 写博客：从 mdsvex 到静态发布

这篇文章记录我如何在这个站点里把 Markdown 变成可发布的博文。

## 为什么选择 Markdown

- 写作成本低：不需要进富文本编辑器，也不需要手工写 HTML。
- 可维护：和代码一样能版本化管理，改动可追踪。
- 可扩展：配合 mdsvex，Markdown 可以直接变成 Svelte 组件，甚至可以嵌入数学公式。

## 站点里的实现思路

这个项目用 Vite 的多页面构建配合自定义的 HTML 生成器，把每个页面都产出一个 `index.html`。
Markdown 由 mdsvex 预处理成可直接渲染的组件，在页面里通过 `<MarkdownContent>` 包一层统一样式即可。

## 一个小结

写作与发布被拆成了两个独立步骤：写 Markdown，构建时生成页面入口。
这让“增加一篇文章”变成“新增一个 `.md` 文件”，足够轻量。
