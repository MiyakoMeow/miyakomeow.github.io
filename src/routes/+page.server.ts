import type { PageServerLoad } from "./$types";

import { scanBlogDirectory } from "$lib/utils/blog-scanner";
import { formatTitle } from "$lib/utils/title";

const BLOG_DIR = "src/content/blog";

export const load: PageServerLoad = () => {
  const posts = scanBlogDirectory(BLOG_DIR);

  return {
    recentPosts: posts.slice(0, 5),
    title: formatTitle("欢迎来到白喵斯的小屋！"),
  };
};
