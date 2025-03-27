import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
import 'leaflet/dist/leaflet.css'
import {useMapStore} from "@/stores/mapStore.js";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize mapStore and wait for data before mounting
console.log("Loading Country Data")
const mapStore = useMapStore()
await mapStore.loadCountriesData()

app.mount('#app')