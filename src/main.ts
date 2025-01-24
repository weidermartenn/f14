import { createApp } from 'vue'
import './app/assets/styles.scss'
import App from './app/App.vue'
import router from './app/providers/router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { initAuth } from './shared/lib/auth'

initAuth();

const app = createApp(App)

app.use(VueQueryPlugin).use(router).mount('#app')
