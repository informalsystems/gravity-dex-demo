import { defaultBech32Config } from "@chainapsis/cosmosjs/core/bech32Config";

export const currencies = [
  {
    coinDenom: "FECAL",
    coinMinimalDenom: "ufecal",
    coinDecimals: 6
  },
  {
    coinDenom: "AURUM",
    coinMinimalDenom: "uaurum",
    coinDecimals: 6
  },
  {
    coinDenom: "OAK",
    coinMinimalDenom: "uoak",
    coinDecimals: 6
  },
  {
    coinDenom: "MUSK",
    coinMinimalDenom: "umusk",
    coinDecimals: 6
  },
  {
    coinDenom: "bc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    coinMinimalDenom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    coinDecimals: 6
      
  }
]

export const stakingCurrency = {
  coinDenom: "AURUM",
  coinMinimalDenom: "uaurum",
  coinDecimals: 6
};

export const chainInfo = {



  // rpc: "https://competition.bharvest.io",
  // rest: "https://competition.bharvest.io:1317",
  rpc: "http://localhost:26657",
  rest: "http://localhost:1317",
  chainId: "informalex",
  chainName: "Informalex",
  stakeCurrency: stakingCurrency,
  bip44: {
    coinType: 118
  },
  bech32Config: defaultBech32Config("cosmos"),
  currencies: [stakingCurrency].concat(currencies),
  feeCurrencies: [
    {
      coinDenom: "AURUM",
      coinMinimalDenom: "uaurum",
      coinDecimals: 6
    }
  ],
  features: ["stargate", "ibc-transfer"]
};
