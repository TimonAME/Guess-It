import { defineStore } from 'pinia'

export const useZoneProgressStore = defineStore('zoneProgress', {
    state: () => ({
        progress: JSON.parse(localStorage.getItem('zoneProgress')) || {}
    }),
    actions: {
        saveProgress(mode, zone, gameStats) {
            if (!this.progress[mode]) {
                this.progress[mode] = {
                    lastZone: null,
                    gameStats: null
                }
            }
            this.progress[mode].lastZone = zone
            this.progress[mode].gameStats = gameStats
            localStorage.setItem('zoneProgress', JSON.stringify(this.progress))
        },
        loadProgress(mode) {
            return this.progress[mode] || {
                lastZone: null,
                gameStats: null
            }
        },
        resetProgress(mode) {
            if (this.progress[mode]) {
                this.progress[mode] = {
                    lastZone: null,
                    gameStats: null
                }
                localStorage.setItem('zoneProgress', JSON.stringify(this.progress))
            } else {
                return null
            }
        }
    }
})