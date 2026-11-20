import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** Build harness for the kb export: renders the .svx pages the way the desk sees them. */
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) } }),
  ],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: false }),
    alias: { '#lib': 'src/lib' },
    prerender: { handleHttpError: 'warn' },
  },
};
