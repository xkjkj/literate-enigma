import Vue from 'vue'
import App from './App'
import _ from 'lodash'       //导入lodash



Vue.prototype.$lodash = _//注入工具
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
