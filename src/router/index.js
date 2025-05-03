import { createRouter, createWebHistory } from 'vue-router';
import UserInfoPage from '@/views/page/userInfoPage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/HomePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/page/loginPage.vue'),
    meta: { requiresAuth: false }
  },
   {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "register" */ '../views/page/registerPage.vue'),
    meta: { requiresAuth: false }
  },
   {
    path: '/address',
    name: 'Address',
    component: () => import(/* webpackChunkName: "address" */ '../views/page/addressPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/address-edit/:id?',
    name: 'AddressEdit',
    component: () => import(/* webpackChunkName: "address-edit" */ '../views/page/address-editPage.vue'),
    meta: { requiresAuth: true }
   },
   {
    path: '/add-order',
    name: 'AddOrder',
    component: () => import(/* webpackChunkName: "add-order" */ '../views/page/add-orderPage.vue'),
    meta: { requiresAuth: true }
   },
   {
    path: '/order',
    name: 'Order',
    component: () => import(/* webpackChunkName: "order" */ '../views/page/orderPage.vue'),
    meta: { requiresAuth: true }
   },
   {
    path: '/pay-success',
    name: 'PaySuccess',
    component: () => import(/* webpackChunkName: "pay-success" */ '../views/page/pay-successPage.vue'),
    meta: { requiresAuth: true }
   },
   {
    path: '/user',
    name: 'User',
    component: () => import(/* webpackChunkName: "user" */ '../views/page/userPage.vue'),
    meta: { requiresAuth: true }
   },
   {
    path: '/user-info',
    name: 'UserInfo',
    component: UserInfoPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/product/:type/:id',
    name: 'ProductDetail',
    component: () => import(/* webpackChunkName: "product-detail" */ '../views/page/productDetailPage.vue'), // 确保路径正确
    props: true,
    meta: { requiresAuth: true }
  },
   {
    path: '/no-wifi',
    name: 'NoWifi',
    component: () => import(/* webpackChunkName: "no-wifi" */ '../views/page/no-wifyPage.vue'),
    meta: { requiresAuth: false }
   },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // 使用 Vue CLI 的环境变量方式
  // history: createWebHistory(import.meta.env.BASE_URL), // 如果你使用 Vite，请用这行
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // 注意：这里基于 localStorage 判断登录状态，可能与 Pinia/Vuex 状态不同步
  // 最好统一使用 store 来判断登录状态，如 `useUserStore().isLoggedIn`
  const isLoggedIn = !!localStorage.getItem('userId');

  console.log(`路由守卫: 访问 ${to.path}, requiresAuth=${requiresAuth}, isLoggedIn=${isLoggedIn}`);

  if (requiresAuth && !isLoggedIn) {
    console.log(`路由守卫：需要登录，跳转到登录页，重定向目标: ${to.fullPath}`);
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    });
  } else if (to.name === 'Login' && isLoggedIn) {
     console.log('路由守卫：已登录用户访问登录页，重定向到首页');
     next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;