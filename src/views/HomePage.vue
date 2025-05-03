<template>
  <div class="app">
    <!-- 头部区域 (无变化) -->
    <div class="divHead">
      <img
        :src="userStore.userAvatarUrl"
        @error="setDefaultAvatar"
        @click="toUserPage"
        class="user-avatar-header"
        alt="用户头像"
      />
    </div>

    <!-- 标题区域 (无变化) -->
    <div class="divTitle">
      <div class="divStatic">
        <img src="@/assets/images/logo_green.png" class="logo"/>
        <div class="divDesc">
          <div class="divName">蔬鲜递</div>
          <div class="divSend">
            <span><img src="@/assets/images/time_green.png"/> 当日/次日达</span>
            <span><img src="@/assets/images/money_green.png"/> ¥5配送费(满39免)</span>
            <span><img src="@/assets/images/location_green.png"/> 新鲜直达</span>
          </div>
        </div>
      </div>
      <div class="divInfo">
        为您精选新鲜、时令的优质蔬果
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="divBody">
      <!-- 分类列表 (无变化) -->
      <div class="divType">
        <ul>
          <li v-for="(item, index) in categoryList"
              :key="item.id"
              @click="categoryClick(index, item.id, item.type)"
              :class="{ active: activeType === index }">
            {{ item.name }}
          </li>
        </ul>
      </div>

      <!-- 菜单项列表 -->
      <div class="divMenu">
        <!-- 菜品列表 -->
        <div v-if="currentShowType === 1">
          <!-- 为整个 divItem 添加点击跳转事件 -->
          <div class="divItem" v-for="item in dishList" :key="'dish-' + item.id" @click="goToDetail('dish', item.id)">
            <img :src="imgPathConvert(item.image)" @error="imgError" class="item-image"/>
            <div>
              <div class="divName">{{ item.name }}</div>
              <div class="divDesc" v-if="item.description">{{ item.description }}</div>
              <div class="divOrigin" v-if="item.origin">产地: {{ item.origin }}</div>
              <div class="divBottom">
                <span>￥</span><p>{{ formatPrice(item.price) }}</p>
                <span class="unit" v-if="item.unit">/{{ item.unit }}</span>
              </div>
              <!-- 加减按钮区域 -->
              <div class="divNum">
                 <!-- 为加减按钮添加 .stop 修饰符，防止点击它们时触发父元素的跳转事件 -->
                <div class="divSubtract" v-if="item.number > 0">
                  <img src="@/assets/images/subtract_green.png" @click.prevent.stop="subtractCart(item)"/>
                </div>
                <div class="divDishNum" v-if="item.number > 0">{{ item.number }}</div>
                <div class="divAdd">
                   <!-- 为加减按钮添加 .stop 修饰符 -->
                  <img src="@/assets/images/add_green.png" @click.prevent.stop="addCart(item)"/>
                </div>
              </div>
            </div>
          </div>
          <div v-if="dishList.length === 0 && !loadingItems" class="nodata">该分类下暂无菜品</div>
        </div>

        <!-- 套餐列表 -->
        <div v-if="currentShowType === 2">
           <!-- 为整个 divItem 添加点击跳转事件 -->
          <div class="divItem" v-for="item in setmealList" :key="'setmeal-' + item.id" @click="goToDetail('setmeal', item.id)">
             <img :src="imgPathConvert(item.image)" @error="imgError" class="item-image"/>
            <div>
              <div class="divName">{{ item.name }}</div>
              <div class="divDesc" v-if="item.description">{{ item.description }}</div>
              <div class="divBottom">
                <span>￥</span><p>{{ formatPrice(item.price) }}</p>
              </div>
              <!-- 加减按钮区域 -->
              <div class="divNum">
                 <!-- 为加减按钮添加 .stop 修饰符 -->
                <div class="divSubtract" v-if="item.number > 0">
                  <img src="@/assets/images/subtract_green.png" @click.prevent.stop="subtractCart(item)"/>
                </div>
                <div class="divDishNum" v-if="item.number > 0">{{ item.number }}</div>
                <div class="divAdd">
                   <!-- 为加减按钮添加 .stop 修饰符 -->
                  <img src="@/assets/images/add_green.png" @click.prevent.stop="addCart(item)"/>
                </div>
              </div>
            </div>
          </div>
          <div v-if="setmealList.length === 0 && !loadingItems" class="nodata">该分类下暂无套餐</div>
        </div>
        <div v-if="loadingItems" class="loading-items">加载中...</div>
      </div>
    </div>

    <!-- 购物车栏 (无变化) -->
    <div class="divCart" v-if="categoryList.length > 0">
      <!-- ... (购物车栏结构保持不变) ... -->
      <div :class="{ imgCartActive: cartData.length > 0, imgCart: cartData.length === 0 }" @click="openCart"></div>
      <div :class="{ divGoodsNum: true, moreGoods: computedGoodsNumValue > 99 }" v-if="cartData.length > 0">
        {{ computedGoodsNumDisplay }}
      </div>
      <div class="divNum">
        <span>￥</span>
        <span>{{ formatPrice(computedGoodsPrice) }}</span>
      </div>
      <div :class="{ btnSubmitActive: cartData.length > 0, btnSubmit: cartData.length === 0 }" @click="toAddOrderPage">
        去结算
      </div>
    </div>

    <!-- 购物车弹出层 (无变化) -->
    <van-popup v-model:show="cartDialogShow" position="bottom" :style="{ height: '60%' }" round>
        <!-- ... (购物车弹出层内部结构保持不变) ... -->
         <div class="divCartPopup" style="padding: 10px 16px;">
            <div class="divCartTitle" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #eee; margin-bottom: 10px; font-size: 16px;">
                <span>购物车</span>
                <span @click="clearCart" style="cursor: pointer; color: #999; font-size: 14px;">
                    <van-icon name="delete-o" style="vertical-align: middle; margin-right: 2px;"/> 清空
                </span>
            </div>
            <div class="divCartContent" style="max-height: calc(60vh - 60px); overflow-y: auto;">
                <div v-if="cartData.length === 0" class="divCartEmpty" style="text-align: center; padding: 40px; color: #999;">
                    购物车还是空的哦~
                </div>
                <div v-else class="divCartItem" v-for="(item) in cartData" :key="'cart-' + item.id" style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #ebedf0;">
                    <img :src="imgPathConvert(item.image)" @error="imgError" style="width: 50px; height: 50px; flex-shrink: 0; margin-right: 10px; border-radius: 4px; object-fit: cover;"/>
                    <div class="divDesc" style="flex-grow: 1;">
                    <div class="name" style="font-size: 14px; margin-bottom: 5px; color: #323233;">{{ item.name }}</div>
                    </div>
                    <div class="divControl" style="display: flex; align-items: center;">
                    <span style="font-size: 14px; color: #ee0a24; margin-right: 10px;">￥{{ formatPrice((item.amount || 0) * (item.number || 0)) }}</span>
                    <div class="divNum" style="display: flex; align-items: center;">
                        <div class="divSubtract" style="margin-right: 5px;">
                        <img src="@/assets/images/subtract_green.png" style="width: 20px; height: 20px; vertical-align: middle;" @click.prevent.stop="subtractCart(item)"/>
                        </div>
                        <div class="divDishNum" style="min-width: 20px; text-align: center;"><p>{{ item.number }}</p></div>
                        <div class="divAdd" style="margin-left: 5px;">
                        <img src="@/assets/images/add_green.png" style="width: 20px; height: 20px; vertical-align: middle;" @click.prevent.stop="addCart(item)"/>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </van-popup>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';                 // 保持引入 useRouter
