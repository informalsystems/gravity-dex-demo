import * as React from 'react'
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from 'react-router-dom'

//UI components
import ChangeArrow from "../../assets/svgs/ChangeArrow"
import BaseCard from "../../components/Cards/BaseCard"
import TokenInputController from "../../components/TokenInputController/index"
import ActionButton from "../../components/Buttons/ActionButton"

//functions
import { cosmosSelector } from "../../modules/cosmosRest/slice"
import { liquiditySelector } from "../../modules/liquidityRest/slice"
import { BroadcastLiquidityTx } from "../../cosmos-amm/tx-client.js"
import { getSelectedPairsPoolData, getPoolPrice, cutNumber, calculateSlippage, sortCoins, } from "../../utils/global-functions"
import {getMinimalDenomCoin as getMDC }  from "../../utils/global-functions"


function getMinimalDenomCoin(coin) {
    if (coin.startsWith('bc/')) {
        return "i" + coin 
    }
    return getMDC(coin)
}

function uSlice(coin) {
   if (coin.startsWith("bc")) {
       return coin.substr(0)
   }
   return coin.substr(1)
}

//Styled-components
const SwapWrapper = styled.div`
    position: relative;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

        .title {
            padding-left: 4px;
            font-weight: 500;
        }
    }

   .divider {
        display:flex;
        align-items:center;
        justify-content:center;
        padding: 16px 0;
        transition: transform 0.2s;

        .arrow {
            cursor: pointer;

            &:hover {
                transform: scale(1.2);
            }
        }
   }

   .swap-detail {
        display: flex;
        justify-content: space-between;
        align-items: center;

        padding: 6px 12px;

        font-size: 14px;
        font-weight: 500;
        color: rgb(86, 90, 105);

        .left {
            
        }

        .right {

        }
   }

   .result-detail-board {
        position: absolute;
        width: 100%;
        max-width: 380px;
        height: 130px;
        padding-bottom: 20px;
        
        
        z-index: -1;

        transition:transform 0.4s ease-out;
        transform: translateY(-130px);
        background-color: transparent;
       
       .content {
            padding: 30px 20px 20px;
            background-color:#1b142161;
            height: 110px;
            border-radius: 12px;

            color: #fff;
            font-weight: 500;

        .detail {
            display: flex;
            justify-content: space-between;
            line-height: 2;

            .data {
                /* font-weight: bold;
                font-size: 18px; */
            }

            &:first-child {
                .data {
                    font-weight: bold;
                }
            }
        }
       }
   }
`


// const SemiFoooter = styled.div`
// position: absolute;
// display: flex;
// align-items: center;
// bottom: 8px;
// right: 8px;
// background-color: black;
// /* width: 40px; */
// /* height: 30px; */
// padding: 4px 12px;
// color: gray;
// border-radius: 20px;
// font-size: 12px;

// a {
//     text-decoration:none;
//     color: gray;

//     &:visited {
//         color: gray;
//     }

//     &:hover {
//     color: #fff;
//     }
// }
// `

//for display
function getButtonNameByStatus(status, fromCoin, toCoin) {
    if (fromCoin === '' || toCoin === '') {
        return 'Select a coin'
    } else if (status === 'over') {
        return 'Insufficient balance'
    } else if (status === 'empty') {
        return 'Enter an amount'
    } else if (status === 'create' || status === 'noPoolToken') {
        return 'Create a new pool'
    } else {
        return 'SWAP'
    }
}

function getButtonCssClassNameByStatus(status, fromCoin, toCoin) {
    if (fromCoin === '' || toCoin === '' || status === 'over' || status === 'empty') {
        return 'disabled'
    } else {
        return 'normal'
    }
}

//reducer action types
const TYPES = {
    AMOUNT_CHANGE: 'AMOUNT_CHANGE',
    SELECT_COIN: 'SELECT_COIN',
    SET_MAX_AMOUNT: 'SET_MAX_AMOUNT',
    CHANGE_FROM_TO_COIN: 'CHANGE_FROM_TO_COIN',
    UPDATE_PRICE: 'UPDATE_PRICE',
    SET_FROM_QUERY: 'SET_FROM_QUERY'
}

