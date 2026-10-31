import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset paths so the build works on any static host (Netlify, Vercel, GitHub Pages sub-folder).
export default defineConfig({ base: './', plugins: [react()] })
