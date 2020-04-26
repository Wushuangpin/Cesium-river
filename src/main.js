import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router'
import axios from 'axios'


/* //注册全局组件
//1.引入组件
import Users from './components/Users.vue'

//2.注册全局组件
Vue.component('users', Users) */

Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.prototype.axios = axios;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
