import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import checker from 'vite-plugin-checker'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // treat all tags with a dash as custom elements
          isCustomElement: tag => tag.includes('-'),
        },
      },
    }),
    checker({
      vueTsc: true,
    }),
  ],
  // server: {
  //   https: {
  //     key: fs.readFileSync('../../localhost-key.pem'),
  //     cert: fs.readFileSync('../../localhost.pem')
  //   }
  // }
})
