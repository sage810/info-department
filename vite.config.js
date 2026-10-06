import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import feedbackMode from './tools/feedback-mode/vite-plugin.js';

export default defineConfig({
  plugins: [react(), feedbackMode()],
});
