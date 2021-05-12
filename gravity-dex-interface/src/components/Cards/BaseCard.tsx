import * as React from 'react';
import styled from "styled-components";

interface PortalModalFrameInterface {
    children?: React.ReactChild
}

const Card = styled.div`
    margin : 100px auto 0;
    padding: 20px;
    max-width: 420px;
    width: 100%;
    border-radius: 30px;

    background-color: #fff;
    box-shadow: rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px;

    @media(max-width: 500px) {
        margin : 30px 12px 0 12px !important;
        width: calc(100% - 24px);
        box-shadow: rgb(0 0 0 / 11%) 0px 0px 1px, rgb(0 0 0 / 16%) 0px 4px 8px, rgb(0 0 0 / 0%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px !important;
    }
`

function BaseCard({ children }: PortalModalFrameInterface): any {

    return (
        <Card>
            {children}
        </Card>
    );
}

export default BaseCard