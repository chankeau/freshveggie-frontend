// src/api/common.js
import apiClient from '@/plugins/axios'; // 引入你的 Axios 实例

// 移除了未使用的 web_prefix, imgPath, parseUrl

/**
 * 上传文件 API (通常用于图片等)
 * @param {FormData} formData 包含 'file' 字段的 FormData 对象
 * @returns Promise<AxiosResponse>
 */
export const uploadFileApi = (formData) => {
  // 确认后端上传接口路径
  return apiClient.post('/common/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data' // 必须设置正确的请求头
    }
  });
};

// 如果你需要 imgPath 函数在前端其他地方使用，可以保留并导出它
// export function imgPath(path){
//     return '/common/download?name=' + path // 确保这个路径相对于你的后端服务是正确的
// }