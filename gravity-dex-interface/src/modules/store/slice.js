import { createSlice, createSelector } from "@reduxjs/toolkit";
const name = "store";

const initialState = {
    //TEST DATA
    userData: {
        userSlippage: 3,
        walletStatus: 'normal' // normal, pending, error
    },

    priceData: {
        atom: 1,
        iris: 2,
        kava: 3,
        luna: 4,
        band: 5
    },

    isWallet: false,

    isTxModal: false,
    txModalData: { test: 'te' },
}

const reducers = {
    togglePendingStatus: (state, action) => {
        let currentStatus = state.userData.walletStatus
        state.userData.walletStatus = currentStatus === 'pending' ? 'normal' : 'pending'
    },
    setTxModalStatus: (state, action) => {
        state.txModalData = action.payload
        state.isTxModal = action.payload.isTxModal !== undefined ? action.payload.isTxModal : true
    },
    setIsWallet: (state, action) => {
        state.isWallet = action.payload
    },
    setSlippage: (state, action) => {
        state.userData.userSlippage = action.payload.userSlippage
    },
    setCoinPrices: (state, action) => {
        state.priceData = action.payload.prices
    }
}

const slice = createSlice({
    name, initialState, reducers
});

const selectAllState = createSelector(
    state => state.userData,
    state => state.priceData,
    state => state.poolsData,
    state => state.isWallet,
    state => state.isTxModal,
    state => state.txModalData,
    (userData, priceData, poolsData, isWallet, isTxModal, txModalData) => {
        return { userData, priceData, poolsData, isWallet, isTxModal, txModalData };
    }
);

export const storeSelector = {
    all: state => selectAllState(state[STORE])
};

export const STORE = slice.name;
export const storeReducer = slice.reducer;
export const storeAction = slice.actions;
