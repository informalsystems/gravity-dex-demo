import * as React from 'react';
import styled from "styled-components";

import { useDispatch, useSelector } from "react-redux"

const SettingWrapper = styled.div`
width: 360px;
border-top-left-radius: 12px;

.title {
    color: rgb(86, 90, 105);
    text-align:left;
    font-weight: 500;
    line-height: 1.8;
    font-size: 15px;

    background-color: #fff;
    padding: 20px 20px 10px;
    border-radius: 12px;

div {
    position: absolute;
    color:black;
    top: 24px;
    right: 20px;
    line-height: 1;
    font-size: 20px;
    font-weight: 300;
    opacity: 0.8;
    transition: opacity 0.2s;
    cursor: pointer;

    &:hover {
        opacity: 0.6;
    }
}
}
.settings {
    padding: 0 20px 20px;

    .setting{
        font-weight: 400;
        color: rgb(86, 90, 105);
        font-size: 14px;
    }

    .slippage {
        display: flex;
        align-items: center;
        margin-top: 12px;

        .input {
            text-align: reverse;
            color: rgb(0, 0, 0);
            -webkit-box-align: center;
            align-items: center;
            border-radius: 36px;
            font-size: 1rem;
            max-width: 68px;
            min-width: 3.5rem;
            outline: none;
            background: rgb(255, 255, 255);
            height: 2rem;
            position: relative;
            padding: 0px 20px 0 12px;
            flex: 1 1 0%;
            border: 1px solid #acacac;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        /* Firefox */
        & {
            -moz-appearance: textfield;
        }

            &:focus {
                border: 1px solid #F6743C;
            }
        }

        .percent {
            color: rgb(86, 90, 105);

            margin-left: -22px;
            z-index: 2;
        }
    }

    .slippage-warning {
        color: rgb(255, 0, 122);
        margin-top: 10px;
        height: 20px;
    }
}


`

function ConnectWalletModal({ close }: { close: any }) {
    const slippage = useSelector((state) => state.store.userData.userSlippage)
    const [slippageStatus, setSlippageStatus] = React.useState('normal')
    const dispatch = useDispatch()

    function updateSlippage(value) {

        if (value < 1) {
            setSlippageStatus('low')
        } else if (value > 20) {
            setSlippageStatus('over')
            return
        } else {
            setSlippageStatus('normal')
        }
        console.log(value)
        dispatch({ type: 'store/setSlippage', payload: { userSlippage: value ? Number(value) : '' } })
    }

    function setSlippageStatusWarning(status) {
        switch (status) {
            case 'over':
                return 'Enter a valid slippage (under 20%)'
            case 'low':
                return 'Your transaction may fail'
            default:
                return ''
        }
    }

    return (

        < SettingWrapper >
            <div className="title">
                Transaction Settings
                    <div onClick={() => {
                    if (slippage === 0 || slippage === '') {
                        dispatch({ type: 'store/setSlippage', payload: { userSlippage: 3 } })
                    }
                    close()
                }}>X</div>
            </div>
            <div className="settings">
                <div className="setting">
                    Slippage tolerance
                </div>
                <div className="slippage">
                    <input
                        className="input"
                        type="number"
                        value={slippage}
                        onChange={(e) => {
                            updateSlippage(e.target.value)
                        }} />
                    <div className="percent">%</div>
                </div>
                <div className="slippage-warning">
                    {setSlippageStatusWarning(slippageStatus)}
                </div>
            </div>

        </SettingWrapper >


    );
}

export default ConnectWalletModal