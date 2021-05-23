//library
import * as React from 'react'
import styled from "styled-components"
// import { lighten } from 'polished'
import { NavLink } from 'react-router-dom'

//icons
import logoDesktop from "../../assets/logo/logo-desktop.png"
import logoMobile from "../../assets/logo/logo-mobile.png"
import DesktopLogo from "../../assets/svgs/DesktopLogo"

import wallet from '../../assets/wallets/dollar_wallet.png'
import GearButton from "../../components/Buttons/Gear"
import ListButton from "../../components/Buttons/ListButton"
import { GridSpinner } from 'react-spinners-kit'

//modals
import BasicModal from "../Modals/BasicModal"
import ConnectWalletModal from "./ConnectWalletModal"
import SettingModal from "./SettingModal"
import WalletModal from "./WalletModal"

//for wallet
import { chainInfo } from "../../cosmos-amm/config"
import { cosmosSelector, cosmosAction } from "../../modules/cosmosRest/slice"

//helpers
import { useToggle } from "ahooks";
import { useDispatch, useSelector } from "react-redux";
import { toastGenerator, mobileCheck } from "../../utils/global-functions"

const { requestQueryAllBalances } = cosmosAction;
// styled-components
const HeaderFrame = styled.div`
display:flex;
justify-content: space-between;
align-items: center;
width: 100%;
padding: 1rem;
z-index: 3;
${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 14px !important;
`};
`

const Logo = styled.div`

.logo {
  width: 100%;
  height: auto;
}

@media(max-width: 500px) {
  margin-right: 12px;

  svg {
    width: 160px;
  }
}
`

const Navigation = styled.nav`
width: fit-content;
display:inline-flex;
`

const activeClassName = "ACTIVE"

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: #fff;
  font-size: inherit;
  width: fit-content;
  margin: 0 16px;
  font-weight: 500;
  padding: 4px 0;

  &.${activeClassName} {
    border-bottom: 3px solid#890FA8;
;
    color: #fff;
  }

    transition: transform 0.1s;
  :hover {
    transform: scale(1.1)
  }
`

const ConnectWallet = styled.button`
width: fit-content;
padding: 10px 24px 10px;
border-radius: 12px;
background-color: ${({ theme }) => theme.blue1};

font-weight: 500;
font-size: 16px;
border: none;
color: ${({ theme }) => theme.white};

margin-left: 16px;

cursor: pointer;
outline: none;

${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const WalletWidget = styled.div`
display:flex;
align-items: center;
justify-content: space-between;
margin-left: 12px;
background-color:  #812056;
padding: 1px 1px 1px 12px;
border-radius: 12px;
color: #fff;

.total-value {
  display:flex;
  align-items: center;
  font-weight: 500;
  letter-spacing: 0.8px;

  .wallet {
    width: 32px;
    margin-right: 10px;
    transition: transform 0.1s;
    cursor:pointer;
    &:hover {
      transform:scale(1.1);
    }
  }
}
`

const ConnectedWallet = styled.button`
padding: 0.5rem;
margin-left: 12px;
border-radius: 12px;
background-color: #F6743C;
font-size: 16px;
font-weight: 500;
border: none;
/* cursor: pointer; */
color:#fff;
outline:none;
text-align: center;
letter-spacing: 1px;
border: 2px solid transparent;

div {
  display:flex;
  align-items: center;
  justify-content:space-between;
  margin: 0 8px;
}

