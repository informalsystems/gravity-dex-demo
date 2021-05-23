import { Api } from '@starport/tendermint-liquidity-js/tendermint/liquidity/tendermint.liquidity.v1beta1/module/rest.js'
import { queryAllBalances, querySupplyOf } from './bank-rest'
import { chainInfo } from "../cosmos-amm/config"
import { uSlice } from "../utils/global-functions"

const liquidityRestApi = new Api({ baseUrl: chainInfo.rest })

export const queryParams = async () => {
    try {
        const response = await liquidityRestApi.queryParams()
        return response.data.params
    } catch (e) {
        console.log(e)
    }
}

export const queryLiquidityPools = async () => {
    try {
        const response = await liquidityRestApi.queryLiquidityPools({ "pagination.limit": '100' })
        const promises = response.data.pools.map(queryPoolReserveTokens);
        const poolsData = await Promise.all(promises);
        let modifiedPoolsData = {}
        let poolTokenIndexer = {}

        response.data.pools.forEach((pool, index) => {
            const poolName = `${uSlice(pool.reserve_coin_denoms[0])}/${uSlice(pool.reserve_coin_denoms[1])}`
            modifiedPoolsData[poolName] = {
                id: pool.id,
                pool_coin_denom: pool.pool_coin_denom,
                pool_coin_amount: poolsData[index].pooltoken_amount.amount,
                reserve_coin_balances: {
                    [poolsData[index].balances[0].denom]: poolsData[index].balances[0].amount,
                    [poolsData[index].balances[1].denom]: poolsData[index].balances[1].amount
                }
            }
            poolTokenIndexer[pool.pool_coin_denom] = poolName
        })

        return { poolsData: modifiedPoolsData, poolTokenIndexer: poolTokenIndexer }
    } catch (e) {
        console.log(e)
        return null
    }

    //helper
    async function queryPoolReserveTokens(pool) {
        const promises = await Promise.all([await queryAllBalances(pool.reserve_account_address), await querySupplyOf(pool.pool_coin_denom)])

        let response = promises[0]
        response.pooltoken_amount = promises[1].amount

        return response
    }
}

export const queryLiquidityPool = async (poolId) => {
    try {
        const response = await liquidityRestApi.queryLiquidityPool(poolId)
        console.log('res', response)
        return response.data
    } catch (e) {
        console.log(e)
        return null
    }
}
