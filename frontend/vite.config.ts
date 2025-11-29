import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/car-inspection-site/",
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