/* &:hover {
  border: 2px solid #fff;
} */
`

const NavigationFrame = styled.div`
display: flex;
align-items: center;
`

//component
function AppHeader() {
  const [isConnectWalletModalOpen, { toggle: connectWalletModalToggle }] = useToggle();
  const [isSettingModalOpen, { toggle: settingModalToggle }] = useToggle();
  const [isWalletModalOpen, { toggle: walletModalToggle }] = useToggle();
  const [walletAddress, setWalletAddress] = React.useState('')

  const { userBalances } = useSelector(cosmosSelector.all);
  const priceData = useSelector((state) => state.store.priceData)
  const walletStatus = useSelector((state) => state.store.userData.walletStatus)
  const dispatch = useDispatch()

  window.onload = () => {
    connectWallet(false)
  }

  async function connectWallet(isToggle = true) {
    if (!window.getOfflineSigner || !window.keplr) {
      if (mobileCheck()) {
        toastGenerator("info", "🙏  functions are available on the desktop");
      } else {
        toastGenerator("info", "🙏  Please install the Keplr extension");
      }
      return;
    }

    if (!window.keplr?.experimentalSuggestChain) {
      toastGenerator("info", "🙏 Please use the latest version of Keplr extension");
      return;
    }

    try {
      await window.keplr.experimentalSuggestChain(chainInfo);
    } catch {
      alert('suggest chain rejected!')
      return
    }

    await window.keplr.enable(chainInfo.chainId);

    const offlineSigner = window.getOfflineSigner(chainInfo.chainId);
    const accounts = await offlineSigner.getAccounts()
    const walletAddress = accounts[0].address

    if (walletAddress.length === 0) {
      throw new Error("there is no key");
    }

    if (walletAddress) {
      setWalletAddress(walletAddress)
      dispatch({ type: 'store/setIsWallet', payload: true })

      if (isToggle) {
        connectWalletModalToggle()
      }

      dispatch(requestQueryAllBalances(walletAddress))

      setInterval(() => {
        dispatch(requestQueryAllBalances(walletAddress))
      }, 5000)
    }
  };

  function logoFrame(srcM, srcD) {

    return (
      <Logo>
        <div className="logo">
          {mobileCheck() ? <img src="/apple-touch-icon.png" style={{ width: "48px", height: "48px" }} alt="logo" /> : <DesktopLogo />}
        </div>
      </Logo>
    )
  }

  function navigationLinks() {
    return (
      <Navigation>
        <StyledNavLink to={"/swap"}>Swap</StyledNavLink>
        <StyledNavLink to={"/pool"}>Pool</StyledNavLink>
        {/* <StyledNavLink to={"/price"}>Price</StyledNavLink>
        <StyledNavLink to={"/rank"}>Rank</StyledNavLink> */}
      </Navigation>
    )
  }

  function showStatusDetail() {
    //open modal below is test
    // dispatch({ type: 'store/togglePendingStatus' })
  }

  function getTotalValue(userBalance) {

    let totalValue = 0

    for (let pair in userBalance) {
      if (userBalance[pair] !== undefined && priceData[pair] !== undefined) {
        totalValue += Number(userBalance[pair]) * Number(priceData[pair])
      }
    }

    return (Math.floor(totalValue * 100) / 100).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  function walletWidget() {

    return (
      walletAddress === '' ? <ConnectWallet onClick={() => { connectWalletModalToggle() }}>CONNECT WALLET</ConnectWallet>
        :
        <WalletWidget>
          {/* determine pending status with local tx data */}

          <div className="total-value">
            <img src={wallet} className="wallet" alt="wallet from www.flaticon" onClick={() => {
              walletModalToggle()
            }} />
            ${getTotalValue(userBalances)}
          </div>

          <ConnectedWallet onClick={() => { showStatusDetail() }}>
            {walletStatus !== "pending" ? <div>{walletAddress.substr(0, 10)}...{walletAddress.substr(-5)}</div> : <div style={{ margin: 0, paddingRight: "6px" }}><div style={{ margin: "0 0 0 12px" }}>Pending</div><GridSpinner size={19} /></div>}

          </ConnectedWallet>
        </WalletWidget>

    )
  }

  return (
    <HeaderFrame>
      {logoFrame(logoMobile, logoDesktop)}

      <NavigationFrame>
        {navigationLinks()}
        {walletWidget()}
        {mobileCheck() ? '' : <GearButton onClick={() => { settingModalToggle() }} />}
        <ListButton onClick={() => { settingModalToggle() }} />
      </NavigationFrame>


      {/* modals */}
      <BasicModal elementId="modal" isOpen={isConnectWalletModalOpen} toggle={connectWalletModalToggle}>
        <ConnectWalletModal close={connectWalletModalToggle} connect={connectWallet} />
      </BasicModal>

      <BasicModal elementId="modal" isOpen={isSettingModalOpen} toggle={settingModalToggle}>
        <SettingModal close={settingModalToggle}></SettingModal>
      </BasicModal>

      <BasicModal elementId="modal" isOpen={isWalletModalOpen} toggle={walletModalToggle}>
        <WalletModal close={walletModalToggle} priceData={priceData} userBalances={userBalances} totalValue={getTotalValue(userBalances)} />
      </BasicModal>

    </HeaderFrame>
  );
}

export default AppHeader
