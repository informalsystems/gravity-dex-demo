import { WalletProvider } from "@chainapsis/cosmosjs/core/walletProvider";
import { ChainInfo } from "../src/cosmos-amm/config";
import { Keplr } from "./wallet";
import { OfflineSigner } from "@cosmjs/launchpad";

declare global {
    interface Window {
        cosmosJSWalletProvider?: WalletProvider;
        keplr?: keplr
        getOfflineSigner?: (chainId: string) => OfflineSigner & OfflineDirectSigner;
    }
}