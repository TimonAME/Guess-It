import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import './assets/main.css'
import 'leaflet/dist/leaflet.css'

const app = createApp(App)
app.use(store)
app.mount('#app')