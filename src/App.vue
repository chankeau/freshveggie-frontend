<template>
  <div id="app">
    <!-- 
      路由视图：这里会根据 URL 动态渲染匹配到的页面组件 
      (例如 HomePage.vue, UserLogin.vue, AddressList.vue 等)
    -->
    <router-view/>
  </div>
</template>

<script setup>
// App.vue 通常保持简洁，全局状态和逻辑可以在这里处理，但页面布局由路由组件负责
// import { RouterView } from 'vue-router'; // 通常是全局注册的
</script>

<style>
/* 全局基础样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f8f8f8; /* 全局背景色 */
  min-height: 100vh;        /* 确保至少占满视口高度 */
}

/* 你可以将 index.css 或 common.css 的核心 reset 内容放在这里 */
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* 其他全局样式，例如链接默认颜色等 */
a {
  color: #0277bd;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>