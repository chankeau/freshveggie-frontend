// src/api/user.js
import apiClient from '@/plugins/axios'; // 导入配置了 baseURL 的实例

// 获取当前用户信息
export const getUserInfoApi = () => {
  // *** 修改：移除 /api，使用相对路径 ***
  return apiClient.get('/user/info');
};

// 更新用户头像
export const updateUserAvatarApi = (data) => {
   // *** 修改：移除 /api，使用相对路径 ***
  return apiClient.put('/user/avatar', data);
};

// 更新用户信息
export const updateUserInfoApi = (data) => {
   // *** 修改：移除 /api，使用相对路径 ***
  return apiClient.put('/user', data); // 对应后端的 PUT /api/user
};

// 如果这个文件还有其他 API 调用，确保 url 也是相对路径！