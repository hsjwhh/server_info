import { createApp } from 'vue'             // 引入 Vue 核心 API：createApp，用于创建应用实例
import App from './App.vue'                 // 引入根组件 App.vue，整个应用的最外层组件

import ElementPlus from 'element-plus'      // 引入 Element Plus 组件库本体（JS 部分）
import 'element-plus/dist/index.css'        // 引入 Element Plus 的全局样式（CSS 部分）
import './style.css'

import router from './router'           // 引入我们自己定义的路由实例（在 router/index.js 里创建并导出）
createApp(App)                              // 创建一个 Vue 应用实例，根组件是 App.vue
    .use(router)                            // 在应用中注册 Vue Router 插件，这样整个应用就具备路由能力
    .use(ElementPlus)                       // 在应用中注册 Element Plus 插件，这样所有组件里就可以直接用 el- 系列组件
    .mount('#app')                          // 将应用挂载到 index.html 里的 <div id="app"></div> 节点上，页面正式开始渲染