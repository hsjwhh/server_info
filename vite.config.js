import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 如果后端接口本身就带有 /api 前缀，则不需要 rewrite
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  build: {
    // vuestic-ui 全量包约 300 kB(gz)，属正常体积，上调阈值避免误报
    chunkSizeWarningLimit: 800,

    // 生产环境不生成 source map，减小产物体积，防止源码外泄
    sourcemap: false,

    rollupOptions: {
      output: {
        /**
         * 手动分包策略
         * 原则：按「更新频率」分层，低频 vendor 长期缓存，
         *       业务代码变更时只重新下载业务 chunk。
         *
         * 注：@mdi/font 已迁移至 index.html CDN 引入，不再进入构建产物。
         *     页面级 chunk 由路由 () => import() 懒加载自动拆分，无需在此声明。
         */
        manualChunks(id) {
          // ① Vue 生态核心运行时（极低更新频率，强缓存）
          if (
            id.includes('node_modules/vue/') ||
            id.includes('node_modules/vue-router/') ||
            id.includes('node_modules/pinia/') ||
            id.includes('node_modules/@vue/')
          ) {
            return 'vue-vendor'
          }

          // ② Vuestic UI（体积最大，单独隔离；升级时只破坏此 chunk 的缓存）
          if (id.includes('node_modules/vuestic-ui/')) {
            return 'vuestic-vendor'
          }

          // ③ HTTP 请求层
          if (id.includes('node_modules/axios/')) {
            return 'http-vendor'
          }

          // ④ 其余 node_modules（lodash.debounce 等轻量工具）
          if (id.includes('node_modules/')) {
            return 'common-vendor'
          }

          // ⑤ ConfigPlan 业务逻辑层
          //    （store 是同步引入，Rollup 不会自动拆分，需手动分组）
          if (
            id.includes('/stores/configPlan') ||
            id.includes('/stores/configPlanValidation')
          ) {
            return 'config-plan-logic'
          }
        },

        // 文件名带 hash，内容不变则缓存永不失效
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      }
    }
  }
})
