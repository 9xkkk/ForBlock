import { createApp } from 'vue'
import './style.css'
import router from "./router/index";
import App from './App.vue'
import axios from 'axios'





// axios.defaults.baseURL='http://124.223.171.19:9090/' //A可用
axios.defaults.baseURL='http://101.43.94.172:9091/' //B可用
// axios.defaults.baseURL='http://124.222.196.78:9091/' //E可用
// axios.defaults.baseURL='http://124.221.254.11:8080/' //C
// axios.defaults.baseURL='http://124.223.210.53:8080/' //D
//axios.defaults.baseURL='http://10.96.228.235:9090/' //F

const app=createApp(App)
app.provide('$axios', axios)
app.use(router)
app.mount('#app')
