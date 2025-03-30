import { defineStore } from 'pinia'
import FindMode from '@/components/FindMode.vue'
import NameMode from '@/components/NameMode.vue'
import TrainingMode from '@/components/TrainingMode.vue'
import TravelMode from '@/components/TravelMode.vue'
import ExportMode from '@/components/ExportMode.vue'
import {markRaw} from "vue";

export const useGameStore = defineStore('game', {
    state: () => ({
        currentMode: localStorage.getItem('lastGameMode') || 'find',
        selectedLanguage: localStorage.getItem('lastLanguage') || 'NAME_DE',
        modes: [
            {
                id: 'find',
                displayName: 'Find-It Mode',
                description: 'Locate countries on the map',
                component: markRaw(FindMode)
            },
            {
                id: 'name',
                displayName: 'Name-It Mode',
                description: 'Type country names',
                component: markRaw(NameMode)
            },/*
            {
                id: 'training',
                displayName: 'Training Mode',
                description: 'Practice your geography skills',
                component: markRaw(TrainingMode)
            },
            {
                id: 'travel',
                displayName: 'Travel Mode',
                description: 'Explore countries through travel',
                component: markRaw(TravelMode)
            },
            {
                id: 'export',
                displayName: 'Export Mode',
                description: 'Learn about country exports',
                component: markRaw(ExportMode)
            }*/
        ],
        languages: {
            NAME_AR: 'Arabic',
            NAME_BN: 'Bengali',
            NAME_DE: 'German',
            NAME_EN: 'English',
            NAME_ES: 'Spanish',
            NAME_FA: 'Persian',
            NAME_FR: 'French',
            NAME_EL: 'Greek',
            NAME_HE: 'Hebrew',
            NAME_HI: 'Hindi',
            NAME_HU: 'Hungarian',
            NAME_ID: 'Indonesian',
            NAME_IT: 'Italian',
            NAME_JA: 'Japanese',
            NAME_KO: 'Korean',
            NAME_NL: 'Dutch',
            NAME_PL: 'Polish',
            NAME_PT: 'Portuguese',
            NAME_RU: 'Russian',
            NAME_SV: 'Swedish',
            NAME_TR: 'Turkish',
            NAME_UK: 'Ukrainian',
            NAME_UR: 'Urdu',
            NAME_VI: 'Vietnamese',
            NAME_ZH: 'Chinese (Simplified)',
            NAME_ZHT: 'Chinese (Traditional)'
        }
    }),
    actions: {
        setCurrentMode(mode) {
            this.currentMode = mode
            localStorage.setItem('lastGameMode', mode)
        },
        setSelectedLanguage(language) {
            this.selectedLanguage = language
            localStorage.setItem('lastLanguage', language)
        }
    },
    getters: {
        getCurrentModeDetails() {
            return this.modes.find(mode => mode.id === this.currentMode)
        },
        getCurrentModeComponent() {
            const currentMode = this.getCurrentModeDetails
            return currentMode ? currentMode.component : null
        },
        getLanguageLabel() {
            return (languageCode) => this.languages[languageCode] || languageCode
        },
        getCurrentModeDisplayName() {
            const currentMode = this.getCurrentModeDetails
            return currentMode ? currentMode.displayName : this.currentMode
        }
    }
})