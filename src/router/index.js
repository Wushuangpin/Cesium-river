/*
 * @Author: zhangbo
 * @E-mail: zhangb@geovis.com.cn
 * @Date: 2019-10-09 19:47:35
 * @LastEditors: zhangbo
 * @LastEditTime: 2020-02-28 11:24:39
 * @Desc: 
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/First.vue'
import Page1 from '../components/Page1.vue'
import Page2 from '../components/Page2.vue'
import Page3 from '../components/Page3.vue'
import Sidebar from '../components/Sidebar.vue'
import CesiumScene from '../components/CesiumScene.vue'
import SQL from '../components/SQL.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },
  {
    path: '/two', component: Sidebar, children: [
      // UserHome 会被渲染在 User 的 <router-view> 中
      { path: '/two', redirect: '/page1' },
      { path: '/page1', component: Page1 },
      { path: '/page2', component: Page2 },
      { path: '/page3', component: Page3 },
      { path: '/page4', component: CesiumScene },
    ]
  },
  { path: '/sql', component: SQL },
]

const router = new VueRouter({
  routes
})


export default router
