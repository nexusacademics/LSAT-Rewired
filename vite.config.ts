import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Include FullCalendar deps so Vite can pre-bundle them properly
    include: [
      '@fullcalendar/common',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
    ],
    // Also keep your exclude for lucide-react if needed
    exclude: ['lucide-react'],
  },
});
