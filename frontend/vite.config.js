import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages sirve el sitio en https://<user>.github.io/<repo>/
// Si el build usa base: '/', los .css y .js fallan (404) y ves la página SIN estilos.
// En dev (vite) command === 'serve' → base '/' | en build → '/practica-6/' para este repo.
// Override: VITE_BASE_PATH=/otra-ruta/ npm run build
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || (command === 'build' ? '/practica-6/' : '/'),
}))
