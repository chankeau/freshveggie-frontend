<template>
    <div class="app order-page"> <!-- 添加特定类名 -->
      <div class="divHead">
        <div class="divTitle">
          <van-icon name="arrow-left" @click="goBack" class="back-icon"/>
          <span>历史订单</span> <!-- 修改标题 -->
        </div>
      </div>
  
      <div class="divBody">
        <!-- 使用 Vant List 实现下拉加载 -->
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多订单了"
          @load="loadNextPage"
          :offset="50" 
          class="order-list-container"
        >
          <!-- 遍历订单列表 -->
          <van-cell v-for="order in orderList" :key="order.id" class="order-item"> <!-- 使用 order.id 作为 key -->
            <div class="timeStatus">
              <span>{{ order.orderTime }}</span> <!-- 显示订单时间 -->
              <span :class="statusClass(order.status)">{{ getStatusText(order.status) }}</span> <!-- 显示处理过的状态文本和样式 -->
            </div>
            <div class="dishList">
              <!-- 遍历订单详情 -->
              <div v-for="item in order.orderDetails" :key="item.id" class="dish-item"> <!-- 使用 item.id 作为 key -->
                <span>{{ item.name }}</span>
                <span>x{{ item.number || item.quantity }}</span> <!-- 优先使用 number，兼容 quantity -->
              </div>
            </div>
            <div class="result">
              <span>共{{ order.sumNum }} 件商品, 实付</span>
              <span class="price">￥{{ formatPrice(order.amount) }}</span> <!-- 显示格式化后的总价 -->
            </div>
            <!-- 仅在订单状态为“已完成”时显示“再来一单”按钮 -->
            <div class="btn" v-if="order.status === 4">
              <van-button size="small" round class="btnAgain" @click.stop="addOrderAgain(order)">
                  再来一单
              </van-button>
            </div>
          </van-cell>
           <!-- Vant List 加载完成且列表为空时的提示 -->
           <template #finished>
               <div v-if="orderList.length === 0 && !loading" class="divNoData">
                   <div class="divContainer">
                      <img src="@/assets/images/no_order.png" alt="暂无订单"/> <!-- 使用 @/assets 路径 -->
                      <div>暂无订单记录</div>
                   </div>
               </div>
               <!-- Vant List 默认的加载完成提示 -->
               <span v-else>没有更多订单了</span>
           </template>
        </van-list>
      </div>
    </div>
  </template>
  
  <script setup>


  import { ref} from 'vue';
  import { useRouter } from 'vue-router';
  import { showNotify, showToast } from 'vant'; // 引入 Vant 的提示组件
  
  // 引入你的 API 函数 (请确保路径正确)
  import { orderPagingApi, orderAgainApi } from '@/api/order';
  
  // --- 响应式状态定义 ---
  const router = useRouter();
  const orderList = ref([]);          // 订单列表数组
  const loading = ref(false);         // Vant List 的加载状态
  const finished = ref(false);        // Vant List 是否已加载全部数据
  const page = ref(1);                // 当前加载的页码
  const pageSize = ref(5);            // 每页加载的数量
  
  // --- 方法定义 ---
  
