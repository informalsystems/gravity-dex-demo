import * as React from 'react'
import { useSelector } from "react-redux"
import { useHistory } from 'react-router-dom'

// useDispatch,
import BasicModal from "./BasicModal"
import styled from "styled-components"
import { storeSelector } from "../../modules/store/slice"
import { checkImageExsistence } from "../../utils/global-functions"

const SelectCoinWrapper = styled.div`
@media(max-width: 500px) {
      width: 360px !important; 
}

padding-bottom: 20px;
.header{
    display:flex;
    justify-content: space-between;
    align-items: center;
    
    max-width: 420px;
    width: 420px;
    padding: 20px;
    
    @media(max-width: 500px) {
      width: 360px !important; 
    }
    
    .title {
        font-size: 18px;
        font-weight: 500;
    }

    .close {
        font-size: 20px;
        cursor: pointer;
        &:hover {
            opacity: 0.7;
        }
    }
}

.search {
    display: flex;

    width: calc(100% - 40px);
    margin: 0px;
    padding: 16px;
   
    font-size: 18px;

    outline:none;
    border: 1px solid #acacac;
    border-radius: 20px;

    &:focus {
        border-color: #F6743C;
    }
}

.wrapper {
    height: 90px;
    color: #fff;
    padding: 0 20px 0 0;
    display: flex;

    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    margin: 0 20px;
    
    .step-orders {
        width: 60px;
        height: 90px;

        .order {
            /* border: 1px solid black; */
            border-radius: 50%;
            
            width: 24px;
            /* height: 24px; */
            text-align: center;
            margin: 0 auto;
           
            &:first-child {
                margin-top: 14px;
            }
        }

        .divider {
            width: 1px;
            height: 24px;
            background-color: black;
            margin: 0 auto;
        }
    }

    .step-details {
      
        height: 148px;
        flex: 1;
     
        .detail {
            font-weight: 300;
            display:flex;
            align-items: center;
            height: 45px;
            color: #fff;
            .status {
                font-weight: 600;
                padding-left: 4px;
            }
        }
    }
}

.result {
    padding: 20px 20px 0 20px;
}

.pending {
    color: #f1a04c!important;
}


.success, .green {
    color: #0fe20f !important;
}

.fail, .red {
    color: #ff0808 !important;
}

.bold {
    font-weight: bold;
}

.finish-button {
    display: block;
    width: 60%;
    margin: 20px auto 0 auto;
    height: 40px;
    border: none;
    border-radius: 12px;
    background-color: #f39c1a;
    color: #fff;
    font-size: 18px;
    cursor: pointer;

    &:hover {
        background-color: #d38819;
    }
}

.spinner {
  width: 24px;
  height: 24px;

  position: relative;
  margin-left: 6px;
  /* margin: 100px auto; */
}

.double-bounce1, .double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgb(206, 139, 39);
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  
  -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
  animation: sk-bounce 2.0s infinite ease-in-out;
}

.double-bounce2 {
  -webkit-animation-delay: -1.0s;
  animation-delay: -1.0s;
}

@-webkit-keyframes sk-bounce {
  0%, 100% { -webkit-transform: scale(0.0) }
  50% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bounce {
  0%, 100% { 
    transform: scale(0.0);
    -webkit-transform: scale(0.0);
  } 50% { 
    transform: scale(1.0);
    -webkit-transform: scale(1.0);
  }
}
`

const ResultBoard = styled.div`
color: #fff;
background: linear-gradient(91.43deg,#860fa5 0%,#8a4223 100%);
padding: 10px 12px;
border-radius: 8px;

.header {
    text-align: center;
}

.detail {
    display:flex;
    justify-content: space-between;
    padding: 4px 0; 
}

.result-title {
    font-size: 20px;
    text-align: center;
    padding-bottom: 20px;
}
`


