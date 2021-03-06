# gravity-dex-demo

These are the instructions to run an environment for the Gravity DEX with UI
(supports Swap, Pools and Faucet) with Keplr integration on your local machine
from the source repos.

This repo is structured as a mono repo with correct branches of the source repos
copied in, so instead of cloning and checking out per the instructions below,
you can just use the directories here.

That said the IP address will need to be changed in the following files from
localhost to whatever the public IP is:

- `FAUCET_PUBLIC_URL` in `faucet/backend/.env`
- `const response = await
  axios.get(`http://localhost:9999/?address=${userAddress}`)` in
  `gravity-dex-interface/src/components/Buttons/ListButton.tsx`
- `rpc` and `rest` in `gravity-dex-interface/src/cosmos-amm/config.js`


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
liquidityd keys add faucet --keyring-backend test --output json > faucet_key.json

# Add genesis accounts and provide coins to the accounts
liquidityd add-genesis-account $(liquidityd keys show validator --keyring-backend test -a) 10000000000stake,10000000000uatom,500000000000uakt,10000000000uiris
liquidityd add-genesis-account $(liquidityd keys show user1 --keyring-backend test -a) 10000000000stake,10000000000uatom,500000000000uakt,10000000000uiris
liquidityd add-genesis-account $(liquidityd keys show faucet --keyring-backend test -a) 10000000000stake,10000000000uatom,500000000000uakt,10000000000uiris

# Create gentx and collect
liquidityd gentx validator 1000000000stake --chain-id consensus-testnet --keyring-backend test
liquidityd collect-gentxs
```

#### Enable CORS for the REST API

To use a preset config file, copy `config/app.toml` to `~/.liquidityapp/config/app.toml`. 

Alternatively, modify your existing app.toml file as follows:

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

#### Enable CORS for the RPC 

To use a preset config file, copy `config/config.toml` to `~/.liquidityapp/config/config.toml`. 

Alternatively, modify your existing config.toml file as follows:

Edit the file 

```
vim ~/.liquidityapp/config/config.toml 
```

Change the `cors_allowed_origins` parameter to accept `"*"`:

```
#######################################################
###       RPC Server Configuration Options          ###
#######################################################
[rpc]

# TCP or UNIX socket address for the RPC server to listen on
laddr = "tcp://127.0.0.1:26657"

# A list of origins a cross-domain request can be executed from
# Default value '[]' disables cors support
# Use '["*"]' to allow any origin
cors_allowed_origins = ["*"]
```

#### Start the chain

```
liquidityd start
```

For information on how to create transactions using the `liquidityd` binary, please check [these instructions](https://github.com/tendermint/liquidity#21-broadcast-transactions-using-cli-commands)

For example to create a liquidity pool for ATOM <-> AKT run the command from a terminal prompt:

```
liquidityd tx liquidity create-pool 1 1000000000uatom,50000000000uakt --from user1 --keyring-backend test --chain-id consensus-testnet
```

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

The faucet can be enabled using this: https://github.com/nodebreaker0-0/faucet/tree/liquidity

Follow the README there for setup. But essentially:

- configure the `FAUCET_PUBLIC_URL` in `backend/.env`
- compile with `go build faucet.go`
- run with `./faucet`


