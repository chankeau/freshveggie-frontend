<template>
  <div class="app user-info-page">
    <div class="divHead">
      <div class="divTitle">
        <van-icon name="arrow-left" @click="goBack" class="back-icon" />
        <span>编辑个人资料</span>
      </div>
    </div>

    <div class="divContent">
      <van-form @submit="saveUserInfo" class="user-info-form">
        <!-- 头像部分 -->
        <van-cell-group inset class="form-group avatar-group">
          <van-cell title="头像" is-link @click="triggerAvatarUpload">
            <template #value>
              <!-- 直接使用 Store 的计算属性展示头像 -->
              <img :src="userStore.userAvatarUrl" class="avatar-display" @error="setDefaultAvatar" alt="Avatar" />
            </template>
          </van-cell>
          <!-- 隐藏的上传组件 -->
          <van-uploader
            ref="uploaderRef"
            v-model="fileList"
            :after-read="handleFileSelect"
            :max-count="1"
            :max-size="2 * 1024 * 1024"
            @oversize="onOversize"
            accept="image/*"
            result-type="file"
            class="hidden-uploader"
          />
           <van-loading v-if="isUploadingAvatar" size="20px" class="avatar-cell-loading" />
        </van-cell-group>

        <!-- 其他信息表单 -->
        <van-cell-group inset class="form-group">
          <van-field
            v-model.trim="form.name"
            name="用户名"
            label="用户名"
            placeholder="请输入用户名"
            maxlength="50"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field name="性别" label="性别">
             <template #input>
                 <van-radio-group v-model="form.sex" direction="horizontal">
                   <van-radio name="1" checked-color="#4CAF50">男</van-radio>
                   <van-radio name="0" checked-color="#4CAF50">女</van-radio>
                 </van-radio-group>
             </template>
          </van-field>
           <van-field
            v-model.trim="form.phone"
            name="手机号"
            label="手机号"
            placeholder="请输入手机号"
            type="tel"
            maxlength="11"
            :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]"

          />
          <van-field
            v-model.trim="form.email"
            name="邮箱"
            label="邮箱"
            placeholder="请输入邮箱"
            type="email"

            :rules="[{ required: false, message: '请输入有效邮箱' }, { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确' }]"
          />
        </van-cell-group>

        <!-- 保存按钮 -->
        <div class="actions">
          <van-button native-type="submit" block class="save-btn" :loading="isSaving">
            保存修改
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'; // 使用 reactive
import { useRouter } from 'vue-router';
import { showToast, showNotify } from 'vant';
import { uploadFileApi } from '@/api/common';
import { updateUserInfoApi, updateUserAvatarApi } from '@/api/user'; // 只需更新接口
import defaultAvatar from '@/assets/images/default-avatar.png';
import { useUserStore } from '@/stores/user'; // 导入 Pinia Store

const router = useRouter();
const userStore = useUserStore(); // 获取 store 实例
const uploaderRef = ref(null); // 用于触发上传
const fileList = ref([]); // 用于 v-model 绑定，上传后清空

// 使用 reactive 创建表单数据对象，并从 Pinia Store 初始化
const form = reactive({
  id: userStore.userId, // 从 store 获取 ID
  name: userStore.userName,
  phone: userStore.userPhone,
  email: userStore.userEmail || '', // 从 store 获取 Email，确保有初始值
  sex: userStore.userSex || '1', // 从 store 获取 Sex，确保有初始值
});

const isSaving = ref(false); // 保存按钮加载状态
const isUploadingAvatar = ref(false); // 头像上传加载状态

// 返回上一页
const goBack = () => { router.back(); };

// 触发隐藏的 van-uploader
const triggerAvatarUpload = () => {
    uploaderRef.value?.chooseFile();
};

// 文件选择后的处理（after-read 回调）
const handleFileSelect = (fileWrapper) => {
    if (!fileWrapper || !fileWrapper.file) return;
    console.log("文件已选择:", fileWrapper.file.name);
    uploadAndSaveAvatar(fileWrapper.file); // 调用上传和更新逻辑
    fileList.value = []; // 清空上传列表，以便下次选择
};

// 上传头像并更新后端和 Store
const uploadAndSaveAvatar = async (file) => {
    isUploadingAvatar.value = true;
    const formData = new FormData();
    formData.append('file', file);

    try {
        // 1. 上传文件获取文件名
        console.log("[头像上传] 正在上传文件...");
        const uploadResponse = await uploadFileApi(formData);
        console.log("[头像上传] 上传接口响应:", uploadResponse?.data);

        if (uploadResponse?.data?.code === 1 && uploadResponse.data.data) {
            const newAvatarFilename = uploadResponse.data.data;
            console.log(`[头像上传] 上传成功，获得文件名: ${newAvatarFilename}`);

            // 2. 调用后端接口，更新用户表中的 avatar 字段
            console.log("[头像上传] 正在调用后端更新用户头像接口...");
            const updateResponse = await updateUserAvatarApi({ avatar: newAvatarFilename });
            console.log("[头像上传] 更新头像接口响应:", updateResponse?.data);

            if (updateResponse?.data?.code === 1) {
                // 3. 更新成功后，更新 Pinia Store
                console.log("[头像上传] 后端更新成功，正在更新本地 Store...");
                userStore.updateAvatar(newAvatarFilename);
                showToast('头像更新成功');
            } else {
                // --- 新增：记录后端更新失败信息 ---
                console.warn(`[头像上传] 后端更新头像失败。响应码: ${updateResponse?.data?.code}, 消息: ${updateResponse?.data?.msg}`);
                showNotify({ type: 'warning', message: updateResponse?.data?.msg || '更新头像信息失败' });
            }
        } else {
            // --- 新增：记录上传失败信息 ---
            console.warn(`[头像上传] 文件上传接口失败。响应码: ${uploadResponse?.data?.code}, 消息: ${uploadResponse?.data?.msg}`);
            showNotify({ type: 'warning', message: uploadResponse?.data?.msg || '图片上传失败' });
        }
    } catch (error) {
        console.error("[头像上传] 上传或更新头像过程中发生异常:", error);
        showNotify({ type: 'danger', message: '头像上传操作失败' });
    } finally {
        isUploadingAvatar.value = false;
    }
};

