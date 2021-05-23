import * as React from 'react'
import styled from "styled-components"
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom'
import { cutNumber, getMinimalDenomCoin, uSlice } from "../../utils/global-functions"
import { cosmosSelector } from "../../modules/cosmosRest/slice"
import { liquiditySelector } from "../../modules/liquidityRest/slice"

import { BroadcastLiquidityTx } from "../../cosmos-amm/tx-client.js"

import BaseCard from "../../components/Cards/BaseCard"
import TokenInputController from "../../components/TokenInputController/index"
import ActionButton from "../../components/Buttons/ActionButton"

//Styled-components
const Wrapper = styled.div`
margin-top: -50px;
margin-bottom: 50px;
  width: 100%;

  @media(max-width: 500px) {
    margin-top: -10px;
    }
`

const CardWrapper = styled.div`
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

       .back {
           font-size: 24px;
           cursor: pointer;

           &:hover {
                opacity: 0.6;
            }
        }

       .title {
           font-size: 20px;
           font-weight: 500;
       }
    }

    .info-box {
        box-sizing: border-box;
        margin: 20px 0;
        min-width: 0px;
        padding: 1.25rem;
        background-color:#f77e4a33;
        color: #F6743C;
        border-radius: 12px;
        width: fit-content;
    }

   .divider {
        display:flex;
        align-items:center;
        justify-content:center;
        padding: 16px 0;
        transition: opacity 0.2s;

        .plus {
            font-size: 24px;
            font-weight: 300;
        }
   }

   .add-detail {
        border-radius: 20px;
        border: 1px solid rgb(247, 248, 250);

        margin-top: 16px;

        .title {
            padding: 16px;
            font-weight: 500;
            font-size: 14px;
        }

        .details {
            display: flex;
            justify-content: space-between;
            padding: 16px;
            border: 1px solid rgb(247, 248, 250);
            border-radius: 20px;

            .detail {
                text-align:center;
                flex: 1;
                .number {
                    font-weight: 500;
                }

                .text {
                    font-weight: 500;
                    font-size: 14px;
                    color: rgb(86, 90, 105);
                    padding-top: 4px;
                }
            }
        }
   }
`

//reducer action types
const TYPES = {
    AMOUNT_CHANGE: 'AMOUNT_CHANGE',
    SELECT_COIN: 'SELECT_COIN',
    SET_MAX_AMOUNT: 'SET_MAX_AMOUNT',
    SET_FROM_QUERY: 'SET_FROM_QUERY'
}

//helpers
function getButtonNameByStatus(status, fromCoin, toCoin) {
    if (fromCoin === '' || toCoin === '') {
        return 'Select a coin'
    } else if (status === 'existed') {
        return 'Pool already exists'
    } else if (status === 'empty') {
        return 'Enter an amount'
    } else if (status === 'over') {
        return 'Insufficient balance'
    } else {
        return 'ADD'
    }
}

function getButtonCssClassNameByStatus(status, fromCoin, toCoin) {
    if (fromCoin === '' || toCoin === '' || status === 'over' || status === 'empty') {
        return 'disabled'
    } else {
        return 'normal'
    }
}


