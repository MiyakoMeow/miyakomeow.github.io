import { blogPosts } from "$lib/data/blog-posts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
  return {
    posts: blogPosts,
  };
};
