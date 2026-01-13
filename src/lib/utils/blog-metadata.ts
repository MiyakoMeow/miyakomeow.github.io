import matter from "gray-matter";

export interface BlogPostMetadata {
  title: string;
  date?: string;
  order?: number;
  slug?: string;
  description?: string;
  tags?: string[];
}

/**
 * 解析 Markdown 文件的 frontmatter 和内容
 * @param content - Markdown 文件内容
 * @returns 解析后的元数据和正文内容
 */
export function parseFrontmatter(content: string): {
  metadata: BlogPostMetadata;
  content: string;
} {
  const parsed = matter(content);
  return {
    metadata: parsed.data as BlogPostMetadata,
    content: parsed.content,
  };
}

/**
 * 从 Markdown 内容中提取第一句话作为摘要
 * @param markdown - Markdown 内容
 * @returns 提取的摘要文本
 */
export function extractFirstSentence(markdown: string): string {
  // 移除 frontmatter
  const withoutFrontmatter = markdown.replace(/^---[\s\S]*?---\s*/, "");

  // 移除标题行
  const withoutHeadings = withoutFrontmatter.replace(/^#+\s+.*$/gm, "");

  // 提取第一句话（支持中英文标点）
  const match = withoutHeadings.match(/^(.{1,200}?[。.!?\n])/);

  if (match) {
    return match[1].trim();
  }

  // 如果没有找到句子结束符，返回前 100 个字符
  return withoutHeadings.slice(0, 100).trim() + "...";
}
