<template>
  <div class="app user-page">
    <!-- 顶部区域 -->
    <div class="divHead">
      <div class="divTitle">
        <!-- van-icon 在模板中使用，无需在 script 中导入 -->
        <van-icon name="arrow-left" @click="goBack" class="back-icon"/>
        <span>个人中心</span>
      </div>
      <div class="divUser">
         <!-- 使用 Store 的头像 URL -->
         <img
           :src="userStore.userAvatarUrl"
           class="user-avatar clickable"
           alt="User Avatar"
           @error="setDefaultAvatar"
           @click="goToUserInfoPage"
         />
          <div class="desc">
              <div class="divName">
                  <!-- 使用 Store 的用户名 -->
                  {{ userStore.userName }}
                  <!-- 使用 Store 的性别 -->
                  <img v-if="userStore.userSex === '0'" src="@/assets/images/female.png" class="gender-icon" alt="女"/>
                  <img v-else src="@/assets/images/male.png" class="gender-icon" alt="男"/>
              </div>
              <!-- 使用 Store 的手机号 -->
              <div class="divPhone">{{ userStore.userPhone || '未绑定手机' }}</div>
          </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="divContent">
       <!-- 链接部分 -->
       <div class="divLinks">
        <div class="item" @click="toAddressPage">
          <img src="@/assets/images/locations.png" alt="地址管理"/>
          <p>地址管理</p>
          <!-- van-icon 在模板中使用，无需在 script 中导入 -->
          <van-icon name="arrow" class="arrow-icon"/>
        </div>
        <div class="divSplit"></div>
        <div class="item" @click="toOrderPage">
          <img src="@/assets/images/orders.png" alt="历史订单"/>
          <p>历史订单</p>
           <!-- van-icon 在模板中使用，无需在 script 中导入 -->
          <van-icon name="arrow" class="arrow-icon"/>
        </div>
      </div>

      <!-- 最新订单 -->
      <div class="divOrders" v-if="latestOrder">
        <div class="title">最新订单</div>
        <div class="timeStatus">
          <p>{{ latestOrder.orderTime }}</p>
          <p :class="statusClass(latestOrder.status)">{{ getStatusText(latestOrder.status) }}</p>
        </div>
        <div class="dishList">
          <div v-for="item in latestOrder.orderDetails" :key="item.id" class="item">
            <p>{{ item.name }}</p>
            <p>x{{ item.number || item.quantity }}</p>
          </div>
        </div>
        <div class="result">
          <p>共{{ latestOrder.sumNum }} 件商品, 实付</p>
          <p class="price">￥{{ formatPrice(latestOrder.amount) }}</p>
        </div>
        <div class="btn" v-if="latestOrder.status === 4">
          <!-- van-button 在模板中使用，无需在 script 中导入 -->
          <van-button size="small" round class="btnAgain" @click="addOrderAgain(latestOrder)">
              再来一单
          </van-button>
        </div>
      </div>
       <div class="divNoOrders" v-else-if="!loadingOrder">
            <p>暂无最新订单</p>
       </div>
       <div v-if="loadingOrder" class="loading-orders">加载订单中...</div>

      <!-- 退出登录 -->
      <div class="divLogout">
         <!-- van-button 在模板中使用，无需在 script 中导入 -->
        <van-button type="default" block round class="quitLogin" @click="logout">
          退出登录
        </van-button>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
// --- 修改：只导入函数式调用的 Vant API ---
import { showNotify, showToast, showConfirmDialog } from 'vant';
// --- 移除了 VanIcon, VanButton 的导入 ---
import { orderPagingApi, orderAgainApi } from '@/api/order';
import { loginoutApi } from '@/api/login';
import defaultAvatar from '@/assets/images/default-avatar.png';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const latestOrder = ref(null);
const loadingOrder = ref(false);

const goToUserInfoPage = () => {
  router.push('/user-info');
};

const setDefaultAvatar = (event) => {
  event.target.src = defaultAvatar;
};

const formatPrice = (priceInYuan) => {
  if (typeof priceInYuan !== 'number' || isNaN(priceInYuan)) {
      const num = parseFloat(priceInYuan);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
  }
  return priceInYuan.toFixed(2);
};

