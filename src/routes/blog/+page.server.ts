import type { PageServerLoad } from "./$types";

import { BLOG_DIR } from "$lib/constants/blog";
import { scanBlogDirectory } from "$lib/utils/blog-scanner";
import { formatTitle } from "$lib/utils/title";

export const load: PageServerLoad = () => {
  const posts = scanBlogDirectory(BLOG_DIR);

  return {
    posts,
    title: formatTitle("博客文章"),
  };
};
