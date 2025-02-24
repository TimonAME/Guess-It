import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import 'leaflet/dist/leaflet.css'
import router from "@/router/index.js";

const app = createApp(App)
app.use(router)
app.mount('#app')