import { createRouter, createWebHistory } from 'vue-router'
import TrainingMode from '@/components/TrainingMode.vue'
import FindMode from '@/components/FindMode.vue'
import CountryClickGame from '@/components/CountryClickGame.vue'
import CountryNameGame from '@/components/CountryNameGame.vue'

const routes = [
    { path: '/', component: TrainingMode },
    { path: '/training', component: TrainingMode },
    { path: '/find', component: FindMode }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router