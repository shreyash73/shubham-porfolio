import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/shubham-porfolio/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        work: resolve(__dirname, 'work.html')
      }
    }
  }
});
