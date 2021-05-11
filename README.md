# gravity-dex-demo

These are the instructions to run an environment for the Gravity DEX with UI (supports Swap, Pools and Faucet) with Keplr integration

## Liquidity Chain

### Clone the liquidity chain repository

```
git clone https://github.com/tendermint/liquidity
cd liquidity
make install   
```

If everything builds successfully you can run 

```
liquidityd version
```

It should output the version number e.g. `1.2.5`

### Run the liquidity chain

Execute the commands below to run the chain

```
# Initialize and add keys
liquidityd init node-01 --chain-id consensus-testnet
liquidityd keys add validator --keyring-backend test --output json > validator_key.json
liquidityd keys add user1 --keyring-backend test --output json > user1_key.json

# Add genesis accounts and provide coins to the accounts
liquidityd add-genesis-account $(liquidityd keys show validator --keyring-backend test -a) 10000000000stake,10000000000uatom,500000000000uakt,10000000000uiris
liquidityd add-genesis-account $(liquidityd keys show user1 --keyring-backend test -a) 10000000000stake,10000000000uatom,500000000000uakt,10000000000uiris

# Create gentx and collect
liquidityd gentx validator 1000000000stake --chain-id consensus-testnet --keyring-backend test
liquidityd collect-gentxs
```

#### Enable the REST API

Edit the file 

```
vim ~/.liquidityapp/config/app.toml 
```

Modify the `enable` and `enabled-unsafe-cors` parameter under `[api]`, set them to true:

```
###############################################################################
###                           API Configuration                             ###
###############################################################################

[api]

# Enable defines if the API server should be enabled.
enable = true
...
# EnableUnsafeCORS defines if CORS should be enabled (unsafe - use it at your own risk).
enabled-unsafe-cors = true
```

#### Start the chain

```
liquidityd start
```

For information on how to create transactions using the `liquidityd` binary, please check [these instructions](https://github.com/tendermint/liquidity#21-broadcast-transactions-using-cli-commands)

## Gravity DEX UI

The Gravity DEX UI is a web application that provides an interface (UI) to the liquidity chain

### Clone the Gravity DEX UI repository

```
git clone https://github.com/b-harvest/gravity-dex-interface
```

Checkout the `test-page` branch

```
cd gravity-dex-interface
git checkout test-page
```

### Configure the Gravity DEX UI

In order to have your local copy of the Gravity DEX UI to connect with your local `liquidityd` chain you will need to modify a few variables in a file.

Open the file `src/cosmos-amm/config.js`

Modify the `chainInfo` variable to look like the one below: (basically change the endpoints on port 26657 and 1317 to point to localhost and chain name and ID to reflect your liquidity chain parameters) 

```
export const chainInfo = {
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
```

On the same file, configure the currencies (these will be the tokens available to create pools). It should look like this:

```
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
```

Save the file.

### Keplr (wallet)

You also need to have the [Keplr wallet](https://keplr.app/) browser extension installed on your computer.

Once you have it installed you can import the user1 account you created above into Keplr using the mnemonic from the key (the `user1_key.json` file)

### Running the Gravity DEX UI

#### Pre-requisites

##### NodeJS

In order to run the Gravity DEX UI you will need a version of [NodeJS installed](https://nodejs.org/en/download/) on your machine.

#### Start the web application

In order to run the Gravity DEX UI run the commands:

```
npm install
npm run start
```

The web application will be opened in your browser at `http://localhost:3000`.

The first time you get to the page you should get a prompt from the Keplr wallet asking you to connect to the `consensus-testnet` chain. If the wallet is locked, please unlock it with your password. Please approve and accept the prompts (there should be 2 prompts).

Open the Keplr wallet and switch to the `Consensus Testnet` chain using the dropdown box and ensure you are logged with the `user1` account you've imported into Keplr.

  
### Run the faucet

[TBD]

The faucet I believe can be enabled using this: https://github.com/nodebreaker0-0/faucet/tree/liquidity
