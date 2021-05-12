import { call, put, takeLatest } from 'redux-saga/effects';
import { queryParams, queryLiquidityPools } from '../../api/liquidity-rest';
import { liquidityAction } from './slice';



// query params
function* handleQueryParams() {
    const { queryParamsSuccess, queryParamsFail } = liquidityAction;
    try {
        const params = yield call(queryParams);
        yield put(queryParamsSuccess(params));
    } catch (err) {
        yield put(queryParamsFail(err));
    }
}

export function* watchParams() {
    const { requestQueryParams } = liquidityAction;
    yield takeLatest(requestQueryParams, handleQueryParams);
}


// query liquidity pools
function* handleQueryLiquidityPools() {
    const { queryLiquidityPoolsSuccess, queryLiquidityPoolsFail } = liquidityAction;
    try {
        const pools = yield call(queryLiquidityPools)
        yield put(queryLiquidityPoolsSuccess(pools));
    } catch (err) {
        yield put(queryLiquidityPoolsFail(err));
    }
}

export function* watchLiquidityPools() {
    const { requestQueryLiquidityPools } = liquidityAction;
    yield takeLatest(requestQueryLiquidityPools, handleQueryLiquidityPools);
}
