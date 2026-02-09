import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages uses: https://<username>.github.io/<repo>/
  // Update 'vibe-mic-test' to match your actual repo name if different
  base: '/vibe-mic-test/',
});
