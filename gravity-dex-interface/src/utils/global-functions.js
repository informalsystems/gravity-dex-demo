import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function ibcCoinImage(coin) {
    if ( coin.startsWith("bc") ){
        return "atom"
    }
    return coin
}

export function getTokenIndexer(wtl) {
    let tokenIndexer = {}
    if (wtl) {
        wtl.forEach((item) => {
            tokenIndexer[item.denom] = item.amount
        })
    }
    return tokenIndexer
}

export function getMyTokenBalance(token, indexer) {
    if (indexer === null) {
        return `My Balance: 0`
    } else {
        const balance = Number(Number(indexer[token]) / 1000000).toFixed(2)
        if (balance !== "NaN") {
            return `My Balance: ${balance}`
        } else {
            return `My Balance: 0`
        }
    }
}

export function cutNumber(number, digitsAfterDot) {
    const str = `${number}`;

    return parseFloat(str.slice(0, str.indexOf('.') + digitsAfterDot + 1))
}

export function getMyCoinBalance(coin, myBalance) {
    if (myBalance[coin.toLowerCase()] !== undefined) {
        return Number(myBalance[coin.toLowerCase()])
    } else {
        return 0
    }
}

export function getMinimalDenomCoin(x) {
    if (x === "run" || x === "xrun") {
        return "xrun"
    } else if (x.startsWith("ibc") ) {
        return x
    } else {
        return "u" + x
    }
}

export function sortCoins(x, y) {
    const sortedCoins = [x, y].sort()

    let isReverse = true
    if (sortedCoins[0] === x) {
        isReverse = false
    }
    return { coins: sortedCoins, isReverse: isReverse }
}

export function checkImageExsistence(coinName) {
    if (coinName === 'xrn') {
        return false
    } else {
        return true
    }
}

function uSlice(coin) {
   /*if (coin.startsWith("ibc")) {
       return coin.substr(0)
   }*/
   return coin.substr(1)
}

export function getSelectedPairsPoolData(state, action, counterTarget, poolData) {
    let coinA = state[`${counterTarget}Coin`]
    let coinB = action.payload.coin
    const preSortedCoins = [getMinimalDenomCoin(coinA), getMinimalDenomCoin(coinB)].sort()
    const sortedCoins = [uSlice(preSortedCoins[0]), uSlice(preSortedCoins[1])]
    let key = normalizeKey(sortedCoins, poolData) 
    const selectedPairsPoolData = poolData?.[key]
    return selectedPairsPoolData === undefined ? false : selectedPairsPoolData
}

function normalizeKey(sortedCoins, poolData) {
    let key = `${sortedCoins[0]}/${sortedCoins[1]}`
    const selectedPairsPoolData = poolData?.[key]
    // hack to try the reverse order for the key since sorting might be wrong 
    // for reasons I don't really understand yet (probably due to the u slicing somewhere) ...
    if (selectedPairsPoolData === undefined ){
        key = `${sortedCoins[1]}/${sortedCoins[0]}`
    }
    return key
}

export function getPoolPrice(state, action, counterTarget, poolData) {
    let coinA;
    let coinB;
    if (counterTarget === 'from') {
        coinA = state[`${counterTarget}Coin`]
        coinB = action.payload.coin
    } else {
        coinA = action.payload.coin
        coinB = state[`${counterTarget}Coin`]
    }

    const preSortedCoins = [getMinimalDenomCoin(coinA), getMinimalDenomCoin(coinB)].sort()
    const sortedCoins = [uSlice(preSortedCoins[0]), uSlice(preSortedCoins[1])]
    let key = normalizeKey(sortedCoins, poolData)
    const slectedPairsPoolData = poolData[key]

    const price = slectedPairsPoolData[coinA] / slectedPairsPoolData[coinB]

    return price
}




//~~~~

export function getDepositCoins(denoms, amounts) {
    return { denoms: [denoms[0], denoms[1]], amounts: [amounts[denoms[0]], amounts[denoms[1]]] }
}