import { showToast, showNotify } from 'vant';             // 保持引入 Vant 轻提示
import {
  categoryListApi,
  dishListApi,
  setmealListApi,
  cartListApi,
  addCartApi,
  updateCartApi,
  clearCartApi
} from '@/api/index.js';                                // 确保 API 文件路径正确
import defaultImage from '@/assets/images/noImg.png';     // 引入默认图片
import defaultAvatar from '@/assets/images/default-avatar.png'; // 引入默认头像
import { useUserStore } from '@/stores/user';             // 引入用户状态

const router = useRouter();                             // 获取 router 实例
const userStore = useUserStore();                         // 获取用户 store 实例
const activeType = ref(0);                               // 当前激活的分类索引 (无变化)
const categoryList = ref([]);                           // 分类列表数据 (无变化)
const categoryId = ref(undefined);                       // 当前选中的分类ID (无变化)
const currentShowType = ref(1);                          // 当前展示的列表类型 (1菜品, 2套餐) (无变化)
const dishList = ref([]);                                // 菜品列表数据 (无变化)
const setmealList = ref([]);                             // 套餐列表数据 (无变化)
const cartData = ref([]);                                // 购物车数据 (无变化)
const cartDialogShow = ref(false);                        // 购物车弹窗显示状态 (无变化)
const loadingItems = ref(false);                         // 列表项加载状态 (无变化)
const backendBaseUrl = 'http://localhost:9000';          // 后端基础URL (无变化)

