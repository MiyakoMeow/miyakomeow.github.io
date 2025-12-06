import { defineConfig } from 'jsr:@deno/vite-plugin-deno'
import vue from 'jsr:@deno/vite-plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  optimizeDeps: {
    include: ['vue']
  }
})
