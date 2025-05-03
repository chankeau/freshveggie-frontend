<template>
  <div class="app add-order-page">
    <div class="divHead">
      <div class="divTitle">
        <van-icon name="arrow-left" @click="goBack" class="back-icon"/>
        <span>确认订单</span>
      </div>
    </div>

    <div class="divContent">
      <div class="section-card divAddress">
        <div @click="toAddressPage" class="address-content">
          <div class="info">
            <template v-if="address.id">
              <div class="address-detail">{{ address.detail }}</div>
              <div class="contact">
                <span>{{ address.consignee }}{{ address.sex === '1' ? ' 先生' : ' 女士' }}</span>
                <span>{{ address.phone }}</span>
              </div>
            </template>
            <template v-else>
              <div class="no-address-tip">请选择收货地址</div>
            </template>
          </div>
          <van-icon name="arrow" class="arrow-icon"/>
        </div>
        <div class="delivery-time">
          <van-icon name="clock-o" />
          <span>预计 {{ finishTime }} 送达</span>
        </div>
      </div>

      <div class="section-card order-details">
        <div class="title">订单商品</div>
        <div class="itemList">
          <div class="item" v-for="item in cartData" :key="item.id">
            <img :src="imgPathConvert(item.image)" @error="imgError" class="item-image"/>
            <div class="desc">
              <div class="name">{{ item.name }}</div>
            </div>
            <div class="numPrice">
              <span class="num">x{{ item.number }}</span>
              <div class="price">
                <span class="spanMoney">￥</span>{{ formatPrice(item.amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card fee-details">
         <van-cell title="商品小计">
             <span class="price-text">￥{{ formatPrice(computedGoodsPrice) }}</span>
         </van-cell>
         <van-cell title="打包费">
             <span class="price-text">￥{{ formatPrice(PACKING_FEE_AMOUNT) }}</span>
         </van-cell>
         <van-cell title="配送费">
             <template v-if="calculatedDeliveryFee > 0">
                <span class="price-text">￥{{ formatPrice(calculatedDeliveryFee) }}</span>
             </template>
              <template v-else>
                 <span class="free-delivery-text">(满 ¥{{ DELIVERY_FEE_THRESHOLD.toFixed(2) }} 免配送费)</span>
                 <span class="price-text">￥0.00</span>
              </template>
         </van-cell>
      </div>

       <div class="section-card note-section">
         <van-field
           v-model="note"
           rows="1"
           autosize
           label="订单备注"
           type="textarea"
           maxlength="50"
           placeholder="选填，请输入您的特殊要求"
           show-word-limit
           input-align="right"
           class="remark-field"
         />
       </div>
    </div>

    <div class="payment-bar divCart">
        <div class="left-info">
            <span class="total-label">合计：</span>
            <span class="final-amount">￥{{ formatPrice(finalTotalAmount) }}</span>
        </div>
        <van-button
            round
            type="primary"
            @click="submitOrder"
            class="submit-button"
            :disabled="!canSubmitOrder"
            :loading="isLoading"
            loading-text="提交订单..."
            color="linear-gradient(to right, #60b930, #4caf50)"
        >
           提交订单 ({{ computedGoodsNumValue }}件)
        </van-button>
    </div>

     <van-popup v-model:show="cartDialogShow" position="bottom" :style="{ height: '60%' }" round>
       <div class="divCartPopup" style="padding: 16px;">
         <div class="divCartTitle" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 16px;">
           <span>购物车详情</span>
           <span @click="clearCart" style="cursor: pointer; color: #999; font-size: 14px;">
             <van-icon name="delete-o" style="vertical-align: middle; margin-right: 2px;"/> 清空
           </span>
         </div>
         <div class="divCartContent" style="max-height: calc(60vh - 100px); overflow-y: auto;">
             <div v-if="!cartData || cartData.length === 0" class="divCartEmpty" style="text-align: center; padding: 40px; color: #999;">
                 购物车还是空的哦~
             </div>
             <div v-else class="divCartItem" v-for="item in cartData" :key="'cart-popup-' + item.id" style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #ebedf0;">
                 <img :src="imgPathConvert(item.image)" @error="imgError" style="width: 50px; height: 50px; flex-shrink: 0; margin-right: 10px; border-radius: 4px; object-fit: cover;"/>
                 <div class="divDesc" style="flex-grow: 1;">
                     <div class="name" style="font-size: 14px; margin-bottom: 5px; color: #323233;">{{item.name}}</div>
                 </div>
                 <div class="divControl" style="display: flex; align-items: center;">
                     <span style="font-size: 14px; color: #ee0a24; margin-right: 10px;">￥{{ formatPrice(item.amount * item.number) }}</span>
                     <div class="divNum" style="display: flex; align-items: center;">
                         <div class="divSubtract" style="margin-right: 5px;">
                             <img src="@/assets/images/subtract_green.png" style="width: 20px; height: 20px; vertical-align: middle;" @click.prevent.stop="subtractCart(item)"/>
                         </div>
                         <div class="divDishNum" style="min-width: 20px; text-align: center;">{{item.number}}</div>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// --- 按需导入函数式 Vant 调用 ---
import { showToast, showNotify } from 'vant';
// --- 移除 Vant 组件导入，交给 unplugin-vue-components ---
// import { VanIcon, VanField, VanCell, VanPopup, VanButton } from 'vant';
import { getDefaultAddressApi } from '@/api/address';
import { cartListApi, addCartApi, updateCartApi, clearCartApi } from '@/api'
import { addOrderApi } from '@/api/order';
import defaultImage from '@/assets/images/noImg.png';

const DELIVERY_FEE_THRESHOLD = 39.00;
const DELIVERY_FEE_AMOUNT = 5.00;
const PACKING_FEE_AMOUNT = 1.00;

const router = useRouter();
const route = useRoute();
const address = ref({});
const finishTime = ref('');
const cartData = ref([]);
const note = ref('');
const cartDialogShow = ref(false);
const isLoading = ref(false);

const computedGoodsNumValue = computed(() => {
  return cartData.value.reduce((sum, item) => sum + (item.number || 0), 0);
});

const computedGoodsPrice = computed(() => {
  return cartData.value.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    const number = parseInt(item.number, 10) || 0;
    return sum + (amount * number);
  }, 0);
});

const calculatedDeliveryFee = computed(() => {
    if (computedGoodsPrice.value >= DELIVERY_FEE_THRESHOLD) {
        return 0.00;
    }
    return DELIVERY_FEE_AMOUNT;
});

const finalTotalAmount = computed(() => {
    return computedGoodsPrice.value + PACKING_FEE_AMOUNT + calculatedDeliveryFee.value;
});

const canSubmitOrder = computed(() => {
    return cartData.value.length > 0 && address.value.id;
});

const formatPrice = (priceInYuan) => {
    if (typeof priceInYuan !== 'number' || isNaN(priceInYuan)) {
        const num = parseFloat(priceInYuan);
        if (isNaN(num)) return '0.00';
        return num.toFixed(2);
    }
    return priceInYuan.toFixed(2);
};

const backendBaseUrl = 'http://localhost:9000';
const imgPathConvert = (path) => {
  // --- 修复：使用 backendBaseUrl ---
  return path ? `${backendBaseUrl}/api/common/download?name=${path}` : defaultImage;
};
const imgError = (event) => { event.target.src = defaultImage; };

const goBack = () => { router.back(); };

const calculateFinishTime = () => {
  let now = new Date();
  now.setHours(now.getHours() + 1);
  finishTime.value = now.toTimeString().substr(0, 5);
};

const fetchDefaultAddress = async () => {
  try {
    const response = await getDefaultAddressApi();
    if (response?.data?.code === 1 && response.data.data) {
      address.value = response.data.data;
    } else {
      address.value = {};
    }
  } catch (error) {
    console.error('获取默认地址出错:', error);
    showNotify({ type: 'danger', message: '获取地址失败' });
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
  } catch (error) {
    cartData.value = [];
    console.error('获取购物车出错:', error);
  }
};

const toAddressPage = () => {
  const redirectUrl = encodeURIComponent(route.fullPath);
  router.push(`/address?redirect=${redirectUrl}`);
};

const submitOrder = async () => {
  if (!address.value.id) {
    showToast('请选择收货地址');
    return;
  }
  if (!cartData.value || cartData.value.length === 0) {
    showToast('购物车中没有商品');
    return;
  }

  isLoading.value = true;
  const params = {
    remark: note.value,
    payMethod: 1,
    addressBookId: address.value.id,
  };

  try {
    const response = await addOrderApi(params);
    if (response?.data?.code === 1) {
      showToast('订单提交成功！');
      const orderInfo = response.data.data;
      if(orderInfo && orderInfo.number) {
        router.replace(`/pay?orderNumber=${orderInfo.number}`);
      } else {
        router.replace('/pay-success');
      }
    } else {
      showNotify({ type: 'warning', message: response?.data?.msg || '下单失败' });
    }
  } catch (error) {
    console.error('提交订单出错:', error);
    showNotify({ type: 'danger', message: '下单请求失败' });
  } finally {
      isLoading.value = false;
  }
};

const clearCart = async () => {
  if (cartData.value.length === 0) return;
  try {
    const response = await clearCartApi();
    if (response?.data?.code === 1) {
      cartData.value = [];
      cartDialogShow.value = false;
      showToast('购物车已清空');
    } else {
      showNotify({ type: 'warning', message: response?.data?.msg || '清空失败' });
    }
  } catch (error) {
    console.error('清空购物车时出错:', error);
    showNotify({ type: 'danger', message: '清空购物车时出错' });
  }
};

const addCart = async (item) => {
  let params = {
    dishId: item.dishId,
    setmealId: item.setmealId,
    amount: item.amount,
    name: item.name,
    image: item.image,
  };
  if (params.dishId === undefined || params.dishId === null) delete params.dishId;
  if (params.setmealId === undefined || params.setmealId === null) delete params.setmealId;

  if (!params.dishId && !params.setmealId) { showNotify({ type: 'danger', message: '操作失败，商品ID错误'}); return; }
  const itemAmount = parseFloat(params.amount);
  if (isNaN(itemAmount) || itemAmount < 0) { showNotify({ type: 'danger', message: '操作失败，价格错误'}); return; }
  params.amount = itemAmount;

  try {
      const response = await addCartApi(params);
      if (response?.data?.code === 1) {
          await fetchCartData();
      } else { showNotify({ type: 'warning', message: response?.data?.msg || '操作失败' }); }
  } catch (error) { console.error('Add cart error:', error); showNotify({ type: 'danger', message: '操作失败' }); }
};

const subtractCart = async (item) => {
   let params = {
       dishId: item.dishId,
       setmealId: item.setmealId,
   };
   if (params.dishId === undefined || params.dishId === null) delete params.dishId;
   if (params.setmealId === undefined || params.setmealId === null) delete params.setmealId;

   if (!params.dishId && !params.setmealId) { showNotify({ type: 'danger', message: '操作失败，商品ID错误'}); return; }
   if (item.number <= 0) return;

   try {
     const response = await updateCartApi(params);
     if (response?.data?.code === 1) {
       await fetchCartData();
     } else { showNotify({ type: 'warning', message: response?.data?.msg || '操作失败' }); }
   } catch (error) { console.error('Subtract cart error:', error); showNotify({ type: 'danger', message: '操作失败' }); }
};

onMounted(async () => {
  const selectedAddressId = route.query.addressId;

  if (selectedAddressId) {
      console.warn("按ID获取地址的逻辑未实现，将获取默认地址。");
      await fetchDefaultAddress();
  } else {
      await fetchDefaultAddress();
  }

  await fetchCartData();
  calculateFinishTime();
});
</script>

<style scoped>
.add-order-page {
  display: flex; flex-direction: column; height: 100vh;
  background-color: #f8fbf6; overflow: hidden;
}
.add-order-page .divHead {
  background: #ffffff; height: 50px; position: sticky; top: 0;
  z-index: 20; border-bottom: 1px solid #ebedf0; flex-shrink: 0;
}
.add-order-page .divHead .divTitle {
  position: relative; text-align: center; height: 100%;
  line-height: 50px; font-size: 17px; font-weight: 500; color: #333333;
}
.add-order-page .divHead .divTitle .back-icon {
  position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
  font-size: 20px; color: #555; cursor: pointer;
}

.add-order-page .divContent {
  flex-grow: 1; overflow-y: auto; padding: 12px 15px 85px 15px;
  box-sizing: border-box;
}

.add-order-page .section-card {
  background-color: #ffffff; border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px; padding: 15px;
}

.add-order-page .divAddress .address-content {
  display: flex; align-items: center; cursor: pointer;
}
.add-order-page .divAddress .info { flex-grow: 1; margin-right: 10px; }
.add-order-page .divAddress .address-detail {
  font-size: 15px; font-weight: 500; color: #333; line-height: 1.4;
  margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.add-order-page .divAddress .contact { font-size: 13px; color: #757575; }
.add-order-page .divAddress .contact span:first-child { margin-right: 10px; }
.add-order-page .divAddress .no-address-tip { font-size: 15px; color: #ff976a; font-weight: 500; }
.add-order-page .divAddress .arrow-icon { color: #999; font-size: 16px; }
.add-order-page .divAddress .delivery-time {
  margin-top: 12px; padding-top: 12px; border-top: 1px dashed #ebedf0;
  font-size: 13px; color: #56ab2f; display: flex; align-items: center;
}
.add-order-page .divAddress .delivery-time .van-icon { margin-right: 5px; }

.add-order-page .order-details { padding: 0 15px; }
.add-order-page .order-details .title {
  font-size: 15px; font-weight: 600; color: #333;
  line-height: 44px; border-bottom: 1px solid #eef3e8;
}
.add-order-page .order-details .itemList { padding: 5px 0; }
.add-order-page .order-details .item { display: flex; padding: 12px 0; align-items: flex-start; }
.add-order-page .order-details .item:not(:last-child) { border-bottom: 1px solid #f0f3f0; }
.add-order-page .order-details .item-image {
  width: 50px; height: 50px;
  object-fit: cover; border-radius: 5px; margin-right: 10px; flex-shrink: 0;
}
.add-order-page .order-details .desc { flex-grow: 1; display: flex; flex-direction: column; margin-right: 10px; }
.add-order-page .order-details .desc .name { font-size: 14px; color: #333; line-height: 1.4; margin-bottom: 4px; }
.add-order-page .order-details .desc .spec { font-size: 12px; color: #888; }
.add-order-page .order-details .numPrice { text-align: right; flex-shrink: 0; }
.add-order-page .order-details .numPrice .num { display: block; font-size: 12px; color: #888; margin-bottom: 4px; }
.add-order-page .order-details .numPrice .price { font-family: 'Arial', sans-serif; color: #333; font-size: 14px; font-weight: 500; }
.add-order-page .order-details .numPrice .price .spanMoney { font-size: 12px; }

.add-order-page .fee-details { padding: 5px 0; }
.add-order-page .fee-details .van-cell { padding: 10px 15px; font-size: 14px; color: #555; background: transparent; } /* Set cell background transparent */
.add-order-page .fee-details .van-cell::after { border-bottom: none; }
.add-order-page .fee-details .price-text { color: #333; font-weight: 500; }
.add-order-page .fee-details .free-delivery-text { font-size: 12px; color: #07c160; margin-right: 5px; }

.add-order-page .note-section { padding: 0; }
.add-order-page .note-section .van-field {
   padding: 12px 15px; background-color: transparent; align-items: center;
}
.add-order-page .note-section .van-field :deep(.van-field__label) { width: auto; margin-right: 15px; color: #333; font-weight: 600; font-size: 15px; }
.add-order-page .note-section .van-field :deep(.van-field__value) { text-align: right; }
.add-order-page .note-section .van-field :deep(.van-field__control::placeholder) { color: #bdcbd6; }

.add-order-page .payment-bar {
   width: 100%; background: #ffffff; position: fixed; left: 0; bottom: 0;
   z-index: 100; box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.06); display: flex;
   align-items: center; padding: 8px 15px; box-sizing: border-box; height: 65px;
}
.add-order-page .payment-bar .left-info { flex-grow: 1; display: flex; align-items: baseline; }
.add-order-page .payment-bar .total-label { font-size: 14px; color: #555; margin-right: 5px; }
.add-order-page .payment-bar .final-amount { font-family: 'Arial', sans-serif; font-size: 20px; font-weight: bold; color: #e64a19; }
.add-order-page .payment-bar .submit-button.van-button {
  height: 44px; width: auto; min-width: 120px; font-size: 16px; font-weight: 500;
}

.divCartPopup { padding: 16px; display: flex; flex-direction: column; height: 100%; }
.divCartTitle { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 16px; flex-shrink: 0; }
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
.divCartItem .divControl .divDishNum { min-width: 20px; text-align: center; font-size: 14px; line-height: 20px; color: #555; padding: 0 2px; }
.divCartItem .divControl .divDishNum p { margin: 0; }
</style>