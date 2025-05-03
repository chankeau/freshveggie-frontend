<template>
  <div class="app address-edit-page">
    <div class="divHead">
      <div class="divTitle">
        <van-icon name="arrow-left" @click="goBack" class="back-icon"/>
        <span>{{ title }}</span>
      </div>
    </div>

    <div class="divContent">
      <!-- 使用 Vant Form -->
      <van-form @submit="saveAddress" class="address-form"> <!-- 移除了 .prevent，让 Vant 处理 -->
        <van-cell-group inset class="form-group"> <!-- 使用 Cell Group 组织 -->

          <!-- 联系人 -->
          <van-field
            v-model.trim="form.consignee"
            name="联系人" 
            label="联系人" 
            placeholder="请填写收货人的姓名"
            maxlength="10"
            clearable
            :rules="consigneeRules"
          >
            <!-- 将性别选择放在右侧插槽 -->
            <template #button>
              <van-radio-group v-model="form.sex" direction="horizontal" class="gender-radio-group-inline">
                <van-radio name="1" checked-color="#4CAF50">先生</van-radio>
                <van-radio name="0" checked-color="#4CAF50">女士</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <!-- 手机号 -->
          <van-field
            v-model.trim="form.phone"
            name="手机号"
            label="手机号"
            placeholder="请填写收货人手机号码"
            maxlength="11"
            clearable
            type="tel"
            :rules="phoneRules"
          />

          <!-- 收货地址 -->
          <van-field
            v-model.trim="form.detail"
            name="收货地址"
            label="收货地址"
            placeholder="请输入详细收货地址"
            maxlength="140"
            clearable
            type="textarea"
            rows="2"
            autosize
            :rules="detailRules"
            label-align="top" 
          />

          <!-- 标签 -->
          <van-field name="标签" label="标签" class="label-field">
            <!-- 使用 #input 插槽自定义标签输入 -->
            <template #input>
               <van-radio-group v-model="form.label" direction="horizontal" class="label-radio-group-inline">
                 <van-radio
                    v-for="(item, index) in labelList"
                    :key="index"
                    :name="item"
                    checked-color="#4CAF50"
                    class="label-radio-inline"
                 >
                    {{ item }}
                 </van-radio>
              </van-radio-group>
            </template>
          </van-field>

        </van-cell-group> <!-- Cell Group 结束 -->

        <!-- 按钮区域 -->
        <div class="actions">
            <van-button native-type="submit" block class="divSave">
              保存地址
            </van-button>
            <van-button type="default" block class="divDelete" @click="deleteAddress" v-if="form.id">
              删除地址
            </van-button>
         </div>
       </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showNotify, showConfirmDialog } from 'vant';

// *** 确认这里的导入路径和导出函数名绝对正确 ***
import {
  addressFindOneApi,
  updateAddressApi,
  addAddressApi,
  deleteAddressApi
} from '@/api/address';