// --- 工具函数 (无变化) ---
const formatPrice = (price) => { /* ... (保持不变) ... */
    if (typeof price !== 'number' || isNaN(price)) {
        const num = parseFloat(price);
        if (isNaN(num)) return '0.00';
        return num.toFixed(2);
    }
    return price.toFixed(2);
};
const imgPathConvert = (path) => path ? `${backendBaseUrl}/api/common/download?name=${encodeURIComponent(path)}` : defaultImage;
const imgError = (event) => { event.target.src = defaultImage; };
const setDefaultAvatar = (event) => { event.target.src = defaultAvatar; };

// --- 计算属性 (无变化) ---
const computedGoodsNumValue = computed(() => cartData.value.reduce((sum, item) => sum + (item.number || 0), 0));
const computedGoodsNumDisplay = computed(() => (computedGoodsNumValue.value > 99 ? '99+' : computedGoodsNumValue.value));
const computedGoodsPrice = computed(() => cartData.value.reduce((sum, item) => sum + (item.amount || 0) * (item.number || 0), 0));

// --- UI 更新逻辑 (无变化) ---
const updateItemsWithCart = (itemList) => { /* ... (保持不变) ... */
   if (!Array.isArray(itemList)) return;
    const cartMap = new Map();
    cartData.value.forEach(cartItem => {
        if (cartItem.dishId) cartMap.set(`dish_${cartItem.dishId}`, cartItem.number);
        if (cartItem.setmealId) cartMap.set(`setmeal_${cartItem.setmealId}`, cartItem.number);
    });
    itemList.forEach(item => {
        const key = currentShowType.value === 1 ? `dish_${item.id}` : `setmeal_${item.id}`;
        item.number = cartMap.get(key) || 0;
    });
};
const updateUIDisplay = () => { /* ... (保持不变) ... */
 updateItemsWithCart(dishList.value);
 updateItemsWithCart(setmealList.value);
};

// --- 数据获取 (无变化) ---
const getCartData = async () => { /* ... (保持不变, 注意内部调用了 updateUIDisplay) ... */
  console.log("[购物车调试] getCartData: 正在获取购物车数据...");
  try {
    const response = await cartListApi({});
    if (response?.data?.code === 1 && Array.isArray(response.data.data)) {
      cartData.value = response.data.data;
    } else {
      cartData.value = [];
    }
    updateUIDisplay();
  } catch (error) {
    cartData.value = [];
    updateUIDisplay();
    console.error('[购物车调试] getCartData: 获取购物车数据时出错:', error);
  }
};
const getDishList = async () => { /* ... (保持不变) ... */
 if (!categoryId.value) return;
  loadingItems.value = true;
  setmealList.value = []; // 清空另一类型列表
  try {
    const response = await dishListApi({ categoryId: categoryId.value, status: 1 });
    if (response?.data?.code === 1) {
      dishList.value = (response.data.data || []).map(item => ({ ...item, number: 0 }));
      updateItemsWithCart(dishList.value); // 用购物车数据更新数量
    } else {
      showNotify({ type: 'warning', message: response?.data?.msg || '加载菜品失败' });
      dishList.value = [];
    }
  } catch (error) {
    showNotify({ type: 'danger', message: '加载菜品列表时出错' });
    dishList.value = [];
  } finally {
    loadingItems.value = false;
  }
};
const getSetmealList = async () => { /* ... (保持不变) ... */
   if (!categoryId.value) return;
   loadingItems.value = true;
   dishList.value = []; // 清空另一类型列表
   try {
    const response = await setmealListApi({ categoryId: categoryId.value, status: 1 });
     if (response?.data?.code === 1) {
      setmealList.value = (response.data.data || []).map(item => ({ ...item, number: 0 }));
       updateItemsWithCart(setmealList.value); // 用购物车数据更新数量
     } else {
      showNotify({ type: 'warning', message: response?.data?.msg || '加载套餐失败' });
      setmealList.value = [];
     }
   } catch (error) {
    showNotify({ type: 'danger', message: '加载套餐列表时出错' });
    setmealList.value = [];
   } finally {
     loadingItems.value = false;
   }
};
const loadItemsByCategory = () => { /* ... (保持不变) ... */
 if (currentShowType.value === 1) {
    getDishList();
  } else {
    getSetmealList();
  }
};
const categoryClick = (index, id, type) => { /* ... (保持不变) ... */
 if (activeType.value === index) return; // 防止重复点击
  activeType.value = index;
  categoryId.value = id;
  currentShowType.value = type;
  loadItemsByCategory();
};

