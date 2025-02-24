import { createRouter, createWebHistory } from 'vue-router'
import TrainingMode from '@/components/TrainingMode.vue'
import FindMode from '@/components/FindMode.vue'
import CountryClickGame from '@/components/old/CountryClickGame.vue'
import CountryNameGame from '@/components/old/CountryNameGame.vue'

const routes = [
    { path: '/', component: FindMode },
    { path: '/training', component: TrainingMode },
    { path: '/find', component: FindMode }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router