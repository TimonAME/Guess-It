import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import './assets/main.css'
import 'leaflet/dist/leaflet.css'
import router from "@/router/index.js";

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')