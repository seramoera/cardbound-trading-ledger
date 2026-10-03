import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH is set by the Pages workflow to "/<repository-name>/", because
// a GitHub project page is served from a subfolder, not the root of the domain.
// Everywhere else (local dev, Vercel, Netlify, a custom domain) the root is
// correct, so the default is "/". Page 7 of content/extending-your-app explains
// what goes wrong without this: a blank white page and 404s on every asset.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    // Only used by `npm run dev` when calling the optional local Express API.
    // The deployed Cardbound app uses Supabase directly, so this proxy and the
    // Express server's CORS_ORIGINS setting are not in its production path.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