// 表单验证规则定义在 setup 顶层
const consigneeRules = [{ required: true, message: '请填写联系人' }];
const phoneRules = [
  { required: true, message: '请填写手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
];
const detailRules = [{ required: true, message: '请填写收货地址' }];

const router = useRouter();
const route = useRoute();
const isEditMode = ref(false);
const title = computed(() => (isEditMode.value ? '编辑收货地址' : '新增收货地址'));

const form = ref({
  id: undefined,
  consignee: '',
  phone: '',
  sex: '1',
  detail: '',
  label: '无',
});

const labelList = ['无', '公司', '家', '学校'];

const goBack = () => {
  router.back();
};

const fetchAddressData = async (addressId) => {
    console.log(`Fetching address data for ID: ${addressId}`);
    try {
        const response = await addressFindOneApi(addressId);
        console.log('fetchAddressData response:', response);
        if (response?.data?.code === 1) {
            form.value = response.data.data;
            if (!labelList.includes(form.value.label)) { form.value.label = '无'; }
            console.log('Address data loaded:', form.value);
        } else {
            showNotify({ type: 'warning', message: response?.data?.msg || '获取地址信息失败' });
            router.replace('/address');
        }
    } catch (error) {
        console.error("Error fetching address:", error);
        showNotify({ type: 'danger', message: '加载地址失败' });
        router.replace('/address');
    }
};

// --- 核心函数：保存地址 (带日志) ---
const saveAddress = async (values) => { // Vant Form 提交时会传递表单值
  console.log('1. saveAddress triggered. Form values from Vant:', values); // values 是 Vant Form 收集的数据
  // 通常 values 和 form.value 是一致的，但用 Vant 传递的 values 可能更稳妥
  console.log('2. Current form ref:', JSON.parse(JSON.stringify(form.value)));

  try {
    let apiPromise;
    let apiFn;
    // 使用 form.value 或 values 都可以，这里用 form.value 保持一致性
    const dataToSend = form.value;

    console.log('4. Is Edit Mode:', isEditMode.value);
    if (isEditMode.value) {
      apiFn = updateAddressApi;
      console.log('5a. Preparing update call. API function defined?', typeof apiFn === 'function');
      if (typeof apiFn !== 'function') throw new Error('updateAddressApi is not a function');
      apiPromise = apiFn(dataToSend); // 发送数据
      console.log('5b. Update Promise created');
    } else {
      apiFn = addAddressApi;
      console.log('6a. Preparing add call. API function defined?', typeof apiFn === 'function');
      if (typeof apiFn !== 'function') throw new Error('addAddressApi is not a function');
      apiPromise = apiFn(dataToSend); // 发送数据
      console.log('6b. Add Promise created');
    }

    if (!apiPromise || typeof apiPromise.then !== 'function') {
         throw new Error('API function did not return a valid Promise!');
    }
    console.log('7. Awaiting API Promise...');
    const response = await apiPromise;
    console.log('8. API Promise resolved/rejected. Response:', response);

    if (response?.data?.code === 1) {
      console.log('9. Success logic');
      showToast(isEditMode.value ? '修改成功' : '添加成功');
      const redirectPath = route.query.redirect ? decodeURIComponent(route.query.redirect) : '/address';
      console.log('Redirecting to:', redirectPath);
      router.replace(redirectPath);
    } else {
      console.log('10. Failure logic');
      showNotify({ type: 'warning', message: response?.data?.msg || '保存失败' });
    }
  } catch (error) {
    console.error("11. Error caught in saveAddress:", error);
    if (error?.message?.includes('is not a function') || error?.message?.includes('did not return a valid Promise')) {
        showNotify({ type: 'danger', message: '内部配置错误，请联系管理员' });
    } else {
        showNotify({ type: 'danger', message: '保存地址时发生错误，请重试' });
    }
  }
  console.log('12. saveAddress end');
};
// --- 核心函数结束 ---

const deleteAddress = async () => {
    if (!form.value.id) return;
    console.log('Attempting to delete address ID:', form.value.id);
    try {
        await showConfirmDialog({
            title: '确认删除', message: '确认要删除当前地址吗？', confirmButtonColor: '#e64a19',
        });
        console.log('Deletion confirmed');
        const response = await deleteAddressApi({ ids: form.value.id });
        console.log('deleteAddress response:', response);
        if (response?.data?.code === 1) {
            showToast('删除成功');
            router.replace('/address');
        } else {
            showNotify({ type: 'warning', message: response?.data?.msg || '删除失败' });
        }
    } catch (error) {
        if (error !== 'cancel') {
           console.error("Error deleting address:", error);
           showNotify({ type: 'danger', message: '删除地址时出错' });
        } else {
           console.log('User cancelled deletion');
        }
    }
};

onMounted(() => {
  const addressId = route.params.id;
  console.log('Address Edit Page Mounted. Address ID from route:', addressId);
  if (addressId) {
    isEditMode.value = true;
    fetchAddressData(addressId);
  } else {
    isEditMode.value = false;
    console.log('New address mode. Initial form state:', form.value);
  }
});
</script>

<style scoped>
.app.address-edit-page { height: 100vh; display: flex; flex-direction: column; background-color: #f8fbf6; overflow: hidden; }
.app .divHead { background: #ffffff; height: 50px; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid #ebedf0; flex-shrink: 0; box-sizing: border-box; }
.app .divHead .divTitle { position: relative; text-align: center; height: 100%; line-height: 50px; font-size: 17px; font-weight: 500; color: #333333; }
.app .divHead .back-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #555; cursor: pointer; }
.app .divContent { flex-grow: 1; overflow-y: auto; padding: 0 0 20px 0; box-sizing: border-box; } /* Remove horizontal padding */

.app .address-form { background-color: transparent; border-radius: 0; margin-top: 12px; box-shadow: none; overflow: visible; }
/* Add inset style for visual grouping */
.app .address-form .form-group { margin: 0 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(139, 195, 74, 0.1); }

/* Vant Field in Cell Group */
:deep(.app .address-form .van-cell) { padding-top: 12px; padding-bottom: 12px; align-items: center; } /* Adjust padding */
:deep(.app .address-form .van-field__label) { width: 75px; margin-right: 10px; color: #555; line-height: normal; } /* Label styles */
:deep(.app .address-form .van-field__label--top) { margin-bottom: 8px; width: 100%; } /* Top aligned label */
:deep(.app .address-form .van-field__body) { align-items: center; } /* Align input area */
:deep(.app .address-form .van-field__control) { font-size: 15px; }
:deep(.app .address-form .van-field__control::placeholder) { color: #aeaeae; font-size: 15px; }
/* Remove individual field bottom border when inside cell group */
:deep(.app .address-form .form-group .van-cell::after) { border-bottom: none; }
/* Add border back between cells in the group */
:deep(.app .address-form .form-group .van-cell:not(:last-child)::after) {
    position: absolute; box-sizing: border-box; content: ' '; pointer-events: none; right: 16px; bottom: 0; left: 16px;
    border-bottom: 1px solid #eef3e8; /* Use theme separator color */ transform: scaleY(.5);
}


/* Gender Radio specific adjustments */
.gender-radio-group-inline { display: flex; flex-shrink: 0; padding-left: 10px; }
.gender-radio-group-inline .van-radio { margin-left: 15px; }
:deep(.gender-radio-group-inline .van-radio__label) { font-size: 15px; color: #333; }

/* Label Radio specific adjustments */
.label-field :deep(.van-field__label) { align-self: flex-start; padding-top: 4px; } /* Align label top */
.label-radio-group-inline { display: flex; flex-wrap: wrap; flex-grow: 1; }
.label-radio-group-inline .label-radio-inline.van-radio {
    margin-right: 10px; margin-bottom: 8px; padding: 3px 8px; border: 1px solid #eee;
    border-radius: 15px; line-height: 1;
}
:deep(.label-radio-group-inline .label-radio-inline .van-radio__label) { color: #555; font-size: 13px; line-height: inherit; }
:deep(.label-radio-group-inline .label-radio-inline[aria-checked='true']) { border-color: #4CAF50; background-color: #e8f5e9; }
:deep(.label-radio-group-inline .label-radio-inline[aria-checked='true'] .van-radio__label) { color: #4CAF50; }
:deep(.label-radio-group-inline .label-radio-inline .van-radio__icon) { display: none; }


/* --- Action Buttons --- */
.app .divContent .actions { margin-top: 30px; padding: 0 15px; } /* Add horizontal padding back */

.app .divContent .divSave.van-button {
  height: 44px; border-radius: 22px; font-size: 16px; font-weight: 500;
  background-color: #4CAF50; border: none; color: #ffffff;
}
.app .divContent .divSave.van-button:active { background-color: #388e3c; }

.app .divContent .divDelete.van-button {
  height: 44px; border-radius: 22px; font-size: 16px; font-weight: 500;
  background-color: #ffffff; border: 1px solid #e64a19; /* Use danger color for border */
  color: #e64a19; margin-top: 15px;
}
.app .divContent .divDelete.van-button:active { background-color: #ffebee; border-color: #d32f2f; color: #d32f2f; }

</style>