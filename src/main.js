import { createApp } from 'vue'             // 引入 Vue 核心 API：createApp，用于创建应用实例
import App from './App.vue'                 // 引入根组件 App.vue，整个应用的最外层组件
import router from './router'           // 引入我们自己定义的路由实例（在 router/index.js 里创建并导出）

// import ElementPlus from 'element-plus'      // 引入 Element Plus 组件库本体（JS 部分）
// import 'element-plus/dist/index.css'        // 引入 Element Plus 的全局样式（CSS 部分）
import './style.css'

import { createVuestic } from 'vuestic-ui'
import { createIconsConfig, VuesticIconAliases, VuesticIconFonts } from 'vuestic-ui'

import 'vuestic-ui/dist/vuestic-ui.css'
// 可选：全局图标字体（企业后台常用）
import '@mdi/font/css/materialdesignicons.min.css'

// ...前面的 import 保持不变

createApp(App)
    .use(router)
    .use(createVuestic({
        config: {
            icons: createIconsConfig({
                aliases: [
                    // ⚠️ 注意：自定义覆盖必须放在最前面！拦截默认解析
                    { name: 'va-clear', to: 'mdi-close-circle' },       // 解决 Input clearable 隐身问题
                    { name: 'va-close', to: 'mdi-close' },              // 弹窗关闭按钮
                    { name: 'va-arrow-down', to: 'mdi-chevron-down' },  // Select 下拉箭头
                    { name: 'va-arrow-up', to: 'mdi-chevron-up' },
                    { name: 'va-arrow-right', to: 'mdi-chevron-right' },
                    { name: 'va-arrow-left', to: 'mdi-chevron-left' },
                    { name: 'va-calendar', to: 'mdi-calendar' },        // 日期选择器
                    { name: 'va-warning', to: 'mdi-alert-circle' },     // 警告
                    { name: 'va-error', to: 'mdi-alert' },              // 错误
                    
                    // ⬇️ 默认别名垫底，作为其他未覆盖图标的回退
                    ...VuesticIconAliases, 
                ],
                fonts: [
                    // 支持 @mdi/font（class 名称例如 `mdi mdi-home`）
                    {
                        name: 'mdi-{icon}',
                        resolve: ({ icon }) => ({ class: `mdi mdi-${icon}` }),
                    },
                    // 直接使用图标名作为回退
                    {
                        name: '{icon}',
                        resolve: ({ icon }) => ({ class: `mdi mdi-${icon}` }),
                    },
                    ...VuesticIconFonts,
                ],
            }),
        },
    }))
    .mount('#app')                        // 将应用挂载到 index.html 里的 <div id="app"></div> 节点上，页面正式开始渲染