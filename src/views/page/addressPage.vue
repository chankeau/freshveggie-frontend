<template>
  <div class="app address-page">
    <div class="divHead">
      <div class="divTitle">
        <van-icon name="arrow-left" @click="goBack" class="back-icon"/>
        <span>地址管理</span>
      </div>
    </div>

    <div class="divContent">
      <div v-if="addressList.length === 0 && !loading" class="no-data">
         您还没有添加地址信息
      </div>
      <div class="divItem van-cell" v-for="item in addressList" :key="item.id" @click="handleItemClick(item)">
        <img src="@/assets/images/edit.png" class="edit-icon" @click.stop="toAddressEditPage(item)" />

        <div class="info-section">
          <div class="divAddress">
            <!-- 确保 :class 属性是手动重新输入的 -->
            <span :class="labelClass(item.label)">{{ item.label }}</span>
            {{ item.detail }}
          </div>
          <div class="divUserPhone">
            <span>{{ item.consignee }}</span>
            <span>{{ item.sex === '0' ? '女士' : '先生' }}</span>
            <span>{{ item.phone }}</span>
          </div>
        </div>

        <div class="divSplit"></div>

        <div class="divDefault">
           <van-checkbox
              :model-value="item.isDefault === 1"
              :checked-color="'#4CAF50'"
              icon-size="16px"
              @click.stop.prevent="setDefaultAddress(item)"
           >
             设为默认地址
           </van-checkbox>
        </div>
      </div>
    </div>

    <div class="divBottom">
        <van-button type="primary" block round @click="toAddressCreatePage" class="add-btn">
            + 添加收货地址
        </van-button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showNotify, showToast } from 'vant'; // 假设 Vant 组件已全局注册

import { addressListApi, setDefaultAddressApi } from '@/api/address';

const router = useRouter();
const route = useRoute();
const addressList = ref([]);
const loading = ref(false);
const isSelectingAddress = computed(() => route.query.redirect?.includes('add-order'));


const goBack = () => {
  router.back();
};

const fetchAddressList = async () => {
  loading.value = true;
  try {
    const response = await addressListApi();
    if (response?.data?.code === 1) {
      addressList.value = response.data.data || [];
    } else {
      showNotify({ type: 'warning', message: response?.data?.msg || '获取地址列表失败' });
      addressList.value = [];
    }
  } catch (error) {
    console.error("Error fetching address list:", error);
    showNotify({ type: 'danger', message: '加载地址列表时出错' });
    addressList.value = [];
  } finally {
      loading.value = false;
  }
};

// 在函数定义前添加禁用注释
const setDefaultAddress = async (item) => {
  if (item.isDefault === 1) return;

  try {
    const response = await setDefaultAddressApi({ id: item.id });
    if (response?.data?.code === 1) {
      await fetchAddressList();
      showToast('默认地址设置成功');
      if (isSelectingAddress.value) {
          const newDefault = addressList.value.find(addr => addr.id === item.id && addr.isDefault === 1);
          if (newDefault) {
               router.replace({ path: decodeURIComponent(route.query.redirect), query: { addressId: newDefault.id }});
          } else {
               setTimeout(() => router.back(), 300);
          }
      }
    } else {
      showNotify({ type: 'warning', message: response?.data?.msg || '设置失败' });
    }
  } catch (error) {
    console.error("Error setting default address:", error);
    showNotify({ type: 'danger', message: '设置默认地址时出错' });
  }
};

const toAddressEditPage = (item) => {
   const query = route.query.redirect ? { redirect: route.query.redirect } : {};
   router.push({ name: 'AddressEdit', params: { id: item.id }, query: query });
};

const toAddressCreatePage = () => {
   const query = route.query.redirect ? { redirect: route.query.redirect } : {};
   router.push({ name: 'AddressEdit', query: query });
};

const handleItemClick = async (item) => {
  if (isSelectingAddress.value) {
       router.replace({ path: decodeURIComponent(route.query.redirect), query: { addressId: item.id }});
  } else {
    toAddressEditPage(item);
  }
};


const labelClass = (label) => {
  switch (label?.toLowerCase()) {
    case '公司': return 'spanCompany';
    case '家': return 'spanHome';
    case '学校': return 'spanSchool';
    default: return 'spanOther';
  }
};

