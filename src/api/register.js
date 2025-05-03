// src/api/register.js
import apiClient from '@/plugins/axios'; // 导入配置好的 Axios 实例

/**
 * 调用后端 API 注册新用户。
 * @param {object} data - 用户注册数据 (name, phone, email, sex, idNumber, code)
 * @returns Promise
 */
export function registerApi(data) { // 将函数命名为 registerApi 并导出
  return apiClient({
    url: '/user/register',
    method: 'post',
    data
  });
}