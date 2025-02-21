// store/index.js
import { createStore } from 'vuex'

export default createStore({
    state: {
        currentGame: null,
        score: 0,
        targetCountry: null,
        selectedPath: []
    },
    mutations: {
        SET_GAME(state, gameMode) {
            state.currentGame = gameMode
        },
        INCREMENT_SCORE(state) {
            state.score++
        },
        SET_TARGET_COUNTRY(state, country) {
            state.targetCountry = country
        },
        ADD_TO_PATH(state, country) {
            state.selectedPath.push(country)
        }
    },
    actions: {
        startGame({ commit }, gameMode) {
            commit('SET_GAME', gameMode)
        },
        handleCorrectAnswer({ commit }) {
            commit('INCREMENT_SCORE')
        }
    }
})