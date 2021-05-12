import * as React from 'react'
import styled from "styled-components"
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom'
import { cutNumber, getMinimalDenomCoin } from "../../utils/global-functions"
import { cosmosSelector } from "../../modules/cosmosRest/slice"
import { liquiditySelector } from "../../modules/liquidityRest/slice"
import { BroadcastLiquidityTx } from "../../cosmos-amm/tx-client.js"
import BaseCard from "../../components/Cards/BaseCard"
import ActionButton from "../../components/Buttons/ActionButton"
import { Range, getTrackBackground } from "react-range";

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

   .returns-detail {
        border-radius: 20px;
        border: 1px solid rgb(247, 248, 250);

        margin-top: 16px;

        .title {
            padding: 16px;
            font-weight: 500;
            font-size: 14px;
        }

        .details {
           
            justify-content: space-between;
            padding: 0 16px;
            border: 1px solid rgb(247, 248, 250);
            border-radius: 20px;
            width: 100%;

            .detail {
                padding: 4px 0;
                justify-content: space-between;
                align-items: center;
                display: flex;
                width: 100%;
                
            }
        }
   }
   .easy-amount-set-buttons {
        display:flex;
        justify-content:space-between;
        align-items:center;
        width: 100%;
        padding: 0 20px;

        .button {
            background-color: #f77e4a33;
            color:#ff4d00;
            border: none;
            cursor:pointer; 
            font-size: 16px;
            outline: none;

            width: 60px;
            padding: 10px 0;

            border-radius: 8px;
            border: 1px solid transparent;

            &:hover {
                border: 1px solid #ff4d00;
            }
        }
    }

    .coin-info {
            display: flex;
            align-items: center;

            font-weight: 500;

            .coin-img {
                width: 28px;
                height: 28px;
                margin-right: 12px;
                border: 1px solid rgb(197, 197, 197);
                border-radius: 50%;
            }
        }