// --- 购物车操作 (逻辑基本不变, 仅为保持完整性) ---
const addCart = async (item) => { /* ... (保持你之前调试好的 addCart 逻辑) ... */
  let params = {};
  // 根据 item 来源（主列表或购物车弹窗）准备 params
  if (item.dishId || item.setmealId) { // 来自购物车
     params = { dishId: item.dishId, setmealId: item.setmealId, amount: item.amount, name: item.name, image: item.image };
  } else if (item.id) { // 来自主列表
     params = { amount: item.price, name: item.name, image: item.image, dishId: currentShowType.value === 1 ? item.id : undefined, setmealId: currentShowType.value === 2 ? item.id : undefined };
  } else { showNotify({ type: 'danger', message: '商品信息无效' }); return; }
  // 清理和验证 params... (与你之前版本一致)
  if (params.dishId === undefined) delete params.dishId; if (params.setmealId === undefined) delete params.setmealId; if (!params.dishId && !params.setmealId) { showNotify({type:'danger', message:'商品ID错误'}); return; } const itemAmount = parseFloat(params.amount); if(isNaN(itemAmount) || itemAmount<0){showNotify({type:'danger', message:'商品价格无效'});return;} params.amount = itemAmount;

  try {
    const response = await addCartApi(params);
    if (response?.data?.code === 1) { await getCartData(); showToast('添加成功'); }
    else { showNotify({ type: 'warning', message: response?.data?.msg || '添加失败' }); }
  } catch (error) { showNotify({ type: 'danger', message: '添加购物车时出错' }); }
};
const subtractCart = async (item) => { /* ... (保持你之前调试好的 subtractCart 逻辑) ... */
 let params = {};
  // 根据 item 来源准备 params
 if (item.dishId || item.setmealId) { // 来自购物车
     params = { dishId: item.dishId, setmealId: item.setmealId };
  } else if (item.id) { // 来自主列表
     params = { dishId: currentShowType.value === 1 ? item.id : undefined, setmealId: currentShowType.value === 2 ? item.id : undefined };
  } else { showNotify({ type: 'danger', message: '商品信息无效' }); return; }
  // 清理和验证 params... (与你之前版本一致)
 if (params.dishId === undefined) delete params.dishId; if (params.setmealId === undefined) delete params.setmealId; if (!params.dishId && !params.setmealId) { showNotify({type:'danger', message:'商品ID错误'}); return; }
 // 查找购物车验证数量 > 0
 const currentItemInCart = cartData.value.find(ci => (params.dishId && ci.dishId === params.dishId) || (params.setmealId && ci.setmealId === params.setmealId)); if (!currentItemInCart || currentItemInCart.number <= 0) { return; }

  try {
    const response = await updateCartApi(params); // 后端处理减1
    if (response?.data?.code === 1) { await getCartData(); }
    else { showNotify({ type: 'warning', message: response?.data?.msg || '减少失败' }); }
  } catch (error) { showNotify({ type: 'danger', message: '减少商品时出错' }); }
};
const openCart = () => { /* ... (保持不变) ... */
  if (cartData.value.length > 0) cartDialogShow.value = true;
  else showToast('购物车是空的哦~');
};
const clearCart = async () => { /* ... (保持不变) ... */
  if (cartData.value.length === 0) return;
  try {
    const response = await clearCartApi();
    if (response?.data?.code === 1) { cartData.value = []; cartDialogShow.value = false; updateUIDisplay(); showToast('购物车已清空');}
    else { showNotify({ type: 'warning', message: response?.data?.msg || '清空失败' });}
  } catch (error) { showNotify({ type: 'danger', message: '清空购物车时出错' }); }
};
const toAddOrderPage = () => { /* ... (保持不变) ... */
 if (cartData.value.length > 0) router.push('/add-order');
 else showToast('购物车还是空的呢~');
};
const toUserPage = () => { router.push('/user'); };

// --- *** 新增导航到详情页的函数 *** ---
const goToDetail = (type, id) => {
  if (!id || !type) { console.error("无法导航：无效的类型或ID。", type, id); return; }
  console.log(`导航到详情页, 类型: ${type}, ID: ${id}`);
  router.push({ name: 'ProductDetail', params: { type, id } }); // 使用路由名称和参数进行跳转
};

