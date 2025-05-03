<template>
  <div class="main-layout">
    <!-- 公共头部 -->
    <AppHeader /> 
    <!-- 主要内容区域，由子路由决定 -->
    <router-view/> 
    <!-- 公共底部购物车/导航 -->
    <CartBar /> 
  </div>
</template>
<script setup>
  import AppHeader from '@/components/AppHeader.vue'; // 假设你创建了这些组件
  import CartBar from '@/components/CartBar.vue';
  import { RouterView } from 'vue-router';
</script>