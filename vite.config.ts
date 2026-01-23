import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/ai-pcb-defect-detection/",
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