// 处理文件过大
const onOversize = () => { showToast('文件大小不能超过 2MB'); };

// 头像加载失败时的处理
const setDefaultAvatar = (event) => {
    console.warn('[头像加载] 加载头像失败，使用默认头像');
    event.target.src = defaultAvatar; // 确保 defaultAvatar 已正确导入
};

// 保存用户信息（包括手机和邮箱）
const saveUserInfo = async () => {
    isSaving.value = true;
    // 使用 JSON.parse(JSON.stringify(...)) 来获取纯净的对象副本进行打印
    console.log("[保存信息] 准备保存用户信息:", JSON.parse(JSON.stringify(form)));
    try {
        // 准备发送给后端的数据
        const dataToUpdate = {
            id: form.id, // 确保 ID 已从 store 正确获取
            name: form.name,
            sex: form.sex,
            phone: form.phone, // 包含手机号
            email: form.email, // 包含邮箱
        };

        if (!dataToUpdate.id) {
            console.error("[保存信息] 用户 ID 为空，无法保存！");
            showNotify({ type: 'danger', message: '无法获取用户ID，请重新登录' });
            isSaving.value = false;
            return;
        }

        // 调用后端 API 更新用户信息
        console.log("[保存信息] 正在调用后端更新用户信息接口...");
        const response = await updateUserInfoApi(dataToUpdate);
        console.log("[保存信息] 更新用户信息接口响应:", response?.data);

        if (response?.data?.code === 1) {
            // 更新成功后，更新 Pinia Store
             console.log("[保存信息] 后端更新成功，正在更新本地 Store...");
            userStore.updateUserProfile({
                name: form.name,
                sex: form.sex,
                phone: form.phone,
                email: form.email,
            });

            showToast('信息保存成功');
            setTimeout(() => router.back(), 800); // 延迟返回，让用户看到提示
        } else {
            // --- 新增：记录保存失败信息 ---
            console.warn(`[保存信息] 后端保存用户信息失败。响应码: ${response?.data?.code}, 消息: ${response?.data?.msg}`);
            showNotify({ type: 'warning', message: response?.data?.msg || '保存失败' });
        }
    } catch (error) {
        console.error("[保存信息] 保存用户信息时发生异常:", error);
        showNotify({ type: 'danger', message: '保存信息时出错' });
    } finally {
        isSaving.value = false;
    }
};

// 组件挂载时的逻辑
onMounted(() => {
    if (!form.id) {
        console.warn("[用户信息页] 组件挂载时：用户 ID 未从 Store 加载，可能导致更新失败");
        // 可以考虑强制重新加载或提示错误
    }
    console.log("[用户信息页] 组件已挂载。从 Store 加载的初始表单状态:", JSON.parse(JSON.stringify(form)));
});
</script>

<style scoped>
.user-info-page { background-color: #f8fbf6; }
.divHead { background: #ffffff; height: 50px; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid #ebedf0; flex-shrink: 0; box-sizing: border-box; }
.divHead .divTitle { position: relative; text-align: center; height: 100%; line-height: 50px; font-size: 17px; font-weight: 500; color: #333333; }
.divHead .back-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #555; cursor: pointer; }

.divContent { padding: 0; flex-grow: 1; overflow-y: auto; }
.user-info-form { margin-top: 12px; }

.form-group { margin: 0 15px 12px 15px !important; border-radius: 8px !important; overflow: hidden; box-shadow: 0 1px 4px rgba(139, 195, 74, 0.1); }
.form-group.avatar-group { margin-bottom: 12px; }

:deep(.avatar-group .van-cell__title) { display: flex; align-items: center; }
:deep(.avatar-group .van-cell__value) { display: flex; align-items: center; justify-content: flex-end; }
.avatar-display { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
.avatar-cell-loading { margin-left: 8px; }

.hidden-uploader { display: none; }

:deep(.form-group .van-cell) { padding-top: 14px; padding-bottom: 14px; align-items: center; }
:deep(.form-group .van-field__label) { width: 80px; margin-right: 10px; color: #555; line-height: normal; flex-shrink: 0; }
:deep(.form-group .van-field__control) { font-size: 15px; }
:deep(.form-group .van-field__control::placeholder) { color: #aeaeae; font-size: 15px; }
:deep(.form-group .van-cell:not(:last-child)::after) { border-bottom: 1px solid #eef3e8; left: 16px; right: 16px; }

:deep(.van-field--readonly .van-field__control) { color: #999; }

:deep(.van-field__body .van-radio-group) { display: flex; align-items: center; }
:deep(.van-field__body .van-radio) { margin-right: 15px; }
:deep(.van-field__body .van-radio__label) { font-size: 15px; color: #333; }

:deep(.van-field__right-icon .van-icon) { color: #969799; cursor: pointer; }

.actions { margin: 30px 15px 20px 15px; }
.save-btn.van-button { height: 44px; border-radius: 22px; font-size: 16px; font-weight: 500; background-color: #4CAF50; border: none; color: #ffffff; }
.save-btn.van-button:disabled { background-color: #a5d6a7; opacity: 0.7; }
.save-btn.van-button:active { background-color: #388e3c; }
</style>