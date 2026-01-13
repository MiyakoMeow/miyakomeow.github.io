import { mdsvex } from "mdsvex";
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import process from "node:process";
import type { Config } from "@sveltejs/kit";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import path from "node:path";

const config: Config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		mdsvex({
			extensions: [".svx", ".md"],
			remarkPlugins: [remarkGfm, remarkMath],
		}),
		vitePreprocess(),
	],

	kit: {
		adapter: adapter({
			fallback: "404.html",
			pages: "build",
			assets: "build",
			preload: false,
		}),
		paths: {
			base: process.argv.includes("dev") ? "" : process.env.BASE_PATH,
		},
		alias: {
			$content: path.resolve("./src/content"),
		},
	},

	extensions: [".svelte", ".svx", ".md"],
};

export default config;
