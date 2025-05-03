//main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import apiClient from '@/plugins/axios';
import 'vant/lib/index.css'; // 引入 Vant 全局样式

// --- 导入 Pinia ---
import { createPinia } from 'pinia'; 

import {
    Button, Cell, CellGroup, Icon, Popup, Loading,
    Form, Field, RadioGroup, Radio, Uploader,
    Toast, Notify, Dialog,
    Tabs, Tab, Checkbox, Overlay, 
    List
} from 'vant';


(function (doc, win) {
    var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            if (clientWidth > 750) {
                docEl.style.fontSize = '100px';
            } else {
                docEl.style.fontSize = (clientWidth / 375) + 'px';
            }
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
// --- 移动端适配代码结束 ---

const app = createApp(App);

// --- 使用 Pinia ---
const pinia = createPinia(); // 现在 createPinia 已被定义
app.use(pinia);

// --- 使用路由 ---
app.use(router);

// --- 显式全局注册导入的 Vant 组件 ---
app.use(Button);
app.use(Cell);
app.use(CellGroup);
app.use(Icon);
app.use(Popup);
app.use(Loading);
app.use(Form);
app.use(Field);
app.use(RadioGroup);
app.use(Radio);
app.use(Uploader);
app.use(Toast);
app.use(Notify);
app.use(Dialog);
app.use(Tabs);
app.use(Tab);
app.use(Checkbox);
app.use(Overlay);
app.use(List);


// 将 axios 实例挂载到全局属性 (如果项目需要)
app.config.globalProperties.$axios = apiClient;

// --- 挂载应用 ---
app.mount('#app');