import { createApp } from 'vue'
import App from './App.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { pinia } from './store'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { useUserStore } from '@/store/user'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.component('QuillEditor', QuillEditor)

// 保证刷新后自动恢复登录状态
const userStore = useUserStore()
userStore.initUser()

app.mount('#app') 