onMounted(() => {
  fetchAddressList();
});
</script>

<style scoped>
/* --- Base structure from homepage .app --- */
.app.address-page {
height: 100vh;
display: flex;
flex-direction: column;
background-color: #f8fbf6; /* Homepage light green background */
overflow: hidden; /* Prevent root scroll */
}

/* --- Header Adaptation --- */
.app .divHead {
background: #ffffff; /* Simple white */
height: 50px;
position: sticky;
top: 0;
z-index: 20;
border-bottom: 1px solid #ebedf0;
flex-shrink: 0;
box-sizing: border-box;
}

.app .divHead .divTitle {
position: relative;
text-align: center;
height: 100%;
line-height: 50px;
font-size: 17px;
font-weight: 500;
color: #333333;
}

.app .divHead .back-icon {
position: absolute;
left: 15px;
top: 50%;
transform: translateY(-50%);
font-size: 20px;
color: #555;
cursor: pointer;
}

/* --- Content Area --- */
.app .divContent {
flex-grow: 1;
overflow-y: auto;
padding: 12px 15px; /* Consistent padding */
box-sizing: border-box;
padding-bottom: 70px; /* Space for bottom button */
}

/* --- Address Item Card --- */
.app .divContent .divItem {
background-color: #ffffff;
border-radius: 8px;
margin-bottom: 12px;
box-shadow: 0 2px 6px rgba(139, 195, 74, 0.1);
padding: 15px;
position: relative;
cursor: pointer;
}
.app .divContent .divItem.van-cell::after {
display: none;
}

.app .divContent .divItem .info-section {
  padding-right: 30px;
  margin-bottom: 10px;
}

.app .divContent .divItem .divAddress {
font-size: 15px;
font-weight: 500;
color: #333333;
line-height: 1.5;
margin-bottom: 6px;
white-space: normal;
word-break: break-all;
}

.app .divContent .divItem .divAddress span {
display: inline-block;
font-size: 11px;
font-weight: normal;
padding: 2px 5px;
border-radius: 3px;
margin-right: 6px;
vertical-align: middle;
line-height: 1.2;
color: #fff;
margin-bottom: 2px;
}
.app .divContent .divItem .divAddress .spanCompany { background-color: #1989fa; }
.app .divContent .divItem .divAddress .spanHome { background-color: #ff976a; }
.app .divContent .divItem .divAddress .spanSchool { background-color: #07c160; }
.app .divContent .divItem .divAddress .spanOther { background-color: #969799; }

.app .divContent .divItem .divUserPhone span {
font-size: 13px;
color: #757575;
line-height: 1.4;
margin-right: 8px;
}
.app .divContent .divItem .divUserPhone span:last-child { margin-right: 0; }

.app .divContent .divItem .edit-icon {
position: absolute;
top: 15px;
right: 15px;
width: 18px;
height: 18px;
cursor: pointer;
opacity: 0.6;
transition: opacity 0.2s;
}
.app .divContent .divItem .edit-icon:hover { opacity: 1; }

.app .divContent .divItem .divSplit {
height: 1px;
background: #eef3e8;
border: 0;
margin: 10px 0;
}

.app .divContent .divItem .divDefault {
display: flex;
align-items: center;
font-size: 13px;
color: #555;
line-height: 1.4;
}
:deep(.app .divContent .divItem .divDefault .van-checkbox__label) {
margin-left: 6px;
color: #555;
}

/* --- No Data State --- */
.app .divContent .no-data {
text-align: center;
padding: 40px 15px;
color: #999999;
font-size: 14px;
}

/* --- Fixed Bottom Button Area --- */
.app .divBottom {
position: fixed;
bottom: 0;
left: 0;
right: 0;
background-color: #ffffff;
padding: 10px 15px 15px 15px;
box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.06);
z-index: 10;
}

.app .divBottom .add-btn.van-button {
height: 44px;
border-radius: 22px;
font-size: 15px;
font-weight: 500;
background-color: #4CAF50;
border: none;
color: #ffffff;
}
.app .divBottom .add-btn.van-button:active {
background-color: #388e3c;
}
</style>