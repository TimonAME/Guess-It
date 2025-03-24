// src/stores/gameStore.js
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
    state: () => ({
        currentMode: 'find',
        selectedLanguage: 'NAME_DE',
        gameModes: {
            find: { name: 'Find Mode', description: 'Locate countries on the map' },
            name: { name: 'Name Mode', description: 'Type country names' },
            training: { name: 'Training Mode', description: 'Practice your geography skills' },
            travel: { name: 'Travel Mode', description: 'Explore countries through travel' },
            export: { name: 'Export Mode', description: 'Learn about country exports' }
        },
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
        },
        setSelectedLanguage(language) {
            this.selectedLanguage = language
        }
    },
    getters: {
        getCurrentModeDetails() {
            return this.gameModes[this.currentMode]
        },
        getLanguageLabel() {
            return (languageCode) => this.languages[languageCode] || languageCode
        }
    }
})