import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import defaultAvatarImg from '@/assets/images/default-avatar.png';

export const useUserStore = defineStore('user', () => {
  const userId = ref(localStorage.getItem("userId") || null);
  const userName = ref(localStorage.getItem("userName") || '用户');
  const userPhone = ref(localStorage.getItem("userPhone") || '');
  const userEmail = ref(localStorage.getItem("userEmail") || '');
  const userSex = ref(localStorage.getItem("userSex") || '1');
  const storedAvatar = localStorage.getItem("userAvatar");
  const userAvatarFilename = ref(storedAvatar === 'null' || storedAvatar === null || storedAvatar === '' ? null : storedAvatar);

  const userAvatarUrl = computed(() => {
    const backendBaseUrl = 'http://localhost:9000';
    if (userAvatarFilename.value) {
      return `${backendBaseUrl}/api/common/download?name=${encodeURIComponent(userAvatarFilename.value)}`; 
    }
    return defaultAvatarImg;
  });

  function updateAvatar(newFilename) {
    console.log(`[用户Store 调试] updateAvatar: 收到新文件名: '${newFilename}' (类型: ${typeof newFilename})`);
    try {
      const filenameToStore = newFilename || null;
      userAvatarFilename.value = filenameToStore;
      console.log(`[用户Store 调试] updateAvatar: userAvatarFilename ref 更新为:`, userAvatarFilename.value);

      const storageValue = filenameToStore === null ? '' : String(filenameToStore);
      console.log(`[用户Store 调试] updateAvatar: 尝试将 localStorage 'userAvatar' 设置为: '${storageValue}'`);
      localStorage.setItem("userAvatar", storageValue);

      const readBackValue = localStorage.getItem("userAvatar");
      console.log(`[用户Store 调试] updateAvatar: 从 localStorage 'userAvatar' 回读的值: '${readBackValue}'`);
      if (readBackValue !== storageValue) {
          console.error("[用户Store 调试] updateAvatar: !! LocalStorage 'userAvatar' 写入验证失败 !!");
      } else {
          console.log("[用户Store 调试] updateAvatar: LocalStorage 'userAvatar' 写入验证成功。");
      }

      console.log("[用户Store 调试] updateAvatar: 头像文件名在 store 和 localStorage 中更新处理完成。");
      return true;
    } catch (error) {
      console.error("[用户Store 调试] updateAvatar: 更新头像文件名时出错:", error);
      return false;
    }
  }

  function updateUserProfile(profileData) {
    console.log("[用户Store 调试] updateUserProfile: 收到数据:", profileData);
    let allStorageVerified = true; // 增加一个标志来跟踪所有 localStorage 写入是否都验证成功
    try {
      if (profileData.name !== undefined) {
        const newValue = profileData.name;
        userName.value = newValue;
        console.log(`[用户Store 调试] updateUserProfile: 更新 ref userName 为 ${userName.value}`);
        console.log(`[用户Store 调试] updateUserProfile: 尝试将 localStorage 'userName' 设置为: '${newValue}'`);
        localStorage.setItem("userName", newValue);
        const readBack = localStorage.getItem("userName");
        if (readBack !== newValue) {
            console.error(`[用户Store 调试] updateUserProfile: !! LocalStorage 'userName' 写入验证失败 !! (预期: '${newValue}', 实际: '${readBack}')`);
            allStorageVerified = false;
        } else {
            console.log("[用户Store 调试] updateUserProfile: LocalStorage 'userName' 写入验证成功。");
        }
      }
      if (profileData.sex !== undefined) {
        const newValue = String(profileData.sex);
        userSex.value = newValue;
        console.log(`[用户Store 调试] updateUserProfile: 更新 ref userSex 为 ${userSex.value}`);
        console.log(`[用户Store 调试] updateUserProfile: 尝试将 localStorage 'userSex' 设置为: '${newValue}'`);
        localStorage.setItem("userSex", newValue);
        const readBack = localStorage.getItem("userSex");
        if (readBack !== newValue) {
            console.error(`[用户Store 调试] updateUserProfile: !! LocalStorage 'userSex' 写入验证失败 !! (预期: '${newValue}', 实际: '${readBack}')`);
            allStorageVerified = false;
        } else {
            console.log("[用户Store 调试] updateUserProfile: LocalStorage 'userSex' 写入验证成功。");
        }
      }
      if (profileData.phone !== undefined) {
        const newValue = profileData.phone;
        userPhone.value = newValue;
        console.log(`[用户Store 调试] updateUserProfile: 更新 ref userPhone 为 ${userPhone.value}`);
        console.log(`[用户Store 调试] updateUserProfile: 尝试将 localStorage 'userPhone' 设置为: '${newValue}'`);
        localStorage.setItem("userPhone", newValue);
        const readBack = localStorage.getItem("userPhone");
        if (readBack !== newValue) {
            console.error(`[用户Store 调试] updateUserProfile: !! LocalStorage 'userPhone' 写入验证失败 !! (预期: '${newValue}', 实际: '${readBack}')`);
            allStorageVerified = false;
        } else {
            console.log("[用户Store 调试] updateUserProfile: LocalStorage 'userPhone' 写入验证成功。");
        }
      }
      if (profileData.email !== undefined) {
        const newValue = profileData.email || '';
        userEmail.value = newValue;
        console.log(`[用户Store 调试] updateUserProfile: 更新 ref userEmail 为 ${userEmail.value}`);
        console.log(`[用户Store 调试] updateUserProfile: 尝试将 localStorage 'userEmail' 设置为: '${newValue}'`);
        localStorage.setItem("userEmail", newValue);
        const readBack = localStorage.getItem("userEmail");
         if (readBack !== newValue) {
            console.error(`[用户Store 调试] updateUserProfile: !! LocalStorage 'userEmail' 写入验证失败 !! (预期: '${newValue}', 实际: '${readBack}')`);
            allStorageVerified = false;
        } else {
            console.log("[用户Store 调试] updateUserProfile: LocalStorage 'userEmail' 写入验证成功。");
        }
      }
      console.log(`[用户Store 调试] updateUserProfile: 个人资料更新处理完成。LocalStorage 验证结果: ${allStorageVerified ? '全部成功' : '存在失败'}`);
      return allStorageVerified; // 返回验证结果可能更有用
    } catch (error) {
      console.error("[用户Store 调试] updateUserProfile: 更新用户资料时出错:", error);
      return false;
    }
  }

  function loadUserFromStorage() {
    console.log("[用户Store 调试] loadUserFromStorage: 尝试从 localStorage 加载用户信息。");
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    const storedUserPhone = localStorage.getItem("userPhone");
    const storedUserEmail = localStorage.getItem("userEmail");
    const storedUserSex = localStorage.getItem("userSex");
    const storedUserAvatar = localStorage.getItem("userAvatar");

    userId.value = storedUserId || null;
    userName.value = storedUserName || '用户';
    userPhone.value = storedUserPhone || '';
    userEmail.value = storedUserEmail || '';
    userSex.value = storedUserSex || '1';
    userAvatarFilename.value = storedUserAvatar === 'null' || storedUserAvatar === null || storedUserAvatar === '' ? null : storedUserAvatar;

    console.log(`[用户Store 调试] loadUserFromStorage: 加载的值 - userId: ${userId.value}, userName: ${userName.value}, userPhone: ${userPhone.value}, userEmail: ${userEmail.value}, userSex: ${userSex.value}, userAvatarFilename (ref): ${userAvatarFilename.value} (来自存储的原始值: '${storedUserAvatar}')`);
  }

  function clearUserInfo() {
    console.log("[用户Store 调试] clearUserInfo: 正在从 store 和 localStorage 清除用户信息。");
    userId.value = null;
    userName.value = '用户';
    userPhone.value = '';
    userEmail.value = '';
    userSex.value = '1';
    userAvatarFilename.value = null;

    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userSex');
    localStorage.removeItem('userAvatar');
    console.log("[用户Store 调试] clearUserInfo: 已清除。");
  }

  function loginSuccess(userData) {
      console.log("[用户Store 调试] loginSuccess: 收到用户数据:", userData);
      if (!userData || !userData.id) {
          console.error("[用户Store 调试] loginSuccess: 收到的 userData 无效 (缺少 id)。操作中止。");
          return false;
      }
      try {
          const userIdStr = String(userData.id);
          const userNameStr = userData.name || '用户';
          const userPhoneStr = userData.phone || '';
          const userEmailStr = userData.email || '';
          const userSexStr = String(userData.sex ?? '1');
          const avatarFilename = userData.avatar || null;

          console.log(`[用户Store 调试] loginSuccess: 解析的值 - userId: ${userIdStr}, userName: ${userNameStr}, userPhone: ${userPhoneStr}, userEmail: ${userEmailStr}, userSex: ${userSexStr}, avatarFilename: ${avatarFilename}`);

          localStorage.setItem('userId', userIdStr);
          localStorage.setItem('userName', userNameStr);
          localStorage.setItem('userPhone', userPhoneStr);
          localStorage.setItem('userEmail', userEmailStr);
          localStorage.setItem('userSex', userSexStr);
          const avatarStorageValue = avatarFilename === null ? '' : String(avatarFilename);
          localStorage.setItem('userAvatar', avatarStorageValue);
          console.log(`[用户Store 调试] loginSuccess: 设置 localStorage 'userAvatar' 为: '${avatarStorageValue}'`);

          userId.value = userIdStr;
          userName.value = userNameStr;
          userPhone.value = userPhoneStr;
          userEmail.value = userEmailStr;
          userSex.value = userSexStr;
          userAvatarFilename.value = avatarFilename;

          console.log(`[用户Store 调试] loginSuccess: Pinia 状态已更新。 userId: ${userId.value}, avatar: ${userAvatarFilename.value}`);
          return true;
      } catch(error) {
          console.error("[用户Store 调试] loginSuccess: 处理登录数据时出错:", error);
          return false;
      }
  }

  return {
    userId,
    userName,
    userPhone,
    userEmail,
    userSex,
    userAvatarFilename,
    userAvatarUrl,
    updateAvatar,
    updateUserProfile,
    loadUserFromStorage,
    clearUserInfo,
    loginSuccess,
  };
});