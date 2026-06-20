/**
 * 应用入口文件
 *
 * 职责：
 * 1. 创建 Vue 应用实例
 * 2. 挂载到 #app DOM 元素上
 * 3. 引入全局样式
 */

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 创建 Vue 应用并挂载到 #app 元素
createApp(App).mount('#app')