// component function
function SwapCard() {
    const reduxDispatch = useDispatch()
    const history = useHistory();

    const { userSlippage } = useSelector((state) => state.store.userData)
    const { userBalances, userAddress } = useSelector(cosmosSelector.all);
    const { poolsInfo, params } = useSelector(liquiditySelector.all)

    const [selectedPoolData, setSelectedPoolData] = React.useState(null)
    const [selectedPoolPrice, setSelectedPoolPrice] = React.useState(null)
    const poolData = poolsInfo?.poolsData

    const [state, dispatch] = React.useReducer(reducer, {
        fromCoin: 'aurum',
        toCoin: '',
        fromAmount: '',
        toAmount: '',
        status: 'empty', // connectWallet, notSelected, empty, over, normal
        price: '-',
        slippage: null,
        isBoard: false,
        isReverse: false,
    })

    React.useEffect(() => {
        if (state.fromCoin !== '' && state.toCoin) {
            //get and set pool pair status
            const preSortedCoins = [getMinimalDenomCoin(state.fromCoin), getMinimalDenomCoin(state.toCoin)].sort()
            const sortedCoins = [uSlice(preSortedCoins[0]), uSlice(preSortedCoins[1])]

            const isReverse = preSortedCoins[0].substr(1) === state.toCoin

            //get slected pairs pool data
            const selectedPairsPoolData = poolData?.[`${sortedCoins[0]}/${sortedCoins[1]}`]

            //when pool exists
            if (selectedPairsPoolData !== undefined) {
                const price = selectedPairsPoolData.reserve_coin_balances[getMinimalDenomCoin(state.toCoin)] / selectedPairsPoolData.reserve_coin_balances[getMinimalDenomCoin(state.fromCoin)]
                setSelectedPoolData(selectedPairsPoolData)
                setSelectedPoolPrice(Number(selectedPairsPoolData.reserve_coin_balances[getMinimalDenomCoin(sortedCoins[0])]) / Number(selectedPairsPoolData.reserve_coin_balances[getMinimalDenomCoin(sortedCoins[1])]))
                dispatch({ type: TYPES.UPDATE_PRICE, payload: { price: cutNumber(price, 6), isReverse: isReverse } })
            } else {
                // console.log('no pool/creat a new pool')
            }
            // console.log('poolPrice', selectedPoolPrice)
        } else {
            // console.log('need both coins')
        }



    }, [poolsInfo, poolData, state.fromCoin, state.toCoin, state.toAmount])

    React.useEffect(() => {
        const searchParams = new URLSearchParams(history.location.search);
        if (searchParams.has('from')) {
            dispatch({ type: TYPES.SET_FROM_QUERY, payload: { from: searchParams.get('from'), to: searchParams.get('to') } })
        }
        console.log('set Query')
    }, [history.location])

    //reducer for useReducer
    function reducer(state, action) {
        // const counterPairMyBalance = userBalances[state[`${counterTargetPair}Coin`]]
        const { targetPair, counterTargetPair } = getPairs(action)
        const swapFeeRate = 1 - params?.swap_fee_rate / 2 || 0.9985

        const inputAmount = action.payload?.amount || ''
        const realInputAmount = inputAmount  // swaprate?

        const selectedPairMyBalance = userBalances[state[`${targetPair}Coin`]]

        const userFromCoinBalance = userBalances[getMinimalDenomCoin(state.fromCoin)] / 1000000
        const userToCoinBalance = userBalances[getMinimalDenomCoin(state.toCoin)] / 1000000

        const fromCoinPoolAmount = Number(selectedPoolData?.reserve_coin_balances[getMinimalDenomCoin(state[`fromCoin`])]) / 1000000
        const toCoinPoolAmount = Number(selectedPoolData?.reserve_coin_balances[getMinimalDenomCoin(state[`toCoin`])]) / 1000000

        let swapPrice = ((fromCoinPoolAmount) + (2 * realInputAmount)) / (toCoinPoolAmount)
        let counterPairAmount = realInputAmount / swapPrice * swapFeeRate

        let isOver = false
        let isEmpty = false

        switch (action.type) {
            case TYPES.UPDATE_PRICE:
                if (isNaN(state.price)) {
                    return { ...state, price: action.payload.price, isReverse: action.payload.isReverse }
                } else {
                    return { ...state }
                }

            case TYPES.AMOUNT_CHANGE:

                // let swapPrice = ((fromCoinPoolAmount) + (2 * realInputAmount)) / (toCoinPoolAmount)
                // let counterPairAmount = realInputAmount / swapPrice * swapFeeRate

                if (targetPair === "to") {
                    counterPairAmount = (fromCoinPoolAmount / toCoinPoolAmount) / ((swapFeeRate / inputAmount) - (2 / toCoinPoolAmount))
                    if (counterPairAmount < 0) {
                        counterPairAmount = 0
                    }
                    // console.log('FROM: counterPairAmount', counterPairAmount)
                }

                let price = 1 / swapPrice

                const slippage = calculateSlippage((realInputAmount * 1000000), selectedPoolData?.reserve_coin_balances[getMinimalDenomCoin(state[`${targetPair}Coin`])])

                if (targetPair === 'from') {
                    if (inputAmount > userFromCoinBalance) {
                        isOver = true
                    } else {
                        isOver = false
                    }
                } else {
                    if (counterPairAmount > userFromCoinBalance) {
                        isOver = true
                    } else {
                        isOver = false
                    }
                }

                if (inputAmount === '' || inputAmount === '0' || counterPairAmount === 0) {
                    isEmpty = true
                } else {
                    isEmpty = false
                }

                if (!isNaN(price)) {
                    return {
                        ...state,
                        [`${targetPair}Amount`]: inputAmount,
                        [`${counterTargetPair}Amount`]: (cutNumber(counterPairAmount, 6)),
                        status: getStatus(state),
                        slippage: slippage,
                        price: targetPair === "to" ? inputAmount / counterPairAmount : counterPairAmount / inputAmount
                    }
                } else {
                    // empty, 0, no pool
                    return {
                        ...state,
                        [`${targetPair}Amount`]: inputAmount,
                        [`${counterTargetPair}Amount`]: '',
                        status: getStatus(state)
                    }
                }

            case TYPES.SET_MAX_AMOUNT:
                setAmountCheckVariables()
                console.log(state[`${counterTargetPair}Coin`])

                return { ...state, [`${targetPair}Amount`]: inputAmount, [`${counterTargetPair}Amount`]: state[`${counterTargetPair}Coin`] ? (cutNumber(counterPairAmount, 6)) : '', status: getStatus(state) }

            case TYPES.SELECT_COIN:
                const coinA = state[`${counterTargetPair}Coin`]
                const coinB = action.payload.coin
                const isBothCoin = coinA !== '' && coinB !== ''

                if (!isBothCoin) {
                    return { ...state, [`${targetPair}Coin`]: action.payload.coin, fromAmount: '', toAmount: '' }
                } else {
                    const selectedPooldata = getSelectedPairsPoolData(state, action, counterTargetPair, poolData)

                    state.status = "normal"
                    setAmountCheckVariables()

                    if (!selectedPooldata) {
                        return { ...state, status: "create", [`${targetPair}Coin`]: action.payload.coin, fromAmount: '', toAmount: '', price: '-' }
                    } else if (selectedPooldata.pool_coin_amount === '0') {
                        return { ...state, [`${targetPair}Coin`]: action.payload.coin, price: getPoolPrice(state, action, counterTargetPair, poolData), fromAmount: '', toAmount: '', status: 'noPoolToken', slippage: 0 }
                    } else {
                        return { ...state, [`${targetPair}Coin`]: action.payload.coin, price: getPoolPrice(state, action, counterTargetPair, poolData), fromAmount: '', toAmount: '', status: 'empty', slippage: 0 }
                    }
                }

            case TYPES.CHANGE_FROM_TO_COIN:
                const fromToChangeObject = { ...state, fromCoin: state.toCoin, toCoin: state.fromCoin, fromAmount: state.toAmount, toAmount: state.fromAmount }

                if (state.status === 'create') {
                    return { ...fromToChangeObject, price: '-' }
                }

                if (state.toCoin === '' || state.fromCoin === '') {
                    return fromToChangeObject
                } else {
                    const preSortedCoins = [getMinimalDenomCoin(state.toCoin), getMinimalDenomCoin(state.fromCoin)].sort()
                    const sortedCoins = [preSortedCoins[0].substr(1), preSortedCoins[1].substr(1)]



                    // if (false && state.toCoin !== sortedCoins[0]) {
                    //     // counterPairAmount = (fromCoinPoolAmount / toCoinPoolAmount) / ((swapFeeRate / state.toAmount) - (2 / toCoinPoolAmount))
                    //     // console.log('FROM: counterPairAmount', counterPairAmount)
                    // } else {

                    // }

                    swapPrice = ((toCoinPoolAmount) + (2 * state.toAmount)) / (fromCoinPoolAmount)
                    counterPairAmount = state.toAmount / swapPrice * swapFeeRate

                    if (counterPairAmount < 0) {
                        counterPairAmount = 0
                        isEmpty = true
                    }



                    let isOver = state.fromAmount > userFromCoinBalance || state.toAmount > userToCoinBalance
                    const slippage = calculateSlippage((state.toAmount * 1000000), selectedPoolData?.reserve_coin_balances[getMinimalDenomCoin(state[`toCoin`])])

                    const selectedPairsPoolData = poolData[`${sortedCoins[0]}/${sortedCoins[1]}`]
                    const price = selectedPairsPoolData[state.toCoin] / selectedPairsPoolData[state.fromCoin]
                    return { ...fromToChangeObject, price, toAmount: cutNumber(counterPairAmount, 6), status: isOver ? 'over' : state.status, slippage: slippage }
                }
            case TYPES.SET_FROM_QUERY:
                return { ...state, fromCoin: action.payload.from, toCoin: action.payload.to, fromAmount: '', toAmount: '', status: 'empty' }
            default:
                console.log("DEFAULT: SWAP REDUCER")
                return state;
        }

        //helpers
        function getPairs(action) {
            let targetPair = null
            let counterTargetPair = null

            if (action.payload?.target) {
                targetPair = action.payload.target === "From" ? "from" : "to"
                counterTargetPair = targetPair === 'from' ? 'to' : 'from'
            } else {
                targetPair = 'from'
                counterTargetPair = 'to'
            }
            return { targetPair, counterTargetPair }
        }

        function setAmountCheckVariables() {
            if (inputAmount > selectedPairMyBalance) {
                isOver = true
            } else {
                isOver = false
            }
            if (inputAmount === 0) {
                isEmpty = true
            } else {
                isEmpty = false
            }
        }

        function getStatus(state) {
            return state.status === 'create' || state.status === 'noPoolToken' ? 'create' : (isOver ? 'over' : isEmpty ? 'empty' : 'normal')
        }
    }



    function swap() {
        const slippageRange = 1 + userSlippage / 100

        BroadcastLiquidityTx({
            type: 'msgSwap',
            data: {
                swapRequesterAddress: userAddress,
                poolId: Number(selectedPoolData.id),
                swapTypeId: 1,
                offerCoin: { denom: getMinimalDenomCoin(state.fromCoin), amount: String(Math.floor(state.fromAmount * 1000000)) },
                demandCoinDenom: getMinimalDenomCoin(state.toCoin),
                offerCoinFee: { denom: getMinimalDenomCoin(state.fromCoin), amount: String(Math.floor(state.fromAmount * 1000000 * 0.001500000000000000)) },
                // orderPrice: String((state.price * (state.isReverse ? 2 - slippageRange : slippageRange)).toFixed(18).replace('.', '').replace(/(^0+)/, ""))
                orderPrice: String((selectedPoolPrice * (state.isReverse ? 2 - slippageRange : slippageRange)).toFixed(18).replace('.', '').replace(/(^0+)/, ""))
            }
        }, reduxDispatch, { type: 'Swap', userAddress: userAddress, demandCoinDenom: getMinimalDenomCoin(state.toCoin) }
        )
    }

    function create(from, to) {
        history.push(`/create?from=${from}&to=${to}`)
    }
    const isBoard = state.fromCoin && state.toCoin && state.status !== "create"
    return (
        <>
            <BaseCard>
                <SwapWrapper>
                    {/* Header */}
                    <div className="header">
                        <div className="title">
                            Swap
                    </div>
                        <div />
                    </div>

                    {/* From */}
                    <TokenInputController
                        header={{ title: 'From' }}
                        coin={state.fromCoin}
                        amount={state.fromAmount}
                        counterPair={state.toCoin}
                        dispatch={dispatch}
                        dispatchTypes={{ amount: TYPES.AMOUNT_CHANGE, coin: TYPES.SELECT_COIN, max: TYPES.SET_MAX_AMOUNT }}
                    />

                    {/* From <> To change arrow */}
                    <div className="divider">
                        <div className="arrow" onClick={() => {
                            dispatch({ type: TYPES.CHANGE_FROM_TO_COIN })
                        }}>
                            <ChangeArrow />
                        </div>
                    </div>

                    {/* To */}
                    <TokenInputController
                        header={{ title: 'To (estimated)' }}
                        coin={state.toCoin}
                        amount={state.toAmount}
                        counterPair={state.fromCoin}
                        dispatch={dispatch}
                        dispatchTypes={{ amount: TYPES.AMOUNT_CHANGE, coin: TYPES.SELECT_COIN, max: TYPES.SET_MAX_AMOUNT }}
                    />

                    {/* Swap detail */}
                    <div className="swap-detail">
                        <div className="left">Price</div>
                        <div className="right">{(state.price !== '-' && !isNaN(state.price)) ? `${cutNumber(state.price, 6)} ${state.toCoin.substr(0,10)} per ${state.fromCoin.substr(0,10)}` : '-'}</div>
                    </div>

                    <div className="swap-detail">
                        <div className="left">Swap Fee</div>
                        <div className="right">{params ? params?.swap_fee_rate * 100 : ''}%</div>
                    </div>

                    <div className="swap-detail">
                        <div className="left">Slippage Tolerance</div>
                        <div className="right">{userSlippage}%</div>
                    </div>

                    {/* Swap Button */}
                    <ActionButton onClick={() => {
                        if (state.status === 'create') {
                            create(state.fromCoin, state.toCoin)
                        } else if (state.status === 'noPoolToken') {
                            history.push(`/Create?from=${state.fromCoin}&to=${state.toCoin}&emptyPool=true`)
                        } else {
                            swap()
                        }
                    }} status={getButtonCssClassNameByStatus(state.status, state.fromCoin, state.toCoin)} css={{ marginTop: "16px" }}>
                        {getButtonNameByStatus(state.status, state.fromCoin, state.toCoin)}
                    </ActionButton>

                    <div style={{ transform: `translateY(${isBoard && state.status !== "noPoolToken" ? '0' : '-200'}px)` }} className="result-detail-board">
                        <div className="content">
                            <div className="detail">
                                <div className="title">Estimated Receives</div>
                                <div className="data">{state.toAmount} {state.toCoin ? state.toCoin.toUpperCase().substr(0,10) : ''}</div>
                            </div>
                            <div className="detail">
                                <div className="title">Price Impact</div>
                                <div className="data">{state.slippage ? cutNumber(state.slippage * 100, 4) : '?'}%</div>
                            </div>
                            <div className="detail">
                                <div className="title"></div>
                                <div className="data"></div>
                            </div>
                        </div>
                    </div>
                </SwapWrapper>
            </BaseCard>
            {/* {!mobileCheck() ? <SemiFoooter>
                <a href="https://gravitydex.io/terms-and-conditions.pdf" target="_blank" rel="noopener noreferrer">{"T&C"}</a>
            </SemiFoooter> : ''} */}
        </>
    )
}

export default SwapCard
