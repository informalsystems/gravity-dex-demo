import * as React from 'react';
import styled from "styled-components";

import keplr from "../../assets/wallets/keplr.png"

const Title = styled.div`
width: 300px;

color: black;
text-align:center;
font-weight: 500;
line-height: 1.8;
font-size: 18px;

background-color: #fff;

border-top-left-radius: 6px;
border-top-right-radius: 6px;
padding: 60px 12px 40px ;

div {
    position: absolute;
    top: 20px;
    right: 20px;
    line-height: 1;
    font-size: 22px;
    font-weight: 300;
    transition: opacity 0.2s;
    cursor: pointer;

    &:hover {
        opacity: 0.6;
    }
}
`

const WalletListWrapper = styled.div`
width: 300px;
padding: 0 40px 40px 40px;
border-bottom-left-radius: 6px;
border-bottom-right-radius: 6px;

button {
    width: 220px;
    height: 50px;

    padding: 0 40px;

    background-color: #fff;
    border: 1px solid #c5c5c5;
    border-radius: 4px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    cursor: pointer;
    outline: none;

    transition: border 0.2s;

    &:hover {
        border: 1px solid #F6743C;
    }

    img {
        width: 20px;
        height: 20px;
    }

    div {
        font-size: 15px;
        font-weight: 500;
    }
}
`

function ConnectWalletModal({ close, connect }: { close: any, connect: any }) {

    return (
        <>
            <Title>Connect your wallet <br /> to proceed
            <div onClick={() => { close() }}>X</div>
            </Title>
            <WalletListWrapper>
                <button onClick={() => { connect() }}>
                    <img src={keplr} alt="keplr" />
                    <div>Connect Keplr</div>
                </button>
            </WalletListWrapper>
        </>
    );
}

export default ConnectWalletModal