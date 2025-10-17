import { defineConfig } from 'vite';

export default defineConfig({
  base: '/sandbox-game-jojo/',
  publicDir: 'public',  // Public assets folder
  build: {
    assetsInlineLimit: 0,  // Don't inline assets, keep them as separate files
  }
});
