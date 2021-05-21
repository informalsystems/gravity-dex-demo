import * as React from 'react'
import { useSelector } from "react-redux"
// useDispatch,
import BasicModal from "./BasicModal"
import styled from "styled-components"
import { currencies } from "../../cosmos-amm/config"
import { cosmosSelector } from "../../modules/cosmosRest/slice"
import { checkImageExsistence, getMinimalDenomCoin } from "../../utils/global-functions"

const SelectCoinWrapper = styled.div`
@media(max-width: 500px) {
      width: 360px !important; 
}
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
    margin: 0 20px;
    padding: 16px;
   
    font-size: 18px;

    outline:none;
    border: 1px solid #acacac;
    border-radius: 20px;

    &:focus {
        border-color: #F6743C;
    }
}

.coin-list-wrapper {
    height: 500px;
    overflow: auto;

    padding-left: 20px;

    margin: 16px 0;

    .row {
        display: flex;
        width: 100%;
        height: 55px;
        align-items: center;
        justify-content: space-between;

        cursor: pointer;
        
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

        .coin-balance {
            padding-right: 20px;
        }

        &:hover {
            background-color: rgba(229, 229, 231, 0.356);
        }
    }
}
`

function CoinSelectModal({ isOpen, toggle, selectCoin }: { isOpen: boolean, toggle: any, selectCoin: any }) {
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const { userBalances } = useSelector(cosmosSelector.all);

    React.useEffect(() => {
        setSearchKeyword('')
    }, [isOpen])

    function generateCoinList(pairs, keyword, counterPair) {
        let listPairs = []
        pairs.forEach((item) => {
            let coinDenom = item.coinDenom
            if (!coinDenom.startsWith('bc') ) {
                coinDenom = coinDenom.toLowerCase()
            }
            listPairs.push(coinDenom)
        })

        if (keyword !== '') {
            listPairs = listPairs.filter((s => s.includes(keyword)))
        }

        return listPairs.map((pair, index) => {

            if (counterPair === pair) {
                return null
            }

            let coinImage = pair;
            if ( coinImage.startsWith("bc") ){
                coinImage = "atom"
            }

            const pairBalance = Math.floor(userBalances[getMinimalDenomCoin(pair)] / 10000) / 100
            return (
                <div className="row"
                    onClick={() => {
                        selectCoin.dispatch({ type: selectCoin.type, payload: { coin: pair, target: selectCoin.target } })
                        toggle()
                    }} key={index}>
                    <div className="coin-info">
                        {checkImageExsistence(pair) ? <img className="coin-img" src={`/assets/coins/${coinImage}.png`} alt="coin pair" /> : <div className="coin-img" style={{ padding: "3px 0 0 0", textAlign: "center" }}>?</div>}
                        {pair === "xrun" ? pair.substr(1).toUpperCase() : pair.toUpperCase().substr(0,10)}
                    </div>
                    <div className="coin-balance">{pairBalance || 0}</div>
                </div>
            )
        })
    }

    return (

        <BasicModal elementId="modal" isOpen={isOpen} toggle={toggle}>
            <SelectCoinWrapper>
                <div className="header">
                    <div className="title">Select a coin</div>
                    <div className="close" onClick={() => { toggle() }}>X</div>
                </div>

                <input className="search" value={searchKeyword} onChange={(e) => { setSearchKeyword(e.target.value) }} type="text" placeholder="Search Coin" />
                <div className="coin-list-wrapper">
                    {generateCoinList(currencies, searchKeyword, selectCoin.counterPair)}
                </div>

            </SelectCoinWrapper>
        </BasicModal>
    );
}

export default CoinSelectModal
