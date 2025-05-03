// src/api/address.js
import apiClient from '@/plugins/axios'; 

// 获取所有地址
export function addressListApi() {
  return apiClient({
    'url': '/addressBook/list',
    'method': 'get',
  });
}

export function addressLastUpdateApi() {
  return apiClient({
    'url': '/addressBook/lastUpdate',
    'method': 'get',
  });
}

// 新增地址
export function addAddressApi(data) {
  return apiClient({
    'url': '/addressBook',
    'method': 'post',
    data
  });
}

// 修改地址
export function updateAddressApi(data) {
  return apiClient({
    'url': '/addressBook',
    'method': 'put',
    data
  });
}

// 删除地址 (注意：DELETE 请求通常将 ID 放在 URL 或 params 中，而不是 data)
// 确认你的后端是如何接收删除参数的
export function deleteAddressApi(params) { // 如果后端期望 /addressBook?ids=xxx
// export function deleteAddressApi(data) { // 如果后端期望在请求体中接收 {ids: xxx}
// export function deleteAddressApi(id) { // 如果后端期望 /addressBook/xxx
  return apiClient({
    'url': '/addressBook',
    'method': 'delete',
    params // 如果后端期望查询参数 ?ids=xxx
    // data // 如果后端期望请求体 {ids: xxx}
    // url: `/addressBook/${id}` // 如果后端期望 /addressBook/xxx 路径参数
  });
}

// 查询单个地址
export function addressFindOneApi(id) {
  return apiClient({
    'url': `/addressBook/${id}`, // ID 作为路径参数
    'method': 'get',
  });
}

// 设置默认地址
export function setDefaultAddressApi(data) {
  return apiClient({
    'url': '/addressBook/default',
    'method': 'put',
    data // 通常需要传递要设为默认的地址 ID，如 { id: xxx }
  });
}

// 获取默认地址
export function getDefaultAddressApi() {
  return apiClient({
    'url': `/addressBook/default`,
    'method': 'get',
  });
}