// 修改后的 formatPrice 函数
const formatPrice = (priceInYuan) => {
    // 检查输入是否为有效数字
    if (typeof priceInYuan !== 'number' || isNaN(priceInYuan)) {
        // 尝试从可能的字符串转换，如果后端有时返回字符串的话
        const num = parseFloat(priceInYuan);
        if (isNaN(num)) return '0.00';
        return num.toFixed(2); // 直接格式化为两位小数
    }
    return priceInYuan.toFixed(2); // 直接格式化为两位小数
};
  
  // 返回上一页或首页
  const goBack = () => {
    // 检查上一页历史状态是否包含 'success' (这种方法可能不可靠)
    // 更好的方式是在 PaySuccess 页面跳转时添加一个标记，或使用 Vuex/Pinia 状态管理
    if (window.history.state?.back?.includes('success')) {
        router.replace('/'); // 如果从成功页来，替换历史记录跳转到首页
    } else {
        router.back(); // 否则，正常返回上一页
    }
  };
  
  // 根据状态码获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 1: return '待付款';
      case 2: return '待派送'; // 修改为待派送
      case 3: return '已派送';
      case 4: return '已完成';
      case 5: return '已取消';
      default: return '未知状态';
    }
  };
  
  // 根据状态码获取对应的 CSS 类名 (用于添加不同颜色等样式)
  const statusClass = (status) => {
       switch (status) {
          case 1: return 'status-pending';    // 待付款 - 橙色
          case 2: return 'status-processing'; // 待派送 - 蓝色
          case 3: return 'status-delivering'; // 已派送 - 蓝色
          case 4: return 'status-completed';  // 已完成 - 绿色
          case 5: return 'status-cancelled';  // 已取消 - 灰色
          default: return 'status-unknown';   // 未知 - 灰色
       }
  };
  
  // Vant List 的 @load 事件触发此方法，加载下一页数据
  const loadNextPage = async () => {
    // 如果已经加载完成或正在加载中，则不执行
    if (finished.value) {
        loading.value = false; // 确保 loading 状态正确
        return;
    }
    loading.value = true; // 开始加载，显示 loading 提示
  
    try {
      // 请求参数
      const params = { page: page.value, pageSize: pageSize.value };
      // 调用后端分页查询订单接口
      const response = await orderPagingApi(params);
  
      // 处理成功的响应
      if (response && response.data && response.data.code === 1) {
        const records = response.data.data.records || []; // 获取记录列表
        const totalPages = response.data.data.pages || 0; // 获取总页数
  
        // 计算每个订单的总商品数量 (后端如果没算的话)
        records.forEach(order => {
          // 确保 orderDetails 存在且是数组
          const details = order.orderDetails || [];
          // 累加 number 或 quantity 字段
          order.sumNum = details.reduce((sum, item) => sum + (item.number || item.quantity || 0), 0);
        });
  
        // 将新获取的订单追加到现有列表
        orderList.value.push(...records);
        // 页码加 1，为下次加载准备
        page.value++;
  
        // 判断是否已加载所有页
        if (page.value > totalPages || records.length === 0) {
          finished.value = true; // 设置为加载完成状态
        }
      } else {
        // API 返回错误或 code 不为 1
        showNotify({ type: 'warning', message: response?.data?.msg || '加载订单列表失败' });
        finished.value = true; // 出错时也标记为完成，停止加载
      }
    } catch (error) {
      // 网络请求或其他异常
      console.error("加载订单列表出错:", error);
      showNotify({ type: 'danger', message: '网络错误，请稍后重试' });
      finished.value = true; // 出错时也标记为完成，停止加载
    } finally {
      // 无论成功或失败，最终都要结束 loading 状态
      loading.value = false;
    }
  };
  
  // “再来一单”按钮的点击事件处理
  const addOrderAgain = async (order) => {
    try {
      // 调用“再来一单”接口，传入订单 ID
      const response = await orderAgainApi({ id: order.id });
      // 处理成功的响应
      if (response && response.data && response.data.code === 1) {
        showToast('订单商品已添加回购物车');
        // 跳转到首页或购物车页面
        router.push('/'); // 跳转到首页
      } else {
        // API 返回错误
        showNotify({ type: 'warning', message: response?.data?.msg || '操作失败，无法再来一单' });
      }
    } catch (error) {
      // 网络请求或其他异常
      console.error("再来一单操作失败:", error);
      showNotify({ type: 'danger', message: '操作失败，请稍后重试' });
    }
  };
  
  // --- 生命周期钩子 ---
  // onMounted(() => {
  //   // Vant List 会在组件挂载后自动触发第一次 load 事件，所以这里通常不需要手动调用
  //   // loadNextPage();
  // });
  </script>
  
  <style scoped>
  /* --- Global Page Styles --- */
  .order-page { /* Use the specific class */
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f8fbf6; /* Consistent light green background */
    overflow: hidden; /* Prevent root scroll */
  }
  
  /* --- Header --- */
  /* Reuse simplified header style */
  .order-page .divHead {
    background: #ffffff; /* Simple white background */
    height: 50px; /* Consistent header height */
    position: sticky; /* Make it sticky */
    top: 0;
    z-index: 20;
    border-bottom: 1px solid #ebedf0; /* Subtle separator */
    flex-shrink: 0;
    box-sizing: border-box;
  }
  
  .order-page .divHead .divTitle {
    position: relative;
    text-align: center;
    height: 100%;
    line-height: 50px; /* Match height */
    font-size: 17px;
    font-weight: 500;
    color: #333333; /* Dark text */
  }
  
  /* Back icon positioning */
  .order-page .divHead .divTitle .back-icon {
    position: absolute;
    left: 15px; /* Consistent padding */
    top: 50%;
    transform: translateY(-50%);
    font-size: 20px;
    color: #555; /* Consistent icon color */
    cursor: pointer;
  }
  
  /* --- Body / List Container --- */
  .order-page .divBody {
    flex-grow: 1; /* Take remaining space */
    overflow-y: auto; /* Allow scrolling */
    padding: 12px 15px; /* Add padding around the list */
    box-sizing: border-box;
  }
  
  /* Remove default padding from Vant List container if necessary */
  .order-page .order-list-container.van-list {
    padding-top: 0;
  }
  
  /* --- Order Item Card --- */
  .order-page .order-item.van-cell {
    background-color: #ffffff;
    border-radius: 8px; /* Consistent card radius */
    margin-bottom: 12px; /* Spacing between cards */
    padding: 15px; /* Internal padding */
    box-shadow: 0 2px 6px rgba(139, 195, 74, 0.1); /* Subtle green shadow */
    /* border: 1px solid #eef3e8; */ /* Optional: Light border */
    position: relative;
    display: flex; /* Use flex for better control */
    flex-direction: column; /* Stack sections vertically */
  }
  /* Remove default Vant Cell border */
  .order-page .order-item.van-cell::after {
    display: none;
  }
  
  /* --- Time & Status Section --- */
  .order-page .order-item .timeStatus {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px; /* Space below */
    padding-bottom: 10px; /* Padding before border */
    border-bottom: 1px dashed #f0f3f0; /* Dashed separator */
  }
  
  .order-page .order-item .timeStatus span:first-child { /* Timestamp */
    font-size: 13px;
    color: #888888; /* Lighter text */
  }
  
  /* Status Text - base style */
  .order-page .order-item .timeStatus span:last-child {
    font-size: 13px;
    font-weight: 500;
    padding: 3px 8px; /* Badge padding */
    border-radius: 4px; /* Slight radius for badge */
  }
  /* Dynamic Status Classes */
  .order-page .order-item .timeStatus .status-pending { /* 待付款 */
    color: #ff976a; /* Vant Orange */
    background-color: #fff8f5;
  }
  .order-page .order-item .timeStatus .status-processing, /* 待派送/已派送 */
  .order-page .order-item .timeStatus .status-delivering {
    color: #1989fa; /* Vant Blue */
    background-color: #f0f8ff;
  }
  .order-page .order-item .timeStatus .status-completed { /* 已完成 */
    color: #07c160; /* Vant Green */
    background-color: #f0fff8;
  }
  .order-page .order-item .timeStatus .status-cancelled, /* 已取消 */
  .order-page .order-item .timeStatus .status-unknown { /* 未知 */
    color: #969799; /* Vant Grey */
    background-color: #f7f8fa;
  }
  
  /* --- Dish List Section --- */
  .order-page .order-item .dishList {
    margin-bottom: 12px; /* Space before summary */
  }
  
  .order-page .order-item .dishList .dish-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0; /* Vertical space for each dish */
    font-size: 14px;
    color: #555555; /* Medium text */
  }
  
  .order-page .order-item .dishList .dish-item span:first-child { /* Dish Name */
    /* Optional: Add ellipsis for long names */
     /* white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
     max-width: 70%; */
  }
  
  .order-page .order-item .dishList .dish-item span:last-child { /* Quantity */
    color: #888888; /* Lighter quantity text */
    font-size: 13px;
    margin-left: 10px; /* Ensure space between name and quantity */
  }
  
  /* --- Result / Summary Section --- */
  .order-page .order-item .result {
    display: flex;
    justify-content: flex-end;
    align-items: baseline; /* Align text baselines */
    text-align: right;
    font-size: 13px;
    color: #555555;
    margin-top: 8px; /* Add some space above summary */
  }
  
  .order-page .order-item .result .price {
    font-family: 'Arial', sans-serif; /* Consistent price font */
    font-size: 16px; /* Price font size */
    font-weight: bold;
    color: #e64a19; /* Consistent price color */
    margin-left: 5px; /* Space between text and price */
  }
  /* '￥' symbol is now included in the template string */
  
  /* --- Button Section --- */
  .order-page .order-item .btn {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px; /* Space above button */
    padding-top: 10px; /* Padding before button */
    border-top: 1px dashed #f0f3f0; /* Dashed separator above button */
  }
  
  .order-page .order-item .btn .btnAgain.van-button {
    height: 32px; /* Adjust button height */
    /* width: auto; */ /* Let width be determined by content + padding */
    padding: 0 16px; /* Adjust horizontal padding */
    background-color: #ffffff; /* White background */
    border: 1px solid #4CAF50; /* Green border */
    color: #4CAF50; /* Green text */
    font-size: 13px;
    font-weight: 500;
    /* 'round' prop handles border-radius */
  }
  .order-page .order-item .btn .btnAgain.van-button:active {
    background-color: #f0fff8; /* Light green background on press */
  }
  
  /* --- No Data State --- */
  .order-page .divNoData {
    width: 100%;
    /* height calculated by flex-grow on divBody */
    display: flex; /* Use flex to center content */
    align-items: center;
    justify-content: center;
    padding: 50px 0; /* Add significant padding */
    box-sizing: border-box;
    text-align: center;
  }
  
  .order-page .divNoData .divContainer img {
    width: 120px; /* Adjust size */
    height: auto;
    opacity: 0.6; /* Slightly more subtle */
    margin-bottom: 15px;
  }
  
  .order-page .divNoData .divContainer div {
    font-size: 15px;
    color: #999999; /* Lighter grey text */
  }
  
  /* --- Vant List Finished/Loading Text --- */
  :deep(.van-list__loading .van-loading__text),
  :deep(.van-list__finished-text) {
    color: #999999 !important;
    font-size: 13px !important;
    padding: 15px 0 !important;
  }
  
  </style>