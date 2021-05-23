import * as React from 'react';
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useHistory } from 'react-router-dom'
import { liquiditySelector } from "../../modules/liquidityRest/slice"
import { cosmosSelector } from "../../modules/cosmosRest/slice"
import { storeSelector } from "../../modules/store/slice"
import { getMinimalDenomCoin as getMDC } from '../../utils/global-functions';
import { ibcCoinImage } from '../../utils/global-functions';

function getMinimalDenomCoin(coin) {
    if (coin.startsWith('bc/')) {
        return "i" + coin
    }
    return getMDC(coin)
}

const mobileWidth = 500
const PoolWrapper = styled.div`
    width: calc(100% - 100px);
    
    max-width: 640px;
    margin: 0 auto;
    padding-bottom: 60px;

    @media (max-width: ${mobileWidth}px) {
        width: calc(100% - 24px);
    }
    
    .info {
       
        height: auto;
        
        margin-top: 60px;
        padding: 16px;

        color: #fff;

        background: radial-gradient(76.02% 75.41% at 1.84% 0%,rgb(129 31 86) 0%,rgb(0,0,0) 100%);
        border-radius: 16px;

        .title {
            font-weight: 600;
            margin-bottom: 16px;
        }

        .explain {
            font-size: 14px;
            font-weight: 500;
        }
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin: 24px 0;

        .title {
            font-size: 20px;
            font-weight: 500;
            min-width: 125px;
            color:#fff;
        }

        .buttons {
            display: flex;

            .button {
                font-weight: 500;
                text-align: center;
                outline: none;
                text-decoration: none;
                display: flex;
                -webkit-box-pack: center;
                justify-content: center;
                flex-wrap: nowrap;
                -webkit-box-align: center;
                align-items: center;
                cursor: pointer;
                position: relative;
                z-index: 1;
                border: 1px solid rgb(255 175 137);
                color: #F6743C;
                background-color: transparent;
                font-size: 16px;
                border-radius: 12px;
                padding: 6px 8px;
                width: fit-content;

                &:hover {
                    border-color: #F6743C;
                }

                &:last-child{
                    margin-left: 12px;
                    @media (max-width: ${mobileWidth}px) {
                        margin-left: 6px !important;
                }

                    border: 1px solid #F6743C;
                    background-color:#F6743C;
                    color: #fff;

                    &:hover {
                        border-color: transparent;
                        background-color: #b4562d;
                    }
                }

                @media (max-width: ${mobileWidth}px) {
                   font-size: 14px !important;
                }
            }
        }

        .search {
            display: flex;

            width: calc(100%);
            padding: 6px 16px;

            font-size: 16px;

            outline:none;
            border: 1px solid #acacac;
            border-radius: 20px;


            &:focus {
                border-color: #F6743C;
            }

            &::placeholder {
                color: #c4c4c4;
            }
        }
    }

    .no-pool {
        border: 1px solid rgb(195, 197, 203);
        color: #fff;
        padding: 16px 12px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        -webkit-box-pack: center;
        justify-content: center;
        -webkit-box-align: center;
        align-items: center;
    }

    .pool {
        display: flex;
        flex-direction: column;
        position: relative;
        align-items: center;
        justify-content: space-between;
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 20px;
        background: radial-gradient(91.85% 100% at 1.84% 0%,rgb(255 174 249) 0%,rgb(255 241 230) 100%);

        overflow:hidden;
        
        
        .background {
            position:absolute;
            mix-blend-mode: overlay;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('./assets/images/noise.png')  0% 0% / cover;
            z-index: 1;
        }

        .pool-title {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .pool-name {
                display: flex;
                align-items: center;

                font-size: 20px;
                font-weight: 500;

                .wrapper {
                    height: 22px;
                    margin-right: 12px; 

                    .coin-img {
                        width: 22px;
                        height: 22px;
                        border: 1px solid #bebebe;
                        border-radius: 50%;
                    }
                }
               
            }
            
            .manage {
                z-index: 2;
                .button {
                    font-weight: 500;
                    color: #F6743C;
                    cursor: pointer;
                }
            }
        }

        .checkbox {
            display: none;
        }

        .checkbox:checked + .pool-details {
            display:flex;
        }
      
        .pool-details {
            display: none;
            width: 100%;
            flex-direction: column;

            margin-top: 20px;

            .detail {
                display:flex;
                flex-direction: row;
                width: 100%;
                justify-content: space-between;
                margin-bottom: 8px;

                &-amount {
                    display:flex;
                    align-items: center;
                    .coin-img {
                        width: 16px;
                        height: 16px;

                        margin-left: 8px;

                        border: 1px solid #bebebe;
                        border-radius: 50%;
                    }
                }

                .apy {
                    font-size: 18px;
                    font-weight: 500;
                }
            }
        }
    }

    .all-pool {
       background: radial-gradient(91.85% 100% at 1.84% 0%,rgb(251 186 130) 0%,rgb(242 237 237) 100%);
    }

    .pool-action {
        width: 100%;
        display: flex;
        justify-content: space-around;

        margin-top: 16px;

        button {
            width: calc(50% - 20px);
            font-size: 15px;
            padding: 8px;
            font-weight: 500;
            text-align: center;
            border-radius: 8px;
            outline: none;
            border: 1px solid transparent;
            text-decoration: none;
            display: flex;
            -webkit-box-pack: center;
            justify-content: center;
            flex-wrap: nowrap;
            -webkit-box-align: center;
            align-items: center;
            cursor: pointer;
            position: relative;
            z-index: 1;
            background-color: #F6743C;
            color: white;
        }
    }
`

function getX(pool){
    if (pool.startsWith('bc/')) {
        return pool.split('/')[0] + "/" + pool.split('/')[1]
    } 
    return pool.split('/')[0]
}
function getY(pool){
    if (pool.startsWith('bc/')) {
        return pool.split('/')[2]
    }
    return pool.split('/')[1]
}

function Pool() {
    const { poolsInfo } = useSelector(liquiditySelector.all)
    const { userBalances } = useSelector(cosmosSelector.all)
    const { isWallet } = useSelector(storeSelector.all)
    const history = useHistory();
    const [searchKeyword, setSearchKeyword] = React.useState('')

    const poolsData = poolsInfo?.poolsData
    const poolTokenIndexer = poolsInfo?.poolTokenIndexer
    let poolTokenCheckedPoolsData = {}

    if (poolsData && poolTokenIndexer) {
        for (let pool in poolsData) {
            poolTokenCheckedPoolsData[pool] = { ...poolsData[pool], userPoolData: { poolTokenAmount: userBalances[poolsData[pool].pool_coin_denom] ? userBalances[poolsData[pool].pool_coin_denom] : 0 } }
        }
    }

    // console.log('poolTokenCheckedPoolsData', poolTokenCheckedPoolsData)

    function poolGenerator(data, isUser, keyword = '') {
        let result = []
        const isPools = Object.keys(data).length > 0 ? true : false

        let hasPoolToken = false
        for (let coin in userBalances) {
            if (coin.startsWith('pool')) {
                hasPoolToken = true
            }
        }

        if (isPools) {

            if (isUser) {
                if (!isWallet) {
                    return <div className="no-pool">Please connect a wallet</div>
                }
                if (!hasPoolToken) {
                    return <div className="no-pool">No liquidity found</div>
                }
            }
            // console.log(data)
            


            for (let pool in data) {

                const pairPoolData = data[pool]
                const coinX = getX(pool)
                const coinY = getY(pool)
                const uppercasePoolNames = coinX.toUpperCase().slice(0,10) + "/" + coinY.toUpperCase() // pool.toUpperCase()
                const myShare = Math.round(pairPoolData.userPoolData.poolTokenAmount / pairPoolData.pool_coin_amount * 100) / 100
                // console.log(uppercasePoolNames, pairPoolData.userPoolData.poolTokenAmount, pairPoolData.pool_coin_amount)
                // for display
                let coinXD = coinX.slice(0,10)

                let coinXImage = ibcCoinImage(coinX);
                let coinYImage = ibcCoinImage(coinY);

console.log("COINS", coinXImage, coinYImage)
                //!pool.startsWith('bc/')
                if ( isUser && data[pool].userPoolData.poolTokenAmount) {
                    result.push(
                        (<div className="pool" key={pool + '*'}>
                            <div className="pool-title">

                                <div className="pool-name">
                                    <div className="wrapper">
                                        <img className="coin-img" src={`/assets/coins/${coinXImage}.png`} alt="pairX" />
                                        <img className="coin-img" src={`/assets/coins/${coinYImage}.png`} alt="pairY" />
                                    </div>
                                    <div>{uppercasePoolNames}</div>
                                </div>
                                <div className="manage">
                                    <label className="button" htmlFor={pool}>Manage</label>
                                </div>
                            </div>
                            <input type="checkbox" className="checkbox" id={pool} />
                            <div className="pool-details">
                                <div className="detail">
                                    <div>Your total pool tokens:</div>
                                    <div>{cutNumber(pairPoolData.userPoolData.poolTokenAmount / 1000000, 4)} PoolToken</div>
                                </div>
                                <div className="detail">
                                    <div>Pooled {uppercasePoolNames.split('/')[0]}:</div>
                                    <div className="detail-amount">{cutNumber(myShare * pairPoolData.reserve_coin_balances[getMinimalDenomCoin(coinX)] / 1000000, 4)} {coinXD.toUpperCase()} <img className="coin-img" src={`/assets/coins/${coinXImage}.png`} alt="pairX" /></div>
                                </div>
                                <div className="detail">
                                    <div>Pooled {uppercasePoolNames.split('/')[1]}:</div>
                                    <div className="detail-amount">{cutNumber(myShare * pairPoolData.reserve_coin_balances[getMinimalDenomCoin(coinY)] / 1000000, 4)} {coinY.toUpperCase()} <img className="coin-img" src={`/assets/coins/${coinYImage}.png`} alt="pairY" /></div>
                                </div>
                                <div className="detail">
                                    <div>Your pool share:</div>
                                    <div>{cutNumber(myShare * 100, 4)}%</div>
                                </div>

                                <div className="pool-action">
                                    <button onClick={() => { goUrlWithQuery('add', coinX, coinY) }}>Add Liquidity</button><button onClick={() => { goUrlWithQuery('redeem', coinX, coinY) }}>Redeem</button>
                                </div>
                            </div>


                        </div>)
                    )
                  //!pool.startsWith('bc/')
                } else if (!isUser  && pairPoolData.reserve_coin_balances[getMinimalDenomCoin(coinX)] !== '0') {

                    result.push(
                        <div className="pool all-pool" key={pool}>
                            <div className="pool-title">
                                <div className="pool-name">
                                    <div className="wrapper">
                                        <img className="coin-img" src={`/assets/coins/${coinXImage}.png`} alt="pairX" />
                                        <img className="coin-img" src={`/assets/coins/${coinYImage}.png`} alt="pairY" />
                                    </div>
                                    <div>
                                        {uppercasePoolNames}
                                    </div>
                                </div>
                                <div className="manage">
                                    <label className="button" htmlFor={pool + '*'}>Manage</label>
                                </div>
                            </div>
                            <input type="checkbox" className="checkbox" id={pool + '*'} />
                            <div className="pool-details">
                                <div className="detail">
                                    <div>Total Pooled {coinXD.toUpperCase()}:</div>
                                    <div className="detail-amount">{cutNumber(pairPoolData.reserve_coin_balances[getMinimalDenomCoin(coinX)] / 1000000, 4)} {coinXD.toUpperCase()} <img className="coin-img" src={`/assets/coins/${coinXImage}.png`} alt="pairX" /></div>
                                </div>
                                <div className="detail">
                                    <div>Total Pooled {coinY.toUpperCase()}:</div>
                                    <div className="detail-amount">{cutNumber(pairPoolData.reserve_coin_balances[getMinimalDenomCoin(coinY)] / 1000000, 4)} {coinY.toUpperCase()} <img className="coin-img" src={`/assets/coins/${coinYImage}.png`} alt="pairY" /></div>
                                </div>


                                <div className="pool-action">
                                    <button onClick={() => { goUrlWithQuery('add', coinX, coinY) }}>Add Liquidity</button>
                                </div>
                            </div>
                        </div>
                    )
                }
            }
        } else {
            return <div className="no-pool">No liquidity found</div>
        }

        if (!isUser && keyword !== '') {
            result = result.filter((s => s.key.includes(keyword.toLowerCase())))
        }

        return result

        // function isEmpty(param) {
        //     return Object.keys(param).length === 0;
        // }

        function cutNumber(number, digitsAfterDot) {
            const str = `${number}`;

            return str.slice(0, str.indexOf('.') + digitsAfterDot + 1);
        }

        function goUrlWithQuery(url, a, b) {
            history.push(`/${url}?from=${a}&to=${b}`)
        }

    }



    return (
        <>
            <PoolWrapper>
                <div className="info">
                    <div className="title">
                        Liquidity provider rewards
                    </div>
                    <div className="explain">
                        Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool.
                        Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
                    </div>
                </div>

                <div className="header">
                    <div className="title">
                        Your liquidity
                    </div>

                    <div className="buttons">
                        <button className="button" onClick={() => { history.push('/create') }}>Create a pool</button>
                        {/* <button className="button" onClick={() => { history.push('/add') }}>Add Liquidity</button> */}
                    </div>
                </div>

                {poolGenerator(poolTokenCheckedPoolsData, true)}

                <div className="header">
                    <div className="title">
                        All liquidity
                    </div>

                    <div className="buttons">
                        <input type="text" className="search" value={searchKeyword} onChange={(e) => { setSearchKeyword(e.target.value) }} placeholder="Search Pool" />
                    </div>
                </div>

                {poolGenerator(poolTokenCheckedPoolsData, false, searchKeyword)}

            </PoolWrapper>
        </>
    )
}

export default Pool
