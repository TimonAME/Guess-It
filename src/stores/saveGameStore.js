import { defineStore } from 'pinia'

export const useSaveGameStore = defineStore('saveGame', {
    state: () => ({
        saves: JSON.parse(localStorage.getItem('gameSaves')) || {}
    }),
    actions: {
        saveGame(gameMode, saveData) {
            this.saves[gameMode] = {
                ...saveData,
                timestamp: Date.now()
            }
            this.persistSaves()
        },
        loadGame(gameMode) {
            return this.saves[gameMode] || null
        },
        clearSave(gameMode) {
            delete this.saves[gameMode]
            this.persistSaves()
        },
        persistSaves() {
            localStorage.setItem('gameSaves', JSON.stringify(this.saves))
        }
    }
})