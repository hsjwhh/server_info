import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const pinia = createPinia()

import './style.css'
import { createVuestic } from 'vuestic-ui'
import { createIconsConfig, VuesticIconAliases, VuesticIconFonts } from 'vuestic-ui'

import 'vuestic-ui/dist/vuestic-ui.css'
// @mdi/font 已迁移至 index.html CDN 引入，此处不再 import
// import '@mdi/font/css/materialdesignicons.min.css'

createApp(App)
    .use(pinia)
    .use(router)
    .use(createVuestic({
        config: {
            icons: createIconsConfig({
                aliases: [
                    // 必须放在最前面：优先命中自定义映射，避免被默认别名吞掉，
                    // 否则 clear/close/arrow 等基础图标会出现不显示或映射错误。
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
    .mount('#app')
