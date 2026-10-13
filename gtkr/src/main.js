import { createApp } from 'vue'
import App from './App.vue'
import scrollAlways from './directives/scrollAlways.js'
import router from './router'
import { installTrack } from './track'
import './assets/main.css'

installTrack(router)
createApp(App).use(router).directive('scroll-always', scrollAlways).mount('#app')
