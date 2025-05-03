// src/api/order.js
import apiClient from '@/plugins/axios'; // 导入配置了 baseURL 的实例

// 提交订单
export function addOrderApi(data) {
  return apiClient({
    // 正确：相对路径 '/order/submit' (对应 OrderDetailController 的 @PostMapping("/submit"))
    'url': '/order/submit',
    'method': 'post',
    data
  });
}

// 查询所有订单 (注意：OrderDetailController 没有定义 /order/list，这个接口可能无效)
// 如果需要查询所有订单，可能需要添加一个后端接口，或者使用分页接口并设置很大 pageSize
export function orderListApi() {
  return apiClient({
    // *** 注意：后端没有 /order/list, 访问会 404，除非你添加了 ***
    'url': '/order/list', // 或者你需要调用的是用户分页 '/order/userPage'？
    'method': 'get',
  });
}

// 分页查询用户订单
export function orderPagingApi(params) {
  return apiClient({
    // 正确：相对路径 '/order/userPage' (对应 OrderDetailController 的 @GetMapping("/userPage"))
    'url': '/order/userPage',
    'method': 'get',
    params
  });
}

// 再来一单
export function orderAgainApi(data) {
  return apiClient({
    // 正确：相对路径 '/order/again' (对应 OrderDetailController 的 @PostMapping("/again"))
    'url': '/order/again',
    'method': 'post',
    data
  });
}