// --- 生命周期钩子与监听器 (无变化) ---
const initPageData = async () => { /* ... (保持不变, 处理分类和购物车数据加载) ... */
 try {
    const results = await Promise.allSettled([categoryListApi(), cartListApi({})]); // 并行获取分类和购物车
    const categoryResult = results[0]; 
    // 处理分类结果...
    if (categoryResult.status === 'fulfilled' && categoryResult.value?.data?.code === 1) {
      categoryList.value = categoryResult.value.data.data || [];
      if (categoryList.value.length > 0) { /* 设置默认选中分类 */ activeType.value = 0; categoryId.value = categoryList.value[0].id; currentShowType.value = categoryList.value[0].type; }
    } else { /* 处理错误 */ console.error("加载分类失败:", categoryResult.reason || categoryResult.value?.data?.msg); showNotify({ type: 'danger', message: '加载分类失败' }); }
    // 处理购物车结果 (调用 getCartData)
    await getCartData();
    // 加载初始分类的商品
    if (categoryId.value) { loadItemsByCategory(); }
  } catch (error) { /* 处理意外错误 */ console.error("页面初始化出错:", error); showNotify({ type: 'danger', message: '页面初始化出错' });}
};
onMounted(() => { /* ... (保持不变, 处理登录判断和初始化调用) ... */
 if (!userStore.userId) {
    userStore.loadUserFromStorage();
    if (!userStore.userId) { router.replace({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } }); }
    else { initPageData(); }
  } else { initPageData(); }
});
watch(() => userStore.userId, (newUserId, oldUserId) => { /* ... (保持不变, 处理用户登录/登出后的数据刷新或清理) ... */
   if (newUserId && !oldUserId) initPageData(); // 登录后刷新
   else if (!newUserId && oldUserId) { /* 清理列表和购物车数据 */ categoryList.value = []; dishList.value = []; setmealList.value = []; cartData.value = []; } // 登出后清理
});
</script>

<style scoped>
/* --- 样式保持不变，可以为列表项添加鼠标手势 --- */
.divItem {
    cursor: pointer; /* 在PC端模拟时显示可点击手势 */
}
/* ... (你现有的其他样式) ... */
.app { height: 100vh; display: flex; flex-direction: column; background-color: #f8fbf6; overflow: hidden; }
.app .divHead { background: linear-gradient(to bottom, #a8e063, #56ab2f); height: 80px; position: relative; flex-shrink: 0; }
.app .divHead img.user-avatar-header { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; object-fit: cover; }
.app .divTitle { width: calc(100% - 30px); background: #ffffff; border-radius: 8px; box-shadow: 0 3px 8px rgba(139, 195, 74, 0.15); position: absolute; left: 15px; right: 15px; top: 60px; transform: none; z-index: 10; padding: 12px 15px; box-sizing: border-box; }
.app .divTitle .divStatic { display: flex; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #eef3e8; }
.app .divTitle .divStatic .logo { width: 45px; height: 45px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; }
.app .divTitle .divStatic .divDesc { display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }
.app .divTitle .divStatic .divDesc .divName { font-size: 18px; font-weight: 600; color: #333333; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app .divTitle .divStatic .divDesc .divSend { font-size: 11px; color: #757575; line-height: 1.4; display: flex; flex-wrap: wrap; gap: 4px 8px; }
.app .divTitle .divStatic .divDesc .divSend img { width: 13px; height: 13px; vertical-align: middle; margin-right: 3px; margin-bottom: 1px; }
.app .divTitle .divInfo { font-size: 12px; color: #666; line-height: 1.4; padding-top: 8px; }
.app .divBody { display: flex; flex-grow: 1; padding-top: calc(60px + 100px + 10px); /* 顶部空白区域 */ overflow: hidden; box-sizing: border-box; }
.app .divBody .divType { width: 84px; background: #f8fbf6; flex-shrink: 0; height: 100%; overflow-y: auto; padding-bottom: 60px; box-sizing: border-box; }
.app .divBody .divType ul { padding-top: 10px; list-style: none; margin: 0; padding-left: 0; }
.app .divBody .divType ul li { padding: 14px 10px; font-size: 13px; color: #555; line-height: 1.4; border-left: 3px solid transparent; cursor: pointer; transition: all 0.2s ease-in-out; word-break: break-all; }
.app .divBody .divType ul li.active { color: #388e3c; background-color: #ffffff; font-weight: 500; border-left-color: #4CAF50; }
.app .divBody .divMenu { background-color: #ffffff; flex-grow: 1; height: 100%; overflow-y: auto; padding-bottom: 60px; /* 留出购物车栏空间 */ box-sizing: border-box; }
.app .divBody .divMenu > div { padding-top: 10px; }
.app .divBody .divMenu .divItem { margin: 0 15px 20px 15px; display: flex; padding-bottom: 15px; border-bottom: 1px solid #f0f3f0; }
.app .divBody .divMenu .divItem:last-child { border-bottom: none; }
.app .divBody .divMenu .divItem .item-image { width: 75px; height: 75px; margin-right: 12px; flex-shrink: 0; border-radius: 5px; object-fit: cover; }
.app .divBody .divMenu .divItem > div:last-of-type { position: relative; flex-grow: 1; display: flex; flex-direction: column; min-width: 0; }
.app .divBody .divMenu .divItem .divName { font-size: 15px; font-weight: 500; color: #333333; line-height: 1.4; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app .divBody .divMenu .divItem .divDesc { font-size: 12px; color: #888; line-height: 1.3; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
.app .divBody .divMenu .divItem .divOrigin { font-size: 11px; color: #aaa; line-height: 1.3; margin-bottom: 6px; }
.app .divBody .divMenu .divItem .divBottom { font-family: 'Arial', sans-serif; color: #e64a19; line-height: 1; margin-top: auto; /* 将价格推到底部 */ display: flex; align-items: baseline; padding-top: 5px; }
.app .divBody .divMenu .divItem .divBottom span:first-child { font-size: 12px; margin-right: 1px; font-weight: normal; }
.app .divBody .divMenu .divItem .divBottom p { font-size: 16px; font-weight: bold; margin: 0; line-height: 1; }
.app .divBody .divMenu .divItem .divBottom .unit { font-size: 12px; color: #999; font-weight: normal; margin-left: 3px; }
.app .divBody .divMenu .divItem .divNum { display: flex; align-items: center; position: absolute; right: 0; bottom: -5px; } /* 调整按钮位置 */
.app .divBody .divMenu .divItem .divNum .divSubtract, .app .divBody .divMenu .divItem .divNum .divAdd { display: flex; align-items: center; justify-content: center; }
.app .divBody .divMenu .divItem .divNum img { width: 22px; height: 22px; cursor: pointer; }
.app .divBody .divMenu .divItem .divNum .divDishNum { font-size: 15px; font-weight: 500; color: #555; min-width: 24px; text-align: center; margin: 0 4px; padding: 0 2px; line-height: 22px; }
.app .divBody .divMenu .nodata, .app .divBody .divMenu .loading-items { text-align: center; color: #999; padding: 30px 15px; font-size: 14px; }
.app .divCart { width: calc(100% - 30px); height: 50px; background: #404040; border-radius: 25px; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2); position: fixed; left: 15px; right: 15px; bottom: 15px; z-index: 100; display: flex; align-items: center; padding: 0 10px 0 60px; /* 留出左侧图标空间 */ box-sizing: border-box; }
.app .divCart > div:first-child { position: absolute; left: 0px; bottom: -5px; width: 65px; height: 65px; cursor: pointer; background-size: 50px 50px; background-repeat: no-repeat; background-position: center; z-index: 101; }
.app .divCart .imgCartActive { background-image: url('@/assets/images/bag_green.png'); }
.app .divCart .imgCart { background-image: url('@/assets/images/bag_grey.png'); }
.app .divCart .divGoodsNum { min-width: 18px; height: 18px; padding: 0 5px; background: #f44336; border-radius: 9px; text-align: center; font-size: 11px; color: #ffffff; line-height: 18px; position: absolute; left: 45px; top: -5px; border: 1px solid white; box-sizing: border-box; z-index: 102; }
.app .divCart .divNum { font-weight: 500; color: #ffffff; flex-grow: 1; text-align: left; padding-left: 15px; display: flex; align-items: baseline; }
.app .divCart .divNum span:first-child { font-size: 14px; margin-right: 2px; }
.app .divCart .divNum span:last-of-type { font-size: 18px; font-weight: bold; }
.app .divCart > div:last-of-type { width: 100px; height: 40px; border-radius: 20px; font-size: 15px; font-weight: 500; text-align: center; line-height: 40px; flex-shrink: 0; cursor: pointer; transition: background-color 0.2s; }
.app .divCart .btnSubmit { color: #bdbdbd; background: #616161; cursor: not-allowed; }
.app .divCart .btnSubmitActive { color: white; background: #4CAF50; }
.app .divCart .btnSubmitActive:active { background: #388e3c; } /* 点击效果 */
/* 购物车弹窗样式 */
.divCartPopup { padding: 10px 16px; display: flex; flex-direction: column; height: 100%; }
.divCartTitle { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #eee; margin-bottom: 10px; font-size: 16px; flex-shrink: 0; }
.divCartTitle span:last-child { cursor: pointer; color: #999; font-size: 14px; display: flex; align-items: center; }
.divCartTitle span:last-child .van-icon { margin-right: 2px; }
.divCartContent { flex-grow: 1; overflow-y: auto; }
.divCartEmpty { text-align: center; padding: 40px 0; color: #999; font-size: 14px; }
.divCartItem { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #ebedf0; }
.divCartItem:last-child { border-bottom: none; }
.divCartItem img { width: 50px; height: 50px; flex-shrink: 0; margin-right: 10px; border-radius: 4px; object-fit: cover; }
.divCartItem .divDesc { flex-grow: 1; min-width: 0; }
.divCartItem .divDesc .name { font-size: 14px; margin-bottom: 5px; color: #323233; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.divCartItem .divControl { display: flex; align-items: center; flex-shrink: 0; }
.divCartItem .divControl > span { font-size: 14px; color: #ee0a24; margin-right: 10px; font-weight: 500; }
.divCartItem .divControl .divNum { display: flex; align-items: center; }
.divCartItem .divControl .divSubtract, .divCartItem .divControl .divAdd { margin: 0 5px; display: flex; align-items: center; justify-content: center; }
.divCartItem .divControl .divNum img { width: 20px; height: 20px; vertical-align: middle; cursor: pointer; }
.divCartItem .divControl .divDishNum { min-width: 20px; text-align: center; font-size: 14px; line-height: 20px; }
.divCartItem .divControl .divDishNum p { margin: 0; }
/* --- 样式保持不变，可以为列表项添加鼠标手势 --- */
.divItem {
    cursor: pointer; /* 在PC端模拟时显示可点击手势 */
}
/* ... (你现有的其他样式) ... */
.app { height: 100vh; display: flex; flex-direction: column; background-color: #f8fbf6; overflow: hidden; }
.app .divHead { background: linear-gradient(to bottom, #a8e063, #56ab2f); height: 80px; position: relative; flex-shrink: 0; }
.app .divHead img.user-avatar-header { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; object-fit: cover; }
.app .divTitle { width: calc(100% - 30px); background: #ffffff; border-radius: 8px; box-shadow: 0 3px 8px rgba(139, 195, 74, 0.15); position: absolute; left: 15px; right: 15px; top: 60px; transform: none; z-index: 10; padding: 12px 15px; box-sizing: border-box; }
.app .divTitle .divStatic { display: flex; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #eef3e8; }
.app .divTitle .divStatic .logo { width: 45px; height: 45px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; }
.app .divTitle .divStatic .divDesc { display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }
.app .divTitle .divStatic .divDesc .divName { font-size: 18px; font-weight: 600; color: #333333; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app .divTitle .divStatic .divDesc .divSend { font-size: 11px; color: #757575; line-height: 1.4; display: flex; flex-wrap: wrap; gap: 4px 8px; }
.app .divTitle .divStatic .divDesc .divSend img { width: 13px; height: 13px; vertical-align: middle; margin-right: 3px; margin-bottom: 1px; }
.app .divTitle .divInfo { font-size: 12px; color: #666; line-height: 1.4; padding-top: 8px; }
.app .divBody { display: flex; flex-grow: 1; padding-top: calc(60px + 100px + 10px); /* 顶部空白区域 */ overflow: hidden; box-sizing: border-box; }
.app .divBody .divType { width: 84px; background: #f8fbf6; flex-shrink: 0; height: 100%; overflow-y: auto; padding-bottom: 60px; box-sizing: border-box; }
.app .divBody .divType ul { padding-top: 10px; list-style: none; margin: 0; padding-left: 0; }
.app .divBody .divType ul li { padding: 14px 10px; font-size: 13px; color: #555; line-height: 1.4; border-left: 3px solid transparent; cursor: pointer; transition: all 0.2s ease-in-out; word-break: break-all; }
.app .divBody .divType ul li.active { color: #388e3c; background-color: #ffffff; font-weight: 500; border-left-color: #4CAF50; }
.app .divBody .divMenu { background-color: #ffffff; flex-grow: 1; height: 100%; overflow-y: auto; padding-bottom: 60px; /* 留出购物车栏空间 */ box-sizing: border-box; }
.app .divBody .divMenu > div { padding-top: 10px; }
.app .divBody .divMenu .divItem { margin: 0 15px 20px 15px; display: flex; padding-bottom: 15px; border-bottom: 1px solid #f0f3f0; }
.app .divBody .divMenu .divItem:last-child { border-bottom: none; }
.app .divBody .divMenu .divItem .item-image { width: 75px; height: 75px; margin-right: 12px; flex-shrink: 0; border-radius: 5px; object-fit: cover; }
.app .divBody .divMenu .divItem > div:last-of-type { position: relative; flex-grow: 1; display: flex; flex-direction: column; min-width: 0; }
.app .divBody .divMenu .divItem .divName { font-size: 15px; font-weight: 500; color: #333333; line-height: 1.4; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app .divBody .divMenu .divItem .divDesc { font-size: 12px; color: #888; line-height: 1.3; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
.app .divBody .divMenu .divItem .divOrigin { font-size: 11px; color: #aaa; line-height: 1.3; margin-bottom: 6px; }
.app .divBody .divMenu .divItem .divBottom { font-family: 'Arial', sans-serif; color: #e64a19; line-height: 1; margin-top: auto; /* 将价格推到底部 */ display: flex; align-items: baseline; padding-top: 5px; }
.app .divBody .divMenu .divItem .divBottom span:first-child { font-size: 12px; margin-right: 1px; font-weight: normal; }
.app .divBody .divMenu .divItem .divBottom p { font-size: 16px; font-weight: bold; margin: 0; line-height: 1; }
.app .divBody .divMenu .divItem .divBottom .unit { font-size: 12px; color: #999; font-weight: normal; margin-left: 3px; }
.app .divBody .divMenu .divItem .divNum { display: flex; align-items: center; position: absolute; right: 0; bottom: -5px; } /* 调整按钮位置 */
.app .divBody .divMenu .divItem .divNum .divSubtract, .app .divBody .divMenu .divItem .divNum .divAdd { display: flex; align-items: center; justify-content: center; }
.app .divBody .divMenu .divItem .divNum img { width: 22px; height: 22px; cursor: pointer; }
.app .divBody .divMenu .divItem .divNum .divDishNum { font-size: 15px; font-weight: 500; color: #555; min-width: 24px; text-align: center; margin: 0 4px; padding: 0 2px; line-height: 22px; }
.app .divBody .divMenu .nodata, .app .divBody .divMenu .loading-items { text-align: center; color: #999; padding: 30px 15px; font-size: 14px; }
.app .divCart { width: calc(100% - 30px); height: 50px; background: #404040; border-radius: 25px; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2); position: fixed; left: 15px; right: 15px; bottom: 15px; z-index: 100; display: flex; align-items: center; padding: 0 10px 0 60px; /* 留出左侧图标空间 */ box-sizing: border-box; }
.app .divCart > div:first-child { position: absolute; left: 0px; bottom: -5px; width: 65px; height: 65px; cursor: pointer; background-size: 50px 50px; background-repeat: no-repeat; background-position: center; z-index: 101; }
.app .divCart .imgCartActive { background-image: url('@/assets/images/bag_green.png'); }
.app .divCart .imgCart { background-image: url('@/assets/images/bag_grey.png'); }
.app .divCart .divGoodsNum { min-width: 18px; height: 18px; padding: 0 5px; background: #f44336; border-radius: 9px; text-align: center; font-size: 11px; color: #ffffff; line-height: 18px; position: absolute; left: 45px; top: -5px; border: 1px solid white; box-sizing: border-box; z-index: 102; }
.app .divCart .divNum { font-weight: 500; color: #ffffff; flex-grow: 1; text-align: left; padding-left: 15px; display: flex; align-items: baseline; }
.app .divCart .divNum span:first-child { font-size: 14px; margin-right: 2px; }
.app .divCart .divNum span:last-of-type { font-size: 18px; font-weight: bold; }
.app .divCart > div:last-of-type { width: 100px; height: 40px; border-radius: 20px; font-size: 15px; font-weight: 500; text-align: center; line-height: 40px; flex-shrink: 0; cursor: pointer; transition: background-color 0.2s; }
.app .divCart .btnSubmit { color: #bdbdbd; background: #616161; cursor: not-allowed; }
.app .divCart .btnSubmitActive { color: white; background: #4CAF50; }
.app .divCart .btnSubmitActive:active { background: #388e3c; } /* 点击效果 */
/* 购物车弹窗样式 */
.divCartPopup { padding: 10px 16px; display: flex; flex-direction: column; height: 100%; }
.divCartTitle { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #eee; margin-bottom: 10px; font-size: 16px; flex-shrink: 0; }
.divCartTitle span:last-child { cursor: pointer; color: #999; font-size: 14px; display: flex; align-items: center; }
.divCartTitle span:last-child .van-icon { margin-right: 2px; }
.divCartContent { flex-grow: 1; overflow-y: auto; }
.divCartEmpty { text-align: center; padding: 40px 0; color: #999; font-size: 14px; }
.divCartItem { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #ebedf0; }
.divCartItem:last-child { border-bottom: none; }
.divCartItem img { width: 50px; height: 50px; flex-shrink: 0; margin-right: 10px; border-radius: 4px; object-fit: cover; }
.divCartItem .divDesc { flex-grow: 1; min-width: 0; }
.divCartItem .divDesc .name { font-size: 14px; margin-bottom: 5px; color: #323233; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.divCartItem .divControl { display: flex; align-items: center; flex-shrink: 0; }
.divCartItem .divControl > span { font-size: 14px; color: #ee0a24; margin-right: 10px; font-weight: 500; }
.divCartItem .divControl .divNum { display: flex; align-items: center; }
.divCartItem .divControl .divSubtract, .divCartItem .divControl .divAdd { margin: 0 5px; display: flex; align-items: center; justify-content: center; }
.divCartItem .divControl .divNum img { width: 20px; height: 20px; vertical-align: middle; cursor: pointer; }
.divCartItem .divControl .divDishNum { min-width: 20px; text-align: center; font-size: 14px; line-height: 20px; }
.divCartItem .divControl .divDishNum p { margin: 0; }
</style>