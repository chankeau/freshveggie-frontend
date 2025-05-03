// src/api/index.js (或其他存放 API 函数的文件)

// 1. 导入我们配置好的 Axios 实例
import apiClient from '@/plugins/axios'; // <--- 从我们创建的 axios.js 导入，@ 代表 src 目录


//获取所有的商品分类
export function categoryListApi() { // 添加 export，方便其他文件导入
    // return $axios({ // 原来的代码
    return apiClient({ // <--- 使用导入的 apiClient
        'url': '/category/list', // baseURL 会自动添加到前面
        'method': 'get',
    })
}

//获取商品分类对应的商品
export function dishListApi(data) { // 添加 export
    // return $axios({ // 原来的代码
    return apiClient({ // <--- 使用导入的 apiClient
        'url': '/dish/list',
        'method': 'get',
        params:{...data}
    })
}

//获取商品分类对应的套餐
export function setmealListApi(data) { // 添加 export
    // return $axios({ // 原来的代码
    return apiClient({ // <--- 使用导入的 apiClient
        'url': '/setmeal/list',
        'method': 'get',
        params:{...data}
    })
}

//获取购物车内商品的集合
export function cartListApi(data) { // 添加 export
    // return $axios({ // 原来的代码
    return apiClient({ // <--- 使用导入的 apiClient
        'url': '/shoppingCart/list',
        'method': 'get',
        params:{...data}
    })
}

//购物车中添加商品
export function addCartApi(data){ // 添加 export
    // return $axios({ // 原来的代码
    return apiClient({ // <--- 使用导入的 apiClient
        'url': '/shoppingCart/add',
        'method': 'post',
        data // POST 请求通常用 data 属性发送请求体
    })
}

//购物车中修改商品 (看你接口是 sub 还是 update)
export function updateCartApi(data){ // 添加 export
    // return $axios({ // 原来的代码
    return apiClient({ // <--- 使用导入的 apiClient
        'url': '/shoppingCart/sub', // 或者其他更新接口路径
        'method': 'post', // 或者 'put'，看后端接口定义
        data
    })
}

//删除购物车的商品
export function clearCartApi() { // 添加 export
    // return $axios({ // 原来的代码
    return apiClient({ // <--- 使用导入的 apiClient
        'url': '/shoppingCart/clean',
        'method': 'delete',
    })
}

//获取套餐的全部商品
export function setMealDishDetailsApi(id) { // 添加 export
    // return $axios({ // 原来的代码
    return apiClient({ // <--- 使用导入的 apiClient
        'url': `/setmeal/dish/${id}`, // 模板字符串拼接 ID
        'method': 'get',
    })
}
/**
 * 根据ID获取菜品详细信息
 */
export const getDishDetailApi = (id) => {
    // 使用你已配置的 apiClient 实例
    return apiClient({
      // 确认这个路径是否与你的 DishController 中的 GET mapping 匹配
      url: `/dish/${id}`,
      method: 'get'
    });
  };
  
  /**
   * 根据ID获取套餐详细信息
   */
  export const getSetmealDetailApi = (id) => {
    // 使用你已配置的 apiClient 实例
    return apiClient({
      // 确认这个路径是否与你的 SetmealController 中的 GET mapping 匹配
      url: `/setmeal/${id}`,
      method: 'get'
      // 如果需要同时获取套餐内包含的菜品列表，后端接口可能需要设计成一次返回
      // 或者你可能需要额外调用 setMealDishDetailsApi(id)
    });
  };