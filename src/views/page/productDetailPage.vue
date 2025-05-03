<template>
    <div class="product-detail-page">
      <van-nav-bar
        :title="pageTitle"
        left-arrow
        @click-left="goBack"
        fixed
        placeholder
        class="custom-nav-bar"
      />
  
      <div v-if="loading" class="loading-indicator">
        <van-loading size="30px" vertical color="#4CAF50">加载详情中...</van-loading>
      </div>
  
      <div v-else-if="error" class="error-message">
        <van-empty :description="error || '加载商品详情失败'">
          <van-button type="primary" @click="fetchProductDetails" size="small" class="retry-button" color="#6abf69">点我重试</van-button>
        </van-empty>
      </div>
  
      <div v-else-if="product" class="detail-content-wrapper">
        <div class="image-container">
          <img :src="imgPathConvert(product.image)" @error="imgError" class="product-image" />
        </div>
  
        <div class="main-info-section">
          <div class="title-line">
             <h2 class="product-name">{{ product.name }}</h2>
             <!-- <van-icon name="like-o" size="20" class="favorite-icon" /> -->
          </div>
          <div class="tags-line">
             <van-tag type="success" plain class="custom-tag">新鲜直达</van-tag>
             <van-tag type="primary" plain class="custom-tag" v-if="product.origin">产地: {{ product.origin }}</van-tag>
             <van-tag type="warning" plain class="custom-tag" v-if="product.unit">规格: {{ product.unit }}</van-tag>
             <!-- 可以根据 product.is_organic 等字段动态添加 '有机' '无公害' 等标签 -->
          </div>
          <div class="price-line">
              <span class="currency">￥</span>
              <span class="amount">{{ formatPrice(product.price) }}</span>
              <span v-if="product.unit" class="unit-alt"> / {{ product.unit }}</span>
          </div>
          <!-- 简单销量占位 -->
          <!-- <div class="sales-info">月售 100+</div> -->
        </div>
  
        <!-- 如果是套餐，显示包含菜品 -->
        <div v-if="product.type === 'setmeal' && product.setmealDishes && product.setmealDishes.length > 0" class="details-card setmeal-card">
            <van-divider>套餐包含</van-divider>
            <div class="setmeal-dishes-list">
               <div v-for="dish in product.setmealDishes" :key="'setmeal-dish-' + dish.id" class="setmeal-dish-item">
                 <span>{{ dish.name }}</span>
                 <span>x{{ dish.copies }}份</span>
               </div>
             </div>
         </div>
  
        <!-- 商品详情描述区域 -->
        <div class="details-card">
            <van-divider>商品详情</van-divider>
            <div class="detail-item">
                <span class="detail-label">描<span style="visibility: hidden;">占</span>述</span>
                <span class="detail-value description-value">{{ product.description || '暂无描述信息' }}</span>
            </div>
             <div class="detail-item" v-if="product.origin">
                <span class="detail-label">原产地</span>
                <span class="detail-value">{{ product.origin }}</span>
            </div>
            <div class="detail-item" v-if="product.unit">
                <span class="detail-label">规<span style="visibility: hidden;">占</span>格</span>
                <span class="detail-value">{{ product.unit }}</span>
            </div>
            <div class="detail-item" v-if="product.storageSuggestion">
                <span class="detail-label">存储建议</span>
                <span class="detail-value">{{ product.storageSuggestion }}</span>
              </div>
              <div class="detail-item" v-if="product.shelfLifeDays">
                <span class="detail-label">保质期</span>
                <span class="detail-value">{{ product.shelfLifeDays }} 天</span>
              </div>
              <div class="detail-item" v-if="product.nutritionHighlights">
                <span class="detail-label">营养亮点</span>
                <span class="detail-value">{{ product.nutritionHighlights }}</span>
              </div>
              <div class="detail-item" v-if="product.cookingSuggestion">
                <span class="detail-label">烹饪建议</span>
                <span class="detail-value">{{ product.cookingSuggestion }}</span>
              </div>
        </div>
  
        <!-- 评价区域 (占位) -->
        <div class="details-card reviews-card">
            <van-divider>用户评价</van-divider>
            <div class="review-placeholder">
                <van-icon name="chat-o" size="18" />
                <span>暂无评价信息</span>
            </div>
            <!-- <div class="view-all-reviews">查看全部评价 ></div> -->
        </div>
  
      </div>
  
      <van-action-bar placeholder safe-area-inset-bottom class="custom-action-bar">
        <van-action-bar-icon icon="cart-o" text="购物车" :badge="computedGoodsNumDisplay || ''" @click="goToCart" />
        <van-action-bar-button type="primary" text="加入购物车" @click="addToCartFromDetail" color="#4CAF50" class="add-cart-button" />
      </van-action-bar>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import {
      showToast, showNotify, Loading as VanLoading, Empty as VanEmpty, NavBar as VanNavBar,
      ActionBar as VanActionBar, ActionBarIcon as VanActionBarIcon, ActionBarButton as VanActionBarButton,
      Divider as VanDivider, Button as VanButton,  Tag as VanTag,

  } from 'vant';
  import { getDishDetailApi, getSetmealDetailApi, addCartApi, cartListApi } from '@/api/index.js';
  import defaultImage from '@/assets/images/noImg.png';
  
  
  const route = useRoute();
  const router = useRouter();
  
  const productId = ref(route.params.id);
  const productType = ref(route.params.type);
  const product = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const backendBaseUrl = import.meta.env?.VITE_APP_BASE_API || 'http://localhost:9000';
  const cartData = ref([]);
  
  const pageTitle = computed(() => {
    if (loading.value) return '正在加载...';
    if (error.value) return '商品详情';
    return product.value?.name || '商品详情';
  });
  const computedGoodsNumValue = computed(() => cartData.value.reduce((sum, item) => sum + (item.number || 0), 0));
  const computedGoodsNumDisplay = computed(() => {
      const num = computedGoodsNumValue.value;
      return num > 0 ? (num > 99 ? '99+' : num.toString()) : '';
  });
  
  const formatPrice = (price) => {
     const num = parseFloat(price);
     return isNaN(num) ? '0.00' : num.toFixed(2);
  };
  const imgPathConvert = (path) => {
    if (!path) return defaultImage;
    // 假设后端返回的 image 路径已经是相对路径或绝对 URL
    // 如果只是文件名，需要拼接基础 URL
     if (path.startsWith('http') || path.startsWith('/')) {
        return path; // 已经是 URL 或绝对路径
     } else {
        // 如果 path 只是文件名 (e.g., "spinach.jpg")
        return `${backendBaseUrl}/api/common/download?name=${encodeURIComponent(path)}`;
     }
  };
  const imgError = (event) => {
     event.target.src = defaultImage;
  };
  
  
  const fetchProductDetails = async () => {
      loading.value = true; error.value = null; product.value = null;
      try {
          let response;
          if (productType.value === 'dish') { response = await getDishDetailApi(productId.value); }
          else if (productType.value === 'setmeal') { response = await getSetmealDetailApi(productId.value); }
          else { throw new Error('无效的商品类型'); }
          console.log("后端返回的原始数据 data:", response?.data?.data);
          if (response?.data?.code === 1 && response.data.data) {
             const fetchedData = response.data.data;
             if (productType.value === 'setmeal' && !Array.isArray(fetchedData.setmealDishes)) {
                fetchedData.setmealDishes = [];
             }
             product.value = { ...fetchedData, type: productType.value };
             // 在这里可以根据 fetchedData 的字段（如 is_organic）处理 tags
          } else {
              throw new Error(response?.data?.msg || '无法加载商品详情');
          }
      } catch (err) {
          error.value = err.message;
          showNotify({ type: 'danger', message: `加载失败: ${err.message}` });
      } finally {
          loading.value = false;
      }
  };
  const fetchCartData = async () => {
      try {
          const response = await cartListApi({});
          if (response?.data?.code === 1 && Array.isArray(response.data.data)) {
               cartData.value = response.data.data;
          } else {
               cartData.value = [];
          }
      } catch (err) {
          console.error("获取详情页购物车数据失败:", err);
          cartData.value = [];
      }
  };
  
  const goBack = () => { router.back(); };
  const goToCart = () => {
     // 假设首页是 / 并且它会处理购物车显示
     router.push('/');
     // 或者如果你有专门的购物车页面
     // router.push('/cart');
  };
  
  const addToCartFromDetail = async () => {
      if (!product.value || loading.value || error.value) {
        showToast('商品信息不完整或正在加载');
        return;
      }
      // 确认价格是否为 0，如果是免费商品可能需要不同处理
      if (parseFloat(product.value.price) === 0) {
          // 对于免费商品，可能直接提示用户或不允许加入购物车（除非有特殊逻辑）
          // showToast('该商品为免费体验，无需加入购物车');
          // return;
          // 或者，如果允许加入购物车，确保后端能处理价格为0的情况
          console.log("加入免费商品到购物车");
      }
  
      const params = {
        amount: product.value.price, name: product.value.name, image: product.value.image,
        dishId: productType.value === 'dish' ? product.value.id : undefined,
        setmealId: productType.value === 'setmeal' ? product.value.id : undefined,
      };
      if (!params.dishId && !params.setmealId) {
        showNotify({ type: 'danger', message: '商品ID错误' }); return;
      }
      const itemAmount = parseFloat(params.amount);
      if (isNaN(itemAmount) || itemAmount < 0) { // 价格不能是 NaN 或负数
          showNotify({ type: 'danger', message: '商品价格无效' });
          return;
      }
      params.amount = itemAmount; // 确保传递数字价格给后端
  
      if (params.dishId === undefined) delete params.dishId;
      if (params.setmealId === undefined) delete params.setmealId;
  
      try {
        showToast({ message: '添加中...', type: 'loading', forbidClick: true, duration: 1000 });
        const response = await addCartApi(params);
        if (response?.data?.code === 1) {
            showToast({ message: '添加成功', type: 'success', duration: 1500 });
            await fetchCartData();
        } else {
            showNotify({ type: 'warning', message: response?.data?.msg || '添加失败', duration: 2000 });
        }
      } catch (err) {
        showNotify({ type: 'danger', message: `添加出错: ${err.message}`, duration: 2000 });
      }
  };
  
  onMounted(() => {
      if (productId.value && productType.value) {
          fetchProductDetails();
          fetchCartData();
      } else {
          error.value = '无效的商品信息'; loading.value = false;
          showNotify({ type: 'danger', message: '缺少必要的商品ID或类型参数' });
      }
  });
  
  watch(() => route.params, (newParams) => {
      if (newParams.id && newParams.type && (newParams.id !== productId.value || newParams.type !== productType.value)) {
          productId.value = newParams.id;
          productType.value = newParams.type;
          fetchProductDetails();
          fetchCartData();
      }
  }, { deep: true });
  
  </script>
  
  <style scoped>
  .product-detail-page {
    background-color: #f8fbf6; /* 整体浅绿色背景 */
    min-height: 100vh;
  }
  
  .custom-nav-bar {
    --van-nav-bar-background-color: #ffffff;
    --van-nav-bar-title-text-color: #333;
    --van-nav-bar-icon-color: #6abf69; /* 返回箭头绿色 */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  :deep(.van-nav-bar__title){ font-weight: 500; }
  
  
  .loading-indicator { padding-top: 150px; text-align: center; }
  .error-message { padding-top: 120px; }
  .retry-button { margin-top: 15px; }
  
  .detail-content-wrapper { padding-bottom: 60px; }
  
  .image-container {
    width: 100%;
    aspect-ratio: 1 / 0.8; /* 调整宽高比，更适合蔬菜长图 */
    overflow: hidden;
    background-color: #fff; /* 白色背景 */
  }
  .product-image { display: block; width: 100%; height: 100%; object-fit: contain; /* contain 更适合蔬菜展示 */ }
  
  
  .main-info-section {
    background-color: #ffffff;
    padding: 15px;
    margin: -10px 10px 10px 10px; /* 向上覆盖一点图片底部 */
    border-radius: 8px;
    box-shadow: 0 3px 8px rgba(178, 194, 169, 0.15); /* 柔和阴影 */
    position: relative;
    z-index: 1;
  }
  .title-line{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
  }
  .product-name {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
    flex-grow: 1;
    margin-right: 10px; /* 给右侧图标留空间 */
  }
  .favorite-icon { color: #aaa; cursor: pointer; } /* 收藏图标 */
  
  
  .tags-line {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 12px;
  }
  .custom-tag {
      padding: 2px 6px;
      font-size: 11px;
      border-radius: 4px;
      --van-tag-plain-background-color: #f2fcf3; /* 浅绿背景 */
  }
  .van-tag--success.van-tag--plain{ color: #558b2f; border-color: #c8e6c9; } /* 绿色标签 */
  .van-tag--primary.van-tag--plain{ color: #3f8a4b; border-color: #a5d6a7; } /* 主色标签 (产地) */
  .van-tag--warning.van-tag--plain{ color: #757575; border-color: #e0e0e0; } /* 警告色标签 (规格) */
  
  .price-line {
    color: #e53935; /* 更鲜明的红色 */
    line-height: 1;
    display: flex;
    align-items: baseline;
    margin-bottom: 5px; /* 调整间距 */
  }
  .price-line .currency { font-size: 14px; font-weight: 500; margin-right: 2px; }
  .price-line .amount { font-size: 24px; font-weight: bold; margin-right: 4px;}
  .price-line .unit-alt { font-size: 12px; color: #757575; font-weight: normal; }
  
  
  .details-card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 10px 15px;
    margin: 0 10px 10px 10px;
    box-shadow: 0 2px 6px rgba(178, 194, 169, 0.1);
  }
  .details-card .van-divider {
      margin: 5px 0 15px 0;
      font-size: 15px;
      font-weight: 500;
      color: #388e3c; /* 绿色分隔线标题 */
      border-color: #eef3e8;
      padding: 0; /* 移除 van-divider 默认 padding */
      --van-divider-text-color: #388e3c;
  }
  
  .setmeal-card { padding-bottom: 0; } /* 调整套餐卡片底部填充 */
  .setmeal-dishes-list { padding-bottom: 10px; }
  .setmeal-dish-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 14px;
    color: #444;
  }
  .setmeal-dish-item span:last-child { font-size: 13px; color: #777; }
  
  .detail-item {
      display: flex;
      align-items: flex-start; /* 顶部对齐，适应多行 */
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 10px;
      color: #555;
  }
  .detail-item:last-child { margin-bottom: 0; }
  .detail-label {
      flex-shrink: 0; /* 防止标签被压缩 */
      width: 65px; /* 固定宽度，方便对齐 */
      color: #888;
      margin-right: 15px;
      text-align: justify; /* 两端对齐，配合隐藏文字 */
      text-align-last: justify; /* 兼容 */
      position: relative;
  }
  /* .detail-label::after { content: ':'; position: absolute; right: 0; } */ /* 如果需要冒号 */
  .detail-value { flex-grow: 1; }
  .description-value{
     white-space: pre-wrap; /* 保留换行和空格 */
  }
  
  .reviews-card .van-divider{ color: #666; --van-divider-text-color: #666;}
  .review-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0;
      font-size: 13px;
      color: #aaa;
  }
  .review-placeholder .van-icon { margin-right: 5px; }
  
  .custom-action-bar{
    --van-action-bar-background-color: #ffffff;
    box-shadow: 0 -1px 5px rgba(0,0,0,0.06);
  }
  :deep(.van-action-bar-icon .van-info) {
      background-color: #e53935; /* 角标红色 */
  }
  :deep(.van-action-bar-icon__icon){
      color: #6abf69; /* 购物车图标绿色 */
  }
  .add-cart-button {
     background: linear-gradient(to right, #66bb6a, #4caf50); /* 绿色渐变 */
     border: none;
     font-weight: 500;
  }
  
  </style>