`

//reducer action types
const TYPES = {
    AMOUNT_CHANGE: 'AMOUNT_CHANGE',
    SET_MAX_AMOUNT: 'SET_MAX_AMOUNT',
    SET_FROM_QUERY: 'SET_FROM_QUERY'
}

//helpers
function getButtonNameByStatus(amount, share) {
    if (!share) {
        return 'No pool token'
    } else if (!amount[0]) {
        return 'Enter an amount'
    } else {
        return 'Redeem'
    }
}

function getButtonCssClassNameByStatus(amount, userShare) {
    if (amount[0] === 0 || !userShare) {
        return 'disabled'
    } else {
        return 'normal'
    }
}


function RedeemCard() {
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
        status: 'empty', // connectWallet, notSelected, empty, over, normal
        percent: [0],
    })


    let coinXAmount = null
    let coinYAmount = null
    let totalPoolCoinAmount = null
    let poolCoinDenom = null

    let userPoolCoinAmount = null
    let userShare = null

    const preSortedCoins = [getMinimalDenomCoin(state.fromCoin), getMinimalDenomCoin(state.toCoin)].sort()
    const sortedCoins = [preSortedCoins[0].substr(1), preSortedCoins[1].substr(1)]
    if (poolsData && poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`]) {
        const reserveCoins = poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`].reserve_coin_balances
        coinXAmount = reserveCoins[`${getMinimalDenomCoin(state.fromCoin)}`]
        coinYAmount = reserveCoins[`${getMinimalDenomCoin(state.toCoin)}`]

        totalPoolCoinAmount = poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`].pool_coin_amount
        poolCoinDenom = poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`].pool_coin_denom
        userPoolCoinAmount = userBalances[poolCoinDenom]
        userShare = userPoolCoinAmount / totalPoolCoinAmount
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
        switch (action.type) {
            case TYPES.AMOUNT_CHANGE:
                return { ...state, percent: action.payload.percent }
            case TYPES.SET_FROM_QUERY:
                return { ...state, fromCoin: action.payload.from, toCoin: action.payload.to }
            default:
                console.log("DEFAULT: REDUCER")
                return state;
        }
    }
    function setAmount(value) {
        dispatch({ type: TYPES.AMOUNT_CHANGE, payload: { percent: value } })
    }

    async function redeem() {
        const preSortedCoins = [getMinimalDenomCoin(state.fromCoin), getMinimalDenomCoin(state.toCoin)].sort()
        const sortedCoins = [preSortedCoins[0].substr(1), preSortedCoins[1].substr(1)]
        BroadcastLiquidityTx({
            type: 'msgWithdraw',
            data: {
                withdrawerAddress: userAddress,
                poolId: Number(poolsData[`${sortedCoins[0]}/${sortedCoins[1]}`].id),
                poolCoin: { denom: poolCoinDenom, amount: String(Math.floor(userPoolCoinAmount * state.percent[0] / 100)) },
            }
        }, storeDispatch, { type: 'Redeem', userAddress: userAddress })

        //최초
        // storeDispatch({ type: 'store/setTxModalStatus', payload: { type: "Redeem", broadcastStatus: 'pending' } })
        //브로드캐스트 성공 => 대기중
        // storeDispatch({ type: 'store/setTxModalStatus', payload: { type: "Redeem", broadcastStatus: 'success', transactionResultStatus: 'pending' } })
        // //브로드캐스트 실패 
        // storeDispatch({ type: 'store/setTxModalStatus', payload: { type: "Redeem", broadcastStatus: 'fail', resultData: 'Error' } })
        // //브로드캐스트 성공 => tx 성공
        // storeDispatch({ type: 'store/setTxModalStatus', payload: { type: "Redeem", broadcastStatus: 'success', transactionResultStatus: 'success', resultData: "success" } })
        // //브로드캐스트 성공 => tx 실패
        // storeDispatch({ type: 'store/setTxModalStatus', payload: { type: "Redeem", broadcastStatus: 'success', transactionResultStatus: 'fail', resultData: "success" } })
    }
    const STEP = 1;
    const MIN = 0;
    const MAX = 100;
    return (
        <Wrapper>
            <BaseCard>
                <CardWrapper>
                    {/* Header */}
                    <div className="header">
                        <div className="back" onClick={() => { history.push('/pool') }}>←</div>
                        <div className="title">Redeem</div>
                        <div style={{ width: "23px" }}></div>
                    </div>

                    {/* Info */}
                    {/* Info */}
                    <div className="info-box">
                        <span style={{ fontWeight: "bold" }}>Tip:</span> Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.
                    </div>



                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            margin: "0 32px 32px"
                        }}
                    >
                        <output style={{ margin: "30px", textAlign: "center", fontSize: "60px", fontWeight: 500 }} id="output">
                            <div style={{ paddingLeft: "30px" }} >{state.percent}%</div>
                        </output>
                        <Range
                            values={state.percent}
                            step={STEP}
                            min={MIN}
                            max={MAX}
                            onChange={(value) => setAmount(value)}
                            renderTrack={({ props, children }) => (
                                <div
                                    onMouseDown={props.onMouseDown}
                                    onTouchStart={props.onTouchStart}
                                    style={{
                                        ...props.style,
                                        height: "36px",
                                        display: "flex",
                                        width: "100%"
                                    }}
                                >
                                    <div
                                        ref={props.ref}
                                        style={{
                                            height: "5px",
                                            width: "100%",
                                            borderRadius: "4px",
                                            background: getTrackBackground({
                                                values: [state.percent],
                                                colors: ["#F6743C", "#ccc"],
                                                min: MIN,
                                                max: MAX
                                            }),
                                            alignSelf: "center"
                                        }}
                                    >
                                        {children}
                                    </div>
                                </div>
                            )}
                            renderThumb={({ props, isDragged }) => (
                                <div
                                    {...props}
                                    style={{
                                        ...props.style,
                                        height: "42px",
                                        width: "42px",
                                        outline: "none",
                                        borderRadius: "50%",
                                        backgroundColor: "rgb(243 164 96)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        boxShadow: "0px 2px 6px #AAA"
                                    }}
                                >

                                </div>
                            )}
                        />
                    </div>

                    {/* Easy amount set buttons */}
                    <div className="easy-amount-set-buttons">
                        <button onClick={() => { setAmount([25]) }} className="button">25%</button>
                        <button onClick={() => { setAmount([50]) }} className="button">50%</button>
                        <button onClick={() => { setAmount([75]) }} className="button">75%</button>
                        <button onClick={() => { setAmount([100]) }} className="button">Max</button>
                    </div>

                    {/* redeem detail */}
                    <div className="returns-detail">
                        <div className="title">Estimated Receives</div>
                        <div className="details">
                            <div className="detail">
                                <div className="return">
                                    {userShare ? cutNumber(userShare * coinXAmount * state.percent / 100000000, 4) : '-'}
                                </div>
                                <div className="pair">
                                    <div className="coin-info">
                                        <img className="coin-img" src={`/assets/coins/${state.fromCoin}.png`} alt="coin pair" />{state.fromCoin.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div className="detail">
                                <div className="return">{userShare ? cutNumber(userShare * coinYAmount * state.percent / 100000000, 4) : '-'}</div>
                                <div className="pair">
                                    <div className="coin-info">
                                        <img className="coin-img" src={`/assets/coins/${state.toCoin}.png`} alt="coin pair" />{state.toCoin.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <ActionButton onClick={redeem} status={getButtonCssClassNameByStatus(state.percent, userShare)} css={{ marginTop: "16px" }}>
                        {getButtonNameByStatus(state.percent, userShare)}
                    </ActionButton>
                </CardWrapper>
            </BaseCard>
        </Wrapper>
    )
}

export default RedeemCard