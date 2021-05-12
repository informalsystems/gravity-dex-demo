
import { combineReducers } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { STORE, storeReducer } from '../modules/store/slice';
import { LIQUIDITY, liquidityReducer } from '../modules/liquidityRest/slice';
import { COSMOS, cosmosReducer } from '../modules/cosmosRest/slice';
import { watchParams, watchLiquidityPools } from '../modules/liquidityRest/saga';
import { watchAllBalances } from '../modules/cosmosRest/saga';

const rootReducer = combineReducers({
    [LIQUIDITY]: liquidityReducer,
    [COSMOS]: cosmosReducer,
    [STORE]: storeReducer
});

const sagaMiddleware = createSagaMiddleware();
function* rootSaga() {
    yield all([
        watchParams(),
        watchAllBalances(),
        watchLiquidityPools()
    ])
}
const createStore = () => {
    const store = configureStore({
        reducer: rootReducer,
        middleware: [sagaMiddleware]
    });
    sagaMiddleware.run(rootSaga);
    return store;
}

export default createStore;