const goBack = () => { router.back(); };
const toAddressPage = () => { router.push('/address'); };
const toOrderPage = () => { router.push('/order'); };

const fetchLatestOrder = async () => {
  loadingOrder.value = true;
  try {
      const params = { page: 1, pageSize: 1 };
      const response = await orderPagingApi(params);
      if (response?.data?.code === 1) {
          const records = response.data.data.records || [];
          if (records.length > 0) {
              const order = records[0];
              // 修正：确保使用 || 0 来处理可能为 null 的 number/quantity
              order.sumNum = (order.orderDetails || []).reduce((sum, item) => sum + (item.number || item.quantity || 0), 0);
              latestOrder.value = order;
          } else {
              latestOrder.value = null;
          }
      } else {
          console.warn("获取最新订单失败:", response?.data?.msg);
          latestOrder.value = null;
      }
  } catch (error) {
      console.error("加载最新订单出错:", error);
      latestOrder.value = null;
      showNotify({ type: 'danger', message: '加载订单失败' });
  } finally {
      loadingOrder.value = false;
  }
};

const getStatusText = (status) => {
  switch (status) {
      case 1: return '待付款'; case 2: return '待派送'; case 3: return '已派送';
      case 4: return '已完成'; case 5: return '已取消'; default: return '未知状态';
  }
};

const statusClass = (status) => {
   switch (status) {
      case 1: return 'status-pending'; case 2: return 'status-processing'; case 3: return 'status-delivering';
      case 4: return 'status-completed'; case 5: return 'status-cancelled'; default: return 'status-unknown';
   }
};

const addOrderAgain = async (order) => {
  if (!order?.id) return;
  try {
    const response = await orderAgainApi({ id: order.id });
    if (response?.data?.code === 1) {
      showToast('订单商品已添加回购物车');
      router.push('/');
    } else {
      showNotify({ type: 'warning', message: response?.data?.msg || '操作失败' });
    }
  } catch (error) {
    console.error("再来一单操作失败:", error);
    showNotify({ type: 'danger', message: '操作失败，请稍后重试' });
  }
};

const logout = async () => {
  try {
     await showConfirmDialog({
        title: '提示', message: '确定要退出登录吗？', confirmButtonColor: '#4CAF50',
     });

     const response = await loginoutApi();

     if (response?.data?.code === 1) {
       userStore.clearUserInfo();
       showToast('退出成功');
       router.replace('/login');
     } else {
       showNotify({ type: 'warning', message: response?.data?.msg || '退出失败' });
     }
  } catch (error) {
     // Vant 4+ Dialog 取消会 reject Error('cancel')
     if (error instanceof Error && error.message === 'cancel') {
          console.log("用户取消退出");
     } else { // 处理其他错误或旧版 Vant 可能 reject undefined 的情况
         console.error("退出登录失败:", error);
         showNotify({ type: 'danger', message: '退出操作出错' });
     }
  }
};

onMounted(() => {
  console.log("UserPage Mounted");
  fetchLatestOrder();
});

onActivated(() => {
  console.log("UserPage Activated");
  fetchLatestOrder();
});
</script>

