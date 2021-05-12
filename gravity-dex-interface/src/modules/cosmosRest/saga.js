import { call, put, takeLatest } from 'redux-saga/effects';
import { queryAllBalances } from '../../api/bank-rest';
import { cosmosAction } from './slice';

// query all balances
function* handleQueryAllBalances({ payload: address }) {
    const { queryAllBalancesSuccess } = cosmosAction;
    try {
        const balances = yield call(queryAllBalances, address);
        yield put(queryAllBalancesSuccess(balances));
    } catch (err) {
        // yield put(console.log(err));
    }
}

export function* watchAllBalances() {
    const { requestQueryAllBalances } = cosmosAction;
    yield takeLatest(requestQueryAllBalances, handleQueryAllBalances);
}
