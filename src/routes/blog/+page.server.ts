import { resolve } from "node:path";

import type { PageServerLoad } from "./$types";

import { BLOG_DIR } from "$lib/constants/blog";
import { scanBlogDirectory } from "$lib/utils/blog-scanner";
import { formatTitle } from "$lib/utils/title";

let cachedPosts: ReturnType<typeof scanBlogDirectory> | undefined;

export const load: PageServerLoad = () => {
  cachedPosts ??= scanBlogDirectory(resolve(process.cwd(), BLOG_DIR));
  const posts = cachedPosts;

  return {
    posts,
    title: formatTitle("博客文章"),
  };
};
