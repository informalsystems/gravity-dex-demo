import { txClient } from "@starport/tendermint-liquidity-js/tendermint/liquidity/tendermint.liquidity.v1beta1/module"
import { mobileCheck } from "../utils/global-functions"
import axios from "axios";
import { chainInfo } from "./config"

export async function BroadcastLiquidityTx(txInfo, dispatch, data) {

    if (mobileCheck()) {
        alert('Please use Desktop! 🙏')
        return
    }
    dispatch(getTxProcessingStatus('init', data))

    const signer = window.getOfflineSigner(chainInfo.chainId);
    const txGenerator = await txClient(signer, { addr: chainInfo.rpc })
    let msg = null
    if (txInfo.type === 'msgCreatePool') {
        try {
            msg = txGenerator.msgCreatePool(txInfo.data)
        } catch (e) {
            console.log(e)
        }
    } else if (txInfo.type === 'msgDeposit') {
        try {
            msg = txGenerator.msgDepositWithinBatch(txInfo.data)
        } catch (e) {
            console.log(e)
        }
    } else if (txInfo.type === 'msgWithdraw') {
        try {
            msg = txGenerator.msgWithdrawWithinBatch(txInfo.data)
        } catch (e) {
            console.log(e)
        }
    } else if (txInfo.type === 'msgSwap') {
        try {
            msg = txGenerator.msgSwapWithinBatch(txInfo.data)
        } catch (e) {
            console.log(e)
        }
    }

    console.log(msg)

    try {
        const txBroadcastResponse = await txGenerator.signAndBroadcast([msg], { fee: { amount: [], gas: "300000" } })
        if (txBroadcastResponse.code !== undefined) {
            const failMsg = { type: data.type, resultData: txBroadcastResponse.rawLog }
            dispatch(getTxProcessingStatus('broadcastFail', failMsg))

            console.log("error")
            console.log(txBroadcastResponse.rawLog)
        } else {
            console.log("success")
            console.log(txBroadcastResponse)

            dispatch(getTxProcessingStatus('broadcastSuccess', data))

            const txResult = setInterval(async () => {
                try {
                    let response = await getTxResult(txBroadcastResponse.height, data)

                    if (data.type === "Swap") {
                        response.demand_coin_denom = data?.demandCoinDenom
                        if (response.success === 'fail') {
                            response = "There may have been a drastic change in pool price recently or increase slippage tolerance(top-right gear button)"
                        }
                    }

                    const result = { type: data.type, resultData: response }
                    if (result.resultData.success === "success") {
                        dispatch(getTxProcessingStatus('txSuccess', result))
                    } else {
                        dispatch(getTxProcessingStatus('txFail', result))
                    }
                    clearInterval(txResult)
                } catch (e) {
                    console.log(e)
                }
            }, 1000)
        }

    } catch (e) {
        console.log("error", e)
        const failMsg = { type: data.type, resultData: String(e) }
        dispatch(getTxProcessingStatus('broadcastFail', failMsg))
        console.log(e.rawLog?.split(':')[2].trim())
    }


    async function getTxResult(height, data) {
        const response = await axios.get(`${chainInfo.rpc}/block_results?height=${height}`)
        const checks = getEndBlockChecks(data)
        let successData = {}

        if (data.type === "Create") {
            successData = { success: "success" }
        } else {
            console.log(response.data)
            if (response.data.result?.end_block_events) {
                let isMine = false
                response.data.result?.end_block_events?.forEach((item) => {
                    if (item.type === checks.type) {
                        item.attributes.forEach((result) => {
                            console.log(atob(result.key), atob(result.value))

                            if (atob(result.key) === checks.txAddress) {
                                if (atob(result.value) === checks.userAddress) {
                                    isMine = true
                                } else {
                                    isMine = false
                                }
                            }
                            if (isMine) {
                                successData[atob(result.key)] = atob(result.value)
                            }

                        })
                    }
                })
            } else {
                successData.success = "fail"
            }
        }
        return successData
    }

    function getTxProcessingStatus(status, data) {
        if (status === 'init') {
            return { type: 'store/setTxModalStatus', payload: { type: data.type, broadcastStatus: 'pending' } }
        }

        if (status === 'broadcastSuccess') {
            return { type: 'store/setTxModalStatus', payload: { type: data.type, broadcastStatus: 'success', transactionResultStatus: 'pending' } }
        }

        if (status === 'broadcastFail') {
            return { type: 'store/setTxModalStatus', payload: { type: data.type, broadcastStatus: 'fail', resultData: { data: data.resultData, isSuccess: false } } }
        }


        if (status === 'txSuccess') {
            return {
                type: 'store/setTxModalStatus', payload: { type: data.type, broadcastStatus: 'success', transactionResultStatus: 'success', resultData: { data: data.resultData, isSuccess: true } }
            }
        }
        if (status === 'txFail') {
            return { type: 'store/setTxModalStatus', payload: { type: data.type, broadcastStatus: 'success', transactionResultStatus: 'fail', resultData: { data: data.resultData, isSuccess: false } } }
        }
    }
}

function getEndBlockChecks(data) {
    if (data.type === "Swap") {
        return { type: "swap_transacted", txAddress: 'swap_requester', userAddress: data.userAddress }
    }

    if (data.type === "Redeem") {
        return { type: "withdraw_from_pool", txAddress: 'withdrawer', userAddress: data.userAddress }
    }

    if (data.type === "Add Liquidity") {
        return { type: "deposit_to_pool", txAddress: 'depositor', userAddress: data.userAddress }
    }
}
