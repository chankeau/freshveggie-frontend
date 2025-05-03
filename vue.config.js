// vue.config.js
const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081, // 你前端的端口
    proxy: {
   
      '/api': { 
        target: 'http://localhost:9000', 
        changeOrigin: true, 
      
      }
   
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      }),
   
    ]
  }
});