import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vercel and local: use '/' as base
  // GitHub Pages: use '/vibe-mic-test/' - set via VITE_BASE_PATH env var
  base: process.env.VITE_BASE_PATH || '/',
});
