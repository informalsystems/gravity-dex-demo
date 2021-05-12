import * as React from 'react';
import styled from "styled-components";

const Action = styled.div`

    width: 100%;
    padding: 18px;
    text-align: center;
    border: none;
    border-radius: 20px;
    background-color: transparent;
    cursor:pointer;

    background: linear-gradient(91.43deg, #890FA8 0%, #F6743C 100%);
    color:#fff;
    font-size: 20px;
    font-weight: 500;

    &.disabled {
        background:  linear-gradient(91.43deg,#5f0e73 0%,#824226 100%);
        color:#fff;
        pointer-events: none;
        cursor: auto;
    }

    &.connect-wallet {
        background-color: hsl(213deg 100% 63% / 22%);
        color:#F6743C;
        &:hover {
        background-color:hsl(213deg 100% 63% / 36%) !important;
        }
    }

    &:hover {
        background:  linear-gradient(91.43deg,#890FA8 0%,#b75b33 100%);
    }
`

function ActionButton({ onClick, children, status = 'normal', css }: { onClick: any, children: React.ReactChild, status?: string, css?: object }) {
    return (
        <Action onClick={onClick} style={css} className={`${status}`}>
            {children}
        </Action>
    );
}

export default ActionButton