function AddLiquidityCard() {
    const { userBalances, userAddress } = useSelector(cosmosSelector.all);
    const { poolsInfo } = useSelector(liquiditySelector.all)
    const poolsData = poolsInfo?.poolsData

    const [state, dispatch] = React.useReducer(reducer, {
        fromCoin: '',
        toCoin: '',
        fromAmount: '',
        fromReserveAmount: '',
        toAmount: '',
        toReserveAmount: '',
        status: 'empty' // connectWallet, notSelected, empty, over, normal
    })


    let coinXAmount = null
    let coinYAmount = null
    const preSortedCoins = [getMinimalDenomCoin(state.fromCoin), getMinimalDenomCoin(state.toCoin)].sort()
    const sortedCoins = [uSlice(preSortedCoins[0]), uSlice(preSortedCoins[1])]

    if (poolsData && poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`]) {
        const reserveCoins = poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`].reserve_coin_balances
        coinXAmount = reserveCoins[getMinimalDenomCoin(`${state.fromCoin}`)]
        coinYAmount = reserveCoins[getMinimalDenomCoin(`${state.toCoin}`)]

    }


    const history = useHistory();
    const storeDispatch = useDispatch()
    React.useEffect(() => {
        const searchParams = new URLSearchParams(history.location.search);
        if (searchParams.has('from')) {
            dispatch({ type: TYPES.SET_FROM_QUERY, payload: { from: searchParams.get('from'), to: searchParams.get('to') } })
        }
    }, [history.location.search])

    //reducer for useReducer
    function reducer(state, action) {
        const { targetPair, counterTargetPair } = getPairs(action)

        const selectedPairAmount = action.payload?.amount || ''

        const selectedPairUserBalances = userBalances[getMinimalDenomCoin(state[`${targetPair}Coin`])] / 1000000
        const counterPairUserBalances = userBalances[getMinimalDenomCoin(state[`${counterTargetPair}Coin`])] / 1000000

        const poolsData = poolsInfo?.poolsData
        const preSortedCoins = [getMinimalDenomCoin(state.fromCoin), getMinimalDenomCoin(state.toCoin)].sort()
        const sortedCoins = [uSlice(preSortedCoins[0]), uSlice(preSortedCoins[1])]

        let coinXAmount = null
        let coinYAmount = null
        let poolPrice = null
        let price = null;

        if (poolsData && poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`]) {
            const reserveCoins = poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`].reserve_coin_balances
            coinXAmount = reserveCoins[`${getMinimalDenomCoin(state.fromCoin)}`]
            coinYAmount = reserveCoins[`${getMinimalDenomCoin(state.toCoin)}`]
            poolPrice = coinXAmount / coinYAmount
            state = { ...state, fromReserveAmount: reserveCoins[`${getMinimalDenomCoin(state.fromCoin)}`], toReserveAmount: reserveCoins[`${getMinimalDenomCoin(state.toCoin)}`] }

            if (poolPrice) {
                if (targetPair === 'from') {
                    price = 1 / poolPrice
                } else {
                    price = poolPrice
                }
            }
        }

        let isOver = false
        let isEmpty = false
        let isCounterPairEmpty = false

        switch (action.type) {

            case TYPES.AMOUNT_CHANGE:
                if (selectedPairAmount > selectedPairUserBalances || selectedPairAmount * price > counterPairUserBalances || isNaN(counterPairUserBalances) || isNaN(selectedPairUserBalances)) {
                    isOver = true
                } else {
                    isOver = false
                }

                if (selectedPairAmount && selectedPairAmount !== '0' && selectedPairAmount !== '') {
                    isEmpty = false
                } else {
                    isEmpty = true
                }

                return { ...state, [`${targetPair}Amount`]: selectedPairAmount, [`${counterTargetPair}Amount`]: selectedPairAmount ? cutNumber(selectedPairAmount * price, 6) : '', status: getStatus(state) }

            case TYPES.SET_MAX_AMOUNT:
                if (selectedPairAmount * price > counterPairUserBalances || isNaN(counterPairUserBalances)) {
                    isOver = true
                } else {
                    isOver = false
                }


                return { ...state, [`${targetPair}Amount`]: selectedPairAmount, [`${counterTargetPair}Amount`]: selectedPairAmount ? cutNumber(selectedPairAmount * price, 6) : '', status: getStatus(state) }

            case TYPES.SELECT_COIN:
                const coinA = state[`${counterTargetPair}Coin`]
                const coinB = action.payload.coin
                const isBothCoin = coinA !== '' && coinB !== ''

                if (!isBothCoin) {
                    return { ...state, [`${targetPair}Coin`]: action.payload.coin, [`${targetPair}Amount`]: '', [`${counterTargetPair}Amount`]: '' }
                } else {

                    if (userBalances[getMinimalDenomCoin(action.payload.coin)] && counterPairUserBalances) {
                        isEmpty = true
                    } else {
                        isOver = true
                    }

                    return { ...state, [`${targetPair}Coin`]: action.payload.coin, [`${targetPair}Amount`]: '', [`${counterTargetPair}Amount`]: '', status: getStatus(state) }
                }

            case TYPES.SET_FROM_QUERY:
                if (userBalances[getMinimalDenomCoin(action.payload.from)] && userBalances[getMinimalDenomCoin(action.payload.to)]) {
                    isEmpty = true
                } else {
                    isOver = true
                }
                return { ...state, fromCoin: action.payload.from, toCoin: action.payload.to, status: getStatus(state) }

            default:
                console.log("DEFAULT: REDUCER")
                return state;
        }

        //helpers
        function getPairs(action) {
            let targetPair = null
            let counterTargetPair = null

            if (action.payload?.target) {
                targetPair = action.payload.target === "X" ? "from" : "to"
                counterTargetPair = targetPair === 'from' ? 'to' : 'from'
            } else {
                targetPair = 'from'
                counterTargetPair = 'to'
            }
            return { targetPair, counterTargetPair }
        }

        function getStatus(state) {
            return state.status === 'create' ? 'create' : ((isEmpty || isCounterPairEmpty) ? 'empty' : isOver ? 'over' : 'normal')
        }
    }

    async function add() {
        const preSortedCoins = [getMinimalDenomCoin(state.fromCoin), getMinimalDenomCoin(state.toCoin)].sort()
        const sortedCoins = [uSlice(preSortedCoins[0]),uSlice(preSortedCoins[1])]
        let isReverse = false
        if (state.fromCoin !== sortedCoins[0]) {
            isReverse = true
        }

        BroadcastLiquidityTx({
            type: 'msgDeposit',
            data: {
                depositorAddress: userAddress,
                poolId: Number(poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`].id),
                depositCoins: [
                    { denom: getMinimalDenomCoin(isReverse ? state.toCoin : state.fromCoin), amount: String(isReverse ? state.toAmount * 1000000 : state.fromAmount * 1000000) },
                    { denom: getMinimalDenomCoin(isReverse ? state.fromCoin : state.toCoin), amount: String(isReverse ? state.fromAmount * 1000000 : state.toAmount * 1000000) },
                ]
            }
        }, storeDispatch, { type: 'Add Liquidity', userAddress: userAddress })
    }

    return (
        <Wrapper>
            <BaseCard>
                <CardWrapper>
                    {/* Header */}
                    <div className="header">
                        <div className="back" onClick={() => { history.push('/pool') }}>←</div>
                        <div className="title"> Add liquidity</div>
                        <div style={{ width: "23px" }}></div>
                    </div>

                    {/* Info */}
                    {/* Info */}
                    <div className="info-box">
                        <span style={{ fontWeight: "bold" }}>Tip:</span> When you add liquidity, you will receive pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.
                    </div>


                    {/* From */}
                    <TokenInputController
                        header={{ title: 'X' }}
                        coin={state.fromCoin}
                        amount={state.fromAmount}
                        counterPair={state.toCoin}
                        dispatch={dispatch}
                        dispatchTypes={{ amount: TYPES.AMOUNT_CHANGE, coin: TYPES.SELECT_COIN, max: TYPES.SET_MAX_AMOUNT }}
                    />

                    {/* plus icon */}
                    <div className="divider">
                        <div className="plus">
                            +
                        </div>
                    </div>

                    {/* To */}
                    <TokenInputController
                        header={{ title: 'Y' }}
                        coin={state.toCoin}
                        amount={state.toAmount}
                        counterPair={state.fromCoin}
                        dispatch={dispatch}
                        dispatchTypes={{ amount: TYPES.AMOUNT_CHANGE, coin: TYPES.SELECT_COIN, max: TYPES.SET_MAX_AMOUNT }}
                    />

                    {/* Swap detail */}
                    <div className="add-detail">
                        <div className="title">Pool information</div>
                        <div className="details">
                            <div className="detail">
                                <div className="number">{(coinYAmount / coinXAmount) ? cutNumber((coinYAmount / coinXAmount), 4) : '-'}</div>
                                <div className="text">{state.toCoin.toUpperCase()} per {state.fromCoin.toUpperCase()}</div>
                            </div>
                            <div className="detail">
                                <div className="number">{(coinXAmount / coinYAmount) ? cutNumber((coinXAmount / coinYAmount), 4) : '-'}</div>
                                <div className="text">{state.fromCoin.toUpperCase()} per {state.toCoin.toUpperCase()}</div>
                            </div>
                            <div className="detail">
                                <div className="number">{(coinXAmount / coinYAmount) ? cutNumber(((state.toAmount * 1000000) / coinYAmount) * 100, 4) : '-'}%</div>
                                <div className="text">Share of Pool</div>
                            </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <ActionButton onClick={add} status={getButtonCssClassNameByStatus(state.status, state.fromCoin, state.toCoin)} css={{ marginTop: "16px" }}>
                        {getButtonNameByStatus(state.status, state.fromCoin, state.toCoin)}
                    </ActionButton>
                </CardWrapper>
            </BaseCard>
        </Wrapper>
    )
}

export default AddLiquidityCard
