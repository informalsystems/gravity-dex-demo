import { defaultBech32Config } from "@chainapsis/cosmosjs/core/bech32Config";

export const currencies = [
  {
    coinDenom: "FECAL",
    coinMinimalDenom: "ufecal",
    coinDecimals: 6
  },
  {
    coinDenom: "MOLD",
    coinMinimalDenom: "umold",
    coinDecimals: 6
  },
  {
    coinDenom: "MUD",
    coinMinimalDenom: "umud",
    coinDecimals: 6
  },
  {
    coinDenom: "AURUM",
    coinMinimalDenom: "uaurum",
    coinDecimals: 6
  },
  {
    coinDenom: "ARGENT",
    coinMinimalDenom: "uargent",
    coinDecimals: 6
  },
  {
    coinDenom: "PLUMBUM",
    coinMinimalDenom: "uplumbum",
    coinDecimals: 6
  },
  {
    coinDenom: "OAK",
    coinMinimalDenom: "uoak",
    coinDecimals: 6
  },
  {
    coinDenom: "BERRY",
    coinMinimalDenom: "uberry",
    coinDecimals: 6
  },
  {
    coinDenom: "EGG",
    coinMinimalDenom: "uegg",
    coinDecimals: 6
  },
  {
    coinDenom: "MUSK",
    coinMinimalDenom: "umusk",
    coinDecimals: 6
  },
  {
    coinDenom: "POMP",
    coinMinimalDenom: "upomp",
    coinDecimals: 6
  },
  {
    coinDenom: "HIGGS",
    coinMinimalDenom: "uhiggs",
    coinDecimals: 6
  },
  {
    coinDenom: "COYOTE",
    coinMinimalDenom: "ucoyote",
    coinDecimals: 6
  },
  {
    coinDenom: "TAZ",
    coinMinimalDenom: "utaz",
    coinDecimals: 6
  },
  {
    coinDenom: "DORY",
    coinMinimalDenom: "udory",
    coinDecimals: 6
  },
  {
    coinDenom: "BUCKY",
    coinMinimalDenom: "ubucky",
    coinDecimals: 6
  },
  {
    coinDenom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
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
  chainId: "informal-testnet-1",
  chainName: "Informal DeX",
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
