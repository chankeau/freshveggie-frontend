// src/api/login.js
import apiClient from '@/plugins/axios'; // 导入配置了 baseURL: 'http://localhost:9000/api' 的 Axios 实例

// 用户登录
export function loginApi(data) {
  return apiClient({
    // *** 修改：移除开头的 /api，只保留 Controller 及其后续路径 ***
    'url': '/user/login',
    'method': 'post',
    data
  });
}

// 用户退出登录
export function loginoutApi() {
  return apiClient({
    // *** 修改：移除开头的 /api，只保留 Controller 及其后续路径 ***
    // *** 注意: 后端 UserController 定义的是 loginout，所以这里也用 /user/loginout ***
    'url': '/user/loginout',
    'method': 'post',
  });
}

// 发送邮箱验证码
export function sendEmailCodeApi(data) {
  return apiClient({
    // *** 修改：移除开头的 /api，只保留 Controller 及其后续路径 ***
    'url': '/user/sendMsg',
    'method': 'post',
    data
  });
}

// 如果还有其他 user 相关的 API，也按照同样的方式修改 url