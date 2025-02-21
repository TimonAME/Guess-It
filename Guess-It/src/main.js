import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import 'leaflet/dist/leaflet.css' // Import Leaflet CSS

const app = createApp(App)
app.use(store)
app.mount('#app')