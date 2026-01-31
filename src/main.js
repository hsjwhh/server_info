import { createApp } from 'vue'             // 引入 Vue 核心 API：createApp，用于创建应用实例
import App from './App.vue'                 // 引入根组件 App.vue，整个应用的最外层组件
import router from './router'           // 引入我们自己定义的路由实例（在 router/index.js 里创建并导出）

// import ElementPlus from 'element-plus'      // 引入 Element Plus 组件库本体（JS 部分）
// import 'element-plus/dist/index.css'        // 引入 Element Plus 的全局样式（CSS 部分）
// import './style.css'

import { createVuestic } from 'vuestic-ui'
import { createIconsConfig, VuesticIconAliases, VuesticIconFonts } from 'vuestic-ui'

import 'vuestic-ui/dist/vuestic-ui.css'
// 可选：全局图标字体（企业后台常用）
import '@mdi/font/css/materialdesignicons.min.css'

createApp(App)                              // 创建一个 Vue 应用实例，根组件是 App.vue
    .use(router)                            // 在应用中注册 Vue Router 插件，这样整个应用就具备路由能力
    .use(createVuestic({
        config: {
            icons: createIconsConfig({
                aliases: VuesticIconAliases,
                fonts: [
                    // 支持 @mdi/font（class 名称例如 `mdi mdi-home`）
                    {
                        name: 'mdi-{icon}',
                        resolve: ({ icon }) => ({ class: `mdi mdi-${icon}` }),
                    },
                    // 直接使用图标名作为回退，例如 `home` -> `mdi mdi-home`
                    {
                        name: '{icon}',
                        resolve: ({ icon }) => ({ class: `mdi mdi-${icon}` }),
                    },
                    // 保留 Vuestic 默认的 material-icons 映射作为回退
                    ...VuesticIconFonts,
                ],
            }),
        },
    }))
    // .use(ElementPlus)                      // 在应用中注册 Element Plus 组件库
    .mount('#app')                          // 将应用挂载到 index.html 里的 <div id="app"></div> 节点上，页面正式开始渲染