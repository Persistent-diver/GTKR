import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../data/auth.js'
import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import KeywordView from '../views/keyword.vue'
import LoginView from '../views/login.vue'
import MineView from '../views/mine.vue'
import ProductView from '../views/product.vue'
import TaskView from '../views/task.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', redirect: { name: 'keywords' } },
        {
          path: 'radar',
          redirect: (to) => {
            if (to.query.mode === 'product') return { name: 'product', query: {} }
            const keyword = to.query.keyword
            return typeof keyword === 'string' && keyword
              ? { name: 'keywords', query: { keyword } }
              : { name: 'keywords', query: {} }
          },
        },
        { path: 'keywords', name: 'keywords', component: KeywordView, meta: { title: '关键词模式' } },
        { path: 'product', name: 'product', component: ProductView, meta: { title: '产品+描述模式' } },
        { path: 'tasks', name: 'tasks', component: TaskView, meta: { title: '任务列表' } },
        { path: 'me', name: 'me', component: MineView, meta: { title: '我的' } },
        { path: 'board', name: 'board', component: HomeView, meta: { title: '分析报告' } },
      ],
    },
    { path: '/login', name: 'login', component: LoginView, meta: { title: '认证通道' } },
  ],
})

const BASE_TITLE = '跨境出海关键词雷达'

router.afterEach((to) => {
  document.title = to.meta.title ? `${BASE_TITLE} - ${to.meta.title}` : `${BASE_TITLE}`
})

router.beforeEach((to) => {
  const sharedBoard = to.name === 'board' && Boolean(to.query.share)
  if (!auth.loggedIn && to.name !== 'login' && !sharedBoard) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (auth.loggedIn && to.name === 'login') {
    return { name: 'keywords' }
  }
  return true
})

export default router
