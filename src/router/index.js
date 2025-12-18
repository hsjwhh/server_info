// 从 vue-router 中引入创建路由实例和历史模式的方法
import { createRouter, createWebHistory } from 'vue-router'

// 引入布局组件 AdminLayout，作为后台的统一外壳（含侧边栏 + 内容区）
import AdminLayout from '../layouts/AdminLayout.vue'

// 定义路由表，一个数组，每个元素是一条路由配置
const routes = [
  {
    // 顶层路径为 '/'，表示网站根路径
    path: '/',
    // 访问 '/' 时，首先渲染 AdminLayout 这个布局组件
    component: AdminLayout,
    // children 表示这个布局下的子路由（也就是会渲染在 AdminLayout 内部的 <router-view /> 中）
    children: [
      {
        // 子路由 path 为空字符串，表示这是 '/' 的默认子页面
        // 也就是说，当你访问 '/' 时，会自动渲染这个子路由对应的组件
        path: '',
        // 懒加载 Home 页面组件，只有在真正访问时才会加载对应 JS，提升首屏性能
        component: () => import('../views/Home.vue'),
      },

      // 将来可以在这里继续添加更多子页面，例如：
      // { path: 'sn', component: () => import('../views/SnQuery.vue') }
      // 那么访问 '/sn' 时，就会在 AdminLayout 内部渲染 SnQuery 页面
    ],
  },

  // 如果以后需要登录页、404 页等，不使用 AdminLayout 的页面，可以在这里再加顶层路由
  // 比如：
  // {
  //   path: '/login',
  //   component: () => import('../views/Login.vue'),
  // }
]

// 使用 HTML5 history 模式创建路由实例，URL 会是正常的路径（没有 # 号）
// routes 传入我们上面定义的路由表
export const router = createRouter({
  history: createWebHistory(),
  routes,
})
