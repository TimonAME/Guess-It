import { defineStore } from 'pinia'

export const useZoneProgressStore = defineStore('zoneProgress', {
    state: () => ({
        progress: JSON.parse(localStorage.getItem('zoneProgress')) || {
            find: {
                lastZone: null,
                stats: null
            },
            name: {
                lastZone: null,
                stats: null
            }
        }
    }),
    actions: {
        saveProgress(gameMode, zoneKey, stats) {
            // Create a clean copy of stats without circular references and unnecessary data
            const cleanStats = {
                totalCountries: stats.totalCountries,
                foundCountries: stats.foundCountries,
                attempts: stats.attempts,
                correctAttempts: stats.correctAttempts,
                foundList: stats.foundList || [],
                shownCountries: stats.shownCountries || []
            }

            this.progress[gameMode] = {
                lastZone: zoneKey,
                stats: cleanStats
            }
            localStorage.setItem('zoneProgress', JSON.stringify(this.progress))
        },
        getProgress(gameMode) {
            return this.progress[gameMode]
        },
        clearProgress(gameMode) {
            if (gameMode) {
                this.progress[gameMode] = {
                    lastZone: null,
                    stats: null
                }
            } else {
                // Clear all progress
                this.progress = {
                    find: {
                        lastZone: null,
                        stats: null
                    },
                    name: {
                        lastZone: null,
                        stats: null
                    }
                }
            }
            localStorage.setItem('zoneProgress', JSON.stringify(this.progress))
        }
    }
})