import * as React from 'react';
import styled from "styled-components";
import { useToggle } from "ahooks"
import { useSelector } from "react-redux";
// useDispatch,
import CoinSelectorArrow from "../../assets/svgs/CoinSelectorArrow"
import CoinSelectModal from "../Modals/CoinSelectModal"

import { cosmosSelector } from "../../modules/cosmosRest/slice"
import { checkImageExsistence, getMinimalDenomCoin } from "../../utils/global-functions"

const Wrapper = styled.div`
    border-radius: 20px;
    border: 1px solid rgb(247, 248, 250);
    padding: 12px;

    .sub-titles {
        display:flex;
        justify-content: space-between;
        font-weight: 500;
        font-size: 14px;
        color: rgb(86, 90, 105);

        margin-bottom: 12px;
    }

    .input-controllers {
        display:flex;
        justify-content: space-between;
        flex-flow: row nowrap;
        -webkit-box-align: center;
        align-items: center;

        .left {
            position: relative;
            display: inline-block;
            flex: 1 1 auto;

            width: 0px;
            padding: 0px;

            font-size: 24px;
            font-weight: 500;
            color: rgb(0, 0, 0);
            text-transform: none;
            text-indent: 0px;
            text-shadow: none;
            text-align: start;
            letter-spacing: normal;
            word-spacing: normal;
            writing-mode: horizontal-tb;
            text-rendering: auto;
           
            outline: none;
            border: none;
            
            background-color: transparent;
            
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        
            appearance: textfield;
           
            &::placeholder {
                color: rgb(179, 178, 178);
            }
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        /* Firefox */
        input[type=number] {
            -moz-appearance: textfield;
        }


        .right {
            display: flex;
            align-items: center;

            .max-button {
                height: 28px;

                margin-right: 4px;

                background-color: #f77e4a33;
                color:#F6743C;
                
                border: 1px solid transparent;
                border-radius: 8px;
            
                outline: none;
                
                font-size: 14px;
                font: 600 13.3333px Arial;
                cursor: pointer;
                
                &:hover { 
                    border: 1px solid #F6743C;        
                }
            }

            .coin-selector {
                display:flex;
                align-items: center;

                padding: 4px 6px;

                font-size: 18px;
                font-weight: 600;

                border-radius: 8px;
                border: 1px transparent solid;

                cursor: pointer;

                .coin-image {
                    width: 24px;
                    height: 24px;
                    
                    border-radius: 50%;
                    border: 1px solid rgb(197,197,197);
                    margin-right: 8px;
                }

                &:hover {
                    background-color: rgb(240 240 241);
                }
            }

            .not-selected {
                background-color:#F6743C;
                font-size: 15px;
                padding: 6px 12px;
                color: #fff;
                font-weight: 500;

                &:hover {
                    background-color:#ce6032 !important;
                }
            }
        }

    }
`
function getUserCoinBalance(coin, userBalances) {
    if (userBalances[getMinimalDenomCoin(coin)] !== undefined) {
        return Math.floor(userBalances[getMinimalDenomCoin(coin)] / 10000) / 100
    } else {
        return '-'
    }
}


function TokenInputController({ header, amount, coin, counterPair, dispatch, dispatchTypes }:
    {
        header: { title: string },
        amount: number,
        coin: string,
        counterPair: string,
        dispatch: any,
        dispatchTypes: { amount: string, coin: string, max: string }
    }) {

    const isCoin = coin !== '' ? true : false
    const [isCoinSelectModalOpen, { toggle: CoinSelectModalToggle }] = useToggle()

    const { userBalances } = useSelector(cosmosSelector.all);
    const userCoinBalance = getUserCoinBalance(coin, userBalances)
    return (
        <>
            <Wrapper>
                <div className="sub-titles">
                    <div className="left">{header.title}</div>
                    <div className="right">Balance: {userCoinBalance}</div>
                </div>
                <div className="input-controllers">

                    <input
                        className="left"
                        value={amount}
                        onChange={(e) => {
                            dispatch({ type: dispatchTypes.amount, payload: { target: header.title, amount: e.target.value } })
                        }}
                        placeholder="0.0"
                        type="number" />

                    <div className="right">
                        <button
                            className="max-button"
                            style={{ display: `${isCoin && (header.title === 'From' || header.title === 'X') && Number(amount) < Number(userCoinBalance) ? '' : 'none'}` }}
                            onClick={() => {
                                dispatch({ type: dispatchTypes.max, payload: { target: header.title, amount: userCoinBalance } })
                            }}
                        >MAX</button>
                        <div className={`coin-selector ${isCoin ? '' : 'not-selected'}`} onClick={() => {
                            CoinSelectModalToggle()
                        }}>
                            {isCoin ?
                                <>
                                    {/* <img className="coin-image" src={`/assets/coins/${coin}.png`} alt="selected coin" /> {coin.toUpperCase()} */}

                                    {checkImageExsistence(coin) ? <img className="coin-image" src={`/assets/coins/${coin}.png`} alt="coin pair" /> :
                                        <div className="coin-image" style={{ padding: "1px 0 0 0", textAlign: "center" }}>
                                            ?</div>}
                                    {coin === "xrun" ? coin.substr(1).toUpperCase() : coin.toUpperCase()}
                                </>
                                : 'Select a coin '}
                            &nbsp; <CoinSelectorArrow stroke={coin !== '' ? '' : '#fff'} />
                        </div>
                    </div>
                </div>
            </Wrapper>
            <CoinSelectModal isOpen={isCoinSelectModalOpen} toggle={CoinSelectModalToggle} selectCoin={{ dispatch: dispatch, type: dispatchTypes.coin, target: header.title, counterPair: counterPair }} />
        </>
    )
}

export default TokenInputController