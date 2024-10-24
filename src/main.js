import { createApp } from 'vue'
import './style.css'
import router from "./router/index";
import App from './App.vue'
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

 axios.defaults.baseURL='http://124.223.171.19:8080/' //A可用
//axios.defaults.baseURL='http://101.43.94.172:8080/' //B可用
// axios.defaults.baseURL='http://124.222.196.78:8080/' //E可用
// axios.defaults.baseURL='http://124.221.254.11:8080/' //C
// axios.defaults.baseURL='http://124.223.210.53:8080/' //D
//axios.defaults.baseURL='http://10.96.228.235:8080/' //F

const app=createApp(App)
app.provide('$axios', axios)
app.use(router)
app.use(ElementPlus)

// 全局注册图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
  
app.mount('#app')