<style scoped>
.app.user-page { height: 100vh; display: flex; flex-direction: column; background-color: #f8fbf6; overflow: hidden; }
.app .divHead { background: linear-gradient(to bottom, #a8e063, #56ab2f); padding-bottom: 25px; position: relative; flex-shrink: 0; color: #ffffff; }
.app .divHead .divTitle { position: relative; text-align: center; height: 50px; line-height: 50px; font-size: 17px; font-weight: 500; }
.app .divHead .back-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #ffffff; cursor: pointer; }
.app .divHead .divUser { display: flex; align-items: center; padding: 10px 15px 0; position: relative; }
.app .divHead .user-avatar.clickable { cursor: pointer; transition: filter 0.2s ease; }
.app .divHead .user-avatar.clickable:hover { filter: brightness(90%); }
.app .divHead .user-avatar { width: 55px; height: 55px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.7); margin-right: 12px; flex-shrink: 0; object-fit: cover; display: block; }
.app .divHead .desc { display: flex; flex-direction: column; min-width: 0; }
.app .divHead .divName { font-size: 18px; font-weight: 600; margin-bottom: 5px; display: flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app .divHead .gender-icon { width: 16px; height: 16px; margin-left: 8px; flex-shrink: 0; }
.app .divHead .divPhone { font-size: 14px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.app .divContent { flex-grow: 1; overflow-y: auto; padding: 15px; box-sizing: border-box; }
.app .divContent .divLinks,
.app .divContent .divOrders,
.app .divContent .divNoOrders { background-color: #ffffff; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(139, 195, 74, 0.1); padding: 15px; }
.app .divContent .divLinks { padding: 0; overflow: hidden; }
.app .divContent .divLinks .item { display: flex; align-items: center; padding: 15px; cursor: pointer; position: relative; }
.app .divContent .divLinks .item img { width: 22px; height: 22px; margin-right: 12px; flex-shrink: 0; }
.app .divContent .divLinks .item p { flex-grow: 1; font-size: 15px; color: #333; margin: 0; }
.app .divContent .divLinks .item .arrow-icon { font-size: 16px; color: #cccccc; flex-shrink: 0; }
.app .divContent .divLinks .divSplit { height: 1px; background-color: #eef3e8; margin: 0 15px; }
.app .divContent .divOrders .title { font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #333; }
.app .divContent .divOrders .timeStatus { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed #f0f3f0; }
.app .divContent .divOrders .timeStatus p:first-child { font-size: 13px; color: #888888; margin: 0; }
.app .divContent .divOrders .timeStatus p:last-child { font-size: 13px; font-weight: 500; padding: 3px 8px; border-radius: 4px; margin: 0; }
.app .divContent .divOrders .status-pending { color: #ff976a; background-color: #fff8f5; }
.app .divContent .divOrders .status-processing,
.app .divContent .divOrders .status-delivering { color: #1989fa; background-color: #f0f8ff; }
.app .divContent .divOrders .status-completed { color: #07c160; background-color: #f0fff8; }
.app .divContent .divOrders .status-cancelled,
.app .divContent .divOrders .status-unknown { color: #969799; background-color: #f7f8fa; }
.app .divContent .divOrders .dishList { margin-bottom: 12px; }
.app .divContent .divOrders .dishList .item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 14px; color: #555555; }
.app .divContent .divOrders .dishList .item p { margin: 0; }
.app .divContent .divOrders .dishList .item p:last-child { color: #888888; font-size: 13px; margin-left: 10px; }
.app .divContent .divOrders .result { display: flex; justify-content: flex-end; align-items: baseline; text-align: right; font-size: 13px; color: #555555; margin-top: 8px; }
.app .divContent .divOrders .result p { margin: 0; }
.app .divContent .divOrders .result .price { font-family: 'Arial', sans-serif; font-size: 16px; font-weight: bold; color: #e64a19; margin-left: 5px; }
.app .divContent .divOrders .btn { text-align: right; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #f0f3f0; }
.app .divContent .divOrders .btnAgain.van-button { height: 30px; padding: 0 15px; background-color: #ffffff; border: 1px solid #4CAF50; color: #4CAF50; font-size: 13px; font-weight: 500; }
.app .divContent .divOrders .btnAgain.van-button:active { background-color: #f0fff8; }
.app .divContent .divNoOrders { text-align: center; color: #999; font-size: 14px; padding: 25px 15px; }
.app .divContent .divLogout { margin-top: 25px; padding: 0 10px; }
.app .divContent .quitLogin.van-button { height: 44px; border-radius: 22px; font-size: 16px; font-weight: 500; background-color: #ffffff; border: 1px solid #e64a19; color: #e64a19; transition: background-color 0.2s, color 0.2s; }
.app .divContent .quitLogin.van-button:active { background-color: #ffebee; border-color: #d32f2f; color: #d32f2f; }
.loading-orders { text-align: center; color: #999; padding: 20px; font-size: 14px;}
</style>