import type { Component } from "svelte";

export type BlogPost = {
  slug: string;
  title: string;
  order?: number;
  date?: string;
  firstSentence: string;
  url: string;
  component: Component;
};

type ParsedFrontmatter = {
  frontmatter: Record<string, string>;
  body: string;
};

function parseFrontmatter(raw: string): ParsedFrontmatter {
  if (!raw.startsWith("---")) {
    return { frontmatter: {}, body: raw };
  }

  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { frontmatter: {}, body: raw };
  }

  const fmBlock = raw.slice(3, end).trim();
  const body = raw.slice(end + "\n---".length).replace(/^\s+/, "");

  const frontmatter: Record<string, string> = {};
  for (const line of fmBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    const value = trimmed
      .slice(sep + 1)
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");
    if (key) frontmatter[key] = value;
  }

  return { frontmatter, body };
}

function extractTitle(body: string, frontmatter: Record<string, string>): string {
  const fmTitle = frontmatter.title?.trim();
  if (fmTitle) return fmTitle;

  const match = body.match(/^#\s+(.+?)\s*$/m);
  return match?.[1]?.trim() || "未命名文章";
}

function stripMarkdownInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstSentence(body: string): string {
  const withoutFrontTitle = body.replace(/^#\s+(.+?)\s*$/m, "").trim();
  const blocks = withoutFrontTitle.split(/\n\s*\n/).map((b) => b.trim());
  const firstParagraph = blocks.find((b) => b && !b.startsWith("#") && !b.startsWith(">")) || "";
  const plain = stripMarkdownInline(firstParagraph.replace(/\n+/g, " "));

  const punctIndex = plain.search(/[。！？.!?]/);
  if (punctIndex === -1) return plain;

  return plain.slice(0, punctIndex + 1).trim();
}

function slugFromFilePath(filePath: string): string {
  const fileName = filePath.split("/").pop() ?? filePath;
  return fileName.replace(/\.md$/i, "");
}

const markdownComponents = import.meta.glob("../blog/*.md", {
  eager: true,
}) as Record<string, { default: Component }>;

const markdownRaw = import.meta.glob("../blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const blogPosts: BlogPost[] = Object.entries(markdownComponents)
  .map(([filePath, mod]) => {
    const slug = slugFromFilePath(filePath);
    const raw = markdownRaw[filePath] ?? "";
    const { frontmatter, body } = parseFrontmatter(raw);
    const title = extractTitle(body, frontmatter);
    const firstSentence = extractFirstSentence(body);
    const date = frontmatter.date?.trim() || undefined;
    const orderValue = frontmatter.order?.trim();
    const order = orderValue ? Number(orderValue) : undefined;
    const resolvedOrder = Number.isFinite(order) ? order : undefined;

    return {
      slug,
      title,
      ...(resolvedOrder !== undefined ? { order: resolvedOrder } : {}),
      ...(date ? { date } : {}),
      firstSentence,
      url: `/blog/${slug}/index.html`,
      component: mod.default,
    };
  })
  .sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined && b.order === undefined) return -1;
    if (a.order === undefined && b.order !== undefined) return 1;
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return a.slug.localeCompare(b.slug);
  });

export function getBlogPost(slug: string): BlogPost | null {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}
