import { defaultBech32Config } from "@chainapsis/cosmosjs/core/bech32Config";

export const currencies = [
  {
    coinDenom: "AKT",
    coinMinimalDenom: "uakt",
    coinDecimals: 6
  },
  {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6
  },
  {
    coinDenom: "IRIS",
    coinMinimalDenom: "uiris",
    coinDecimals: 6
  }
]

export const stakingCurrency = {
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
  coinDecimals: 6
};

export const chainInfo = {



  // rpc: "https://competition.bharvest.io",
  // rest: "https://competition.bharvest.io:1317",
    rpc: "http://localhost:26657",
  rest: "http://localhost:1317",
  chainId: "consensus-testnet",
  chainName: "Consensus Testnet",
  stakeCurrency: stakingCurrency,
  bip44: {
    coinType: 118
  },
  bech32Config: defaultBech32Config("cosmos"),
  currencies: [stakingCurrency].concat(currencies),
  feeCurrencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6
    }
  ],
  features: ["stargate"]
};
