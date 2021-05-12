import { Api } from '@starport/tendermint-liquidity-js/cosmos/cosmos-sdk/cosmos.bank.v1beta1/module/rest.js'
import { chainInfo } from "../cosmos-amm/config"

const bankRestApi = new Api({ baseUrl: chainInfo.rest })

export const queryAllBalances = async (address) => {
    try {
        const response = await bankRestApi.queryAllBalances(address)
        return response.data
    } catch (e) {
        console.log(e)
        return e
    }
}

export const querySupplyOf = async (denom) => {
    try {
        const response = await bankRestApi.querySupplyOf(denom)
        return response.data
    } catch (e) {
        console.log(e)
        return e
    }
}