//helpers
function getResultMessage(type, result) {
    if (result) {
        // console.log('getResultMessage / result', result)
        if (result.isSuccess) {
            switch (type) {
                case 'Redeem':
                    const withdrawCoins = result.data.withdraw_coins?.split(',')
                    const coinA = withdrawCoins[0].match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+|)/g);
                    const coinB = withdrawCoins[1].match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+|)/g);
                    const coinAAmount = Math.floor(Number(coinA[0])) / 1000000
                    const coinBAmount = Math.floor(Number(coinB[0])) / 1000000
                    return (
                        <>
                            <div className="detail">
                                <div className="title">Status : </div>
                                <div className="body"> Redeem Success! 🎉</div>
                            </div>
                            <div className="detail">
                                <div className="title">Received : </div>
                                <div className="body"><span className="green">+ {coinAAmount}</span> {coinA[1].substr(1).toUpperCase()}</div>
                            </div>
                            <div className="detail">
                                <div className="title"> </div>
                                <div className="body"><span className="green">+ {coinBAmount}</span> {coinB[1].substr(1).toUpperCase()}</div>
                            </div>
                        </>
                    )

                case 'Create':
                    return "Pool Created! 🎉"
                case 'Add Liquidity':
                    const receivedPoolCoinAmount = Math.floor(result.data.pool_coin_amount) / 1000000
                    const addCoins = result.data.accepted_coins?.split(',')
                    const A = addCoins[0].match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+|)/g);
                    const B = addCoins[1].match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+|)/g);
                    const AAmount = Math.floor(Number(A[0])) / 1000000
                    const BAmount = Math.floor(Number(B[0])) / 1000000
                    return (
                        <>
                            <div className="detail">
                                <div className="title">Status : </div>
                                <div className="body"> Add Liquidity Success! 🎉</div>
                            </div>
                            <div className="detail">
                                <div className="title">Added to pool: </div>
                                <div className="body"><span className="red">+ {AAmount}</span> {A[1].substr(1).toUpperCase()}</div>
                            </div>
                            <div className="detail">
                                <div className="title"> </div>
                                <div className="body"><span className="red">+ {BAmount}</span> {B[1].substr(1).toUpperCase()}</div>
                            </div>
                            <div className="detail">
                                <div className="title">Received : </div>
                                <div className="body"><span className="green">+ {receivedPoolCoinAmount}</span> POOL COIN</div>
                            </div>
                        </>
                    )
                case 'Swap':
                    const paidDenom = result.data.offer_coin_denom.startsWith('u') ? result.data.offer_coin_denom.substr(1) : result.data.offer_coin_denom
                    const receivedDenom = result.data.demand_coin_denom.startsWith('u') ? result.data.demand_coin_denom.substr(1) : result.data.demand_coin_denom

                    const isRevese = [paidDenom, receivedDenom].sort()[0] === paidDenom ? false : true

                    const paidAmount = result.data.exchanged_offer_coin_amount / 1000000
                    const receivedAmount = Math.floor(result.data.exchanged_offer_coin_amount / (isRevese ? 1 / result.data.swap_price : result.data.swap_price) / 100) / 10000

                    const successPercentage = Math.round(result.data.exchanged_offer_coin_amount / result.data.offer_coin_amount * 100)
                    return (
                        <>
                            <div className="detail">
                                <div className="title">Status : </div>
                                <div className="body">Swap Success <span className="bold">({successPercentage}%)</span></div>
                            </div>
                            <div className="detail">
                                <div className="title">Paid : </div>
                                <div className="body"><span className="red">- {paidAmount}</span> {paidDenom === "xrun" ? paidDenom.substr(1).toUpperCase() : paidDenom.toUpperCase()}</div>
                            </div>
                            <div className="detail">
                                <div className="title">Received : </div>
                                <div className="body"><span className="green">+ {receivedAmount}</span> {receivedDenom === "xrun" ? receivedDenom.substr(1).toUpperCase() : receivedDenom.toUpperCase()}</div>
                            </div>
                        </>
                    )
            }
        } else {
            return <div>{String(result.data)}</div>
        }
    }
}



function TxProcessingModal({ isOpen, toggle }: { isOpen: boolean, toggle: any, }) {

    const { txModalData } = useSelector(storeSelector.all)
    const [broadcastStatus, setBroadcastStatus] = React.useState('pending')
    const [transactionResultStatus, setTransactionResultStatus] = React.useState('waiting')
    const history = useHistory()
    React.useEffect(() => {
        setBroadcastStatus(txModalData.broadcastStatus ? txModalData.broadcastStatus : 'pending')
        setTransactionResultStatus(txModalData.transactionResultStatus ? txModalData.transactionResultStatus : 'waiting')
    }, [txModalData])

    function finish(type) {
        console.log(txModalData.resultData)
        if (txModalData.resultData.isSuccess) {
            if (type !== "Swap") {
                history.push('/pool')
            } else {
                history.push(`/swap?from=${txModalData.resultData.data.offer_coin_denom.substr(1)}&to=${txModalData.resultData.data.demand_coin_denom.substr(1)}&time=${new Date().getTime()}`)
            }
        }

        toggle()
    }

    return (

        <BasicModal elementId="modal" isOpen={isOpen} toggle={toggle}>
            <SelectCoinWrapper>
                <div className="header">
                    <div className="title">{txModalData.type} Steps</div>
                    <div className="close" onClick={() => { toggle() }}>X</div>
                </div>

                <div className="wrapper">
                    <div className="step-orders">
                        <div className={`order ${broadcastStatus}`} style={{ color: "#F6743C" }}>①</div>
                        <div className="divider" style={{ backgroundColor: broadcastStatus === "success" ? "green" : "darkgray" }}></div>
                        <div className={`order ${transactionResultStatus}`} style={{ color: "darkgray" }}>②</div>
                    </div>
                    <div className="step-details">
                        <div className="detail">Transaction Broadcast - <span className={`status ${broadcastStatus}`}>{broadcastStatus.toUpperCase()}</span>
                            {broadcastStatus === "pending" ? <div className="spinner">
                                <div className="double-bounce1"></div>
                                <div className="double-bounce2"></div>
                            </div> : ''}
                        </div>
                        <div className={`detail`} style={{ color: transactionResultStatus === "waiting" ? "darkgray" : "#fff" }}>Transaction Result - <span className={`status ${transactionResultStatus}`}>{transactionResultStatus.toUpperCase()}</span>
                            {transactionResultStatus === "pending" ? <div className="spinner">
                                <div className="double-bounce1"></div>
                                <div className="double-bounce2"></div>
                            </div> : ''}
                        </div>
                    </div>
                </div>

                {txModalData.resultData ? <div className="result">
                    {/* <div className="title">Result</div> */}

                    <ResultBoard>
                        <div className="result-title">RESULT</div>
                        {getResultMessage(txModalData.type, txModalData.resultData)}

                    </ResultBoard>

                    <button className="finish-button" onClick={() => { finish(txModalData.type) }}>Close</button>

                </div> : ''}


            </SelectCoinWrapper>
        </BasicModal>
    );
}

export default TxProcessingModal