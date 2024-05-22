import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import ocr from './modules/ocr'
import super_resolution from './modules/super_resolution'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    ocr,
    super_resolution
  },
  getters
})

export default store
