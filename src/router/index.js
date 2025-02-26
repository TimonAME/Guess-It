import { createRouter, createWebHistory } from 'vue-router'
import TrainingMode from '@/components/TrainingMode.vue'
import FindMode from '@/components/FindMode.vue'
import CountryClickGame from '@/components/old/CountryClickGame.vue'
import CountryNameGame from '@/components/old/CountryNameGame.vue'
import NameMode from "@/components/NameMode.vue";
import TravelMode from "@/components/TravelMode.vue";
import ExportMode from "@/components/ExportMode.vue";

const routes = [
    { path: '/', component: FindMode },
    { path: '/training', component: TrainingMode },
    { path: '/find', component: FindMode },
    { path: '/name', component: NameMode },
    { path: '/travel', component: TravelMode},
    { path: '/export', component: ExportMode }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router