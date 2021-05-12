import * as React from 'react';
import styled from "styled-components";
import ReactTooltip from 'react-tooltip';
import axios from 'axios';
import { cosmosSelector } from "../../modules/cosmosRest/slice"
import { useSelector } from "react-redux";
import { mobileCheck } from '../../utils/global-functions';

const Gear = styled.div`
    width: 40px;
    height: 40px;
    padding: 8px;
    margin-left: 8px;
    border: none;
    border-radius: 12px;
    background-color: transparent;
    color: #fff;
    cursor:pointer;

    background-color:#F6743C;

    &:hover {
        opacity: 0.8;
    }
`

const Board = styled.div`
font-size: 16px;

.row {
    text-decoration:none;
    display: flex;
    align-items: center;
    padding: 6px 0;
    color: rgba(255, 255, 255, 0.623);
    .icon{
        height: 16px;
        margin-right: 8px;
    }

    &:visited {
        color: rgba(255, 255, 255, 0.623);
    }

    &:hover {
        color: #fff;
    }
}
`

function GearButton({ onClick }) {
    const [isPending, setIsPending] = React.useState(false)
    const { userAddress } = useSelector(cosmosSelector.all);
    return (
        <>
            <Gear data-tip data-for="1" data-event='click' data-offset="{'bottom': 5, 'left': 35}">
                <a style={{ height: "16px" }} >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="sc-jbKcbu bOyUwa"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </a>


            </Gear>
            <ReactTooltip id="1" place="bottom" type="dark" effect="solid" clickable={true}>
                <Board>

                    <a className="row" href="https://medium.com/tendermint/gravity-dex-competition-guide-fcac06e94762" target="_blank" rel="noopener noreferrer">
                        <div className="icon" ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>
                        <div className="title">Guide</div>
                    </a>
                    <a className="row" href="https://gravitydex.io/about" target="_blank" rel="noopener noreferrer">
                        <div className="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
                        <div className="title">About</div>
                    </a>
                    <a className="row" onClick={async () => {
                        if (mobileCheck()) {
                            alert('Please use Desktop!')
                            return
                        }
                        console.log(userAddress)
                        if (userAddress === null) {
                            alert('No address!')
                            return
                        }
                        try {
                            setIsPending(true)
                            const response = await axios.get(`http://localhost:9999/?address=${userAddress}`)
                            console.log(response)
                            setIsPending(false)
                            alert(response.data)
                        } catch {
                            alert('Error!')
                            setIsPending(false)
                        }

                    }}>
                        <div style={{ alignItems: "center", display: "flex" }} className="icon">💵</div>
                        <div className="title">{isPending ? 'Pending' : "Faucet"}</div>
                    </a>
                </Board>

            </ReactTooltip>
        </>
    );
}

export default GearButton
