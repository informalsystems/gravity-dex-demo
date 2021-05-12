import * as React from 'react';
// import styled from "styled-components";
import ReactTooltip from 'react-tooltip';
const tooltipData = {
    globalPrice: "USD price on coinmarketcap",
    globalPriceRatio: "Price ratio calculated from global price",
    internalPriceRatio: "Pool price ratio",
    arbitrage: "Diversion of global ratio and internal ratio results in arbitrage chances"
}
function Tooltip(props) {

    return (
        <>
            <a data-tip data-for={props.text} style={{ height: "16px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </a>
            <ReactTooltip id={props.text} place="top" type="dark" effect="float">{props.text}</ReactTooltip>
        </>
    );
}

export default Tooltip