export function calculateCounterPairAmount(e, state, type) {
    const inputAmount = e.target.value

    let price = null
    let counterPairAmount = 0
    let counterPair = ''

    if (type === 'swap') {
        const swapFeeRatio = 0.9985 // ultimaetly get params
        let swapPrice = null;

        if (e.target.id === "tokenAAmount") {
            swapPrice = (state.tokenAPoolAmount / 1000000 + 2 * inputAmount) / state.tokenBPoolAmount / 1000000
            counterPairAmount = inputAmount / swapPrice * swapFeeRatio / 1000000 / 1000000

            console.log('From')
            console.log('swapPrice', swapPrice)
            console.log('counterPairAmount', counterPairAmount / 1000000 / 1000000)
        } else {
            swapPrice = (state.tokenBPoolAmount / 1000000 + 2 * inputAmount) / state.tokenAPoolAmount / 1000000
            counterPairAmount = ((inputAmount * 1 / swapFeeRatio) / swapPrice) / 1000000 / 1000000

            console.log('To')
            console.log('swapPrice', swapPrice)
            console.log('counterPairAmount', counterPairAmount / 1000000 / 1000000)
        }

        price = 1 / swapPrice / 1000000 / 1000000

    } else {
        if (e.target.id === "tokenAAmount") {
            price = state.tokenBPoolAmount / state.tokenAPoolAmount
            counterPair = "tokenBAmount"
            counterPairAmount = inputAmount * price
        } else {
            price = state.tokenAPoolAmount / state.tokenBPoolAmount
            counterPair = "tokenAAmount"
            counterPairAmount = inputAmount * price
        }
        counterPairAmount = counterPairAmount.toFixed(2)
    }

    return {
        price: price,
        counterPair: counterPair,
        counterPairAmount: counterPairAmount,
    }
}

export function calculateSlippage(swapAmount, poolReserve) {
    let slippage = 2 * swapAmount / poolReserve

    if (slippage > 0.997) {
        slippage = 0.997
    }

    return slippage
}

export function getPoolToken(pl, wt) {
    let myPoolTokens = {};
    wt.forEach((ele) => {
        if (ele.denom.length > 10) {
            myPoolTokens[ele.denom] = ele.amount;
        }
    });
    return pl.map((ele) => {
        let myTokenAmount = 0;
        if (myPoolTokens[ele.liquidity_pool.pool_coin_denom]) {
            myTokenAmount = myPoolTokens[ele.liquidity_pool.pool_coin_denom];
        }
        return {
            coinDenom: `${ele.liquidity_pool.reserve_coin_denoms[0]
                .substr(1)
                .toUpperCase()}-${ele.liquidity_pool.reserve_coin_denoms[1]
                    .substr(1)
                    .toUpperCase()}`,
            tokenDenom: [
                ele.liquidity_pool.reserve_coin_denoms[0],
                ele.liquidity_pool.reserve_coin_denoms[1]
            ],
            poolTokenAmount:
                ele.liquidity_pool_metadata.pool_coin_total_supply.amount,
            coinMinimalDenom: ele.liquidity_pool.pool_coin_denom,
            reserveCoins: ele.liquidity_pool_metadata.reserve_coins,
            myTokenAmount: myTokenAmount,
            poolId: ele.liquidity_pool.pool_id
        };
    });
}

export const toastGenerator = (type = '', msg = '') => {
    let toastFunc = null
    switch (type) {
        case "error":
            toastFunc = toast.error(msg, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            break;
        case "success":
            toastFunc = toast.success(msg, {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined
            })
            break;
        case "warning":
            toastFunc = toast.warning(msg, {
                position: "bottom-right",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            break;
        case "info":
            toastFunc = toast.info(msg, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            break;
        case "connect":
            toastFunc = toast.success('👛 Wallet Connected!', {
                position: "bottom-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            break;
        default:
            toastFunc = toast(msg, {
                position: "bottom-right",
                autoClose: 4300,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            break;
    }
    return toastFunc
}

export const mobileCheck = () => {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw(n|u)|c55\/|capi|ccwa|cdm|cell|chtm|cldc|cmd|co(mp|nd)|craw|da(it|ll|ng)|dbte|dcs|devi|dica|dmob|do(c|p)o|ds(12|d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(|_)|g1 u|g560|gene|gf5|gmo|go(\.w|od)|gr(ad|un)|haie|hcit|hd(m|p|t)|hei|hi(pt|ta)|hp( i|ip)|hsc|ht(c(| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i(20|go|ma)|i230|iac( ||\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|[a-w])|libw|lynx|m1w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|mcr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|([1-8]|c))|phil|pire|pl(ay|uc)|pn2|po(ck|rt|se)|prox|psio|ptg|qaa|qc(07|12|21|32|60|[2-7]|i)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h|oo|p)|sdk\/|se(c(|0|1)|47|mc|nd|ri)|sgh|shar|sie(|m)|sk0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h|v|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl|tdg|tel(i|m)|tim|tmo|to(pl|sh)|ts(70|m|m3|m5)|tx9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas|your|zeto|zte/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
