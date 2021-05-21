MIL=000000
TRIL="1${MIL}${MIL}"

STAKE="${TRIL}uaurum"
COINS="${TRIL}ufecal,${TRIL}uaurum,${TRIL}uoak,${TRIL}umusk"

CHAINID=informalex


# Initialize and add keys
liquidityd init node-01 --chain-id $CHAINID
liquidityd keys add validator --keyring-backend test --output json > validator_key.json
liquidityd keys add relayer --keyring-backend test --output json > relayer_key.json
liquidityd keys add faucet --keyring-backend test --output json > faucet_key.json
liquidityd keys add user1 --keyring-backend test --output json > user1_key.json

# Add genesis accounts and provide coins to the accounts
liquidityd add-genesis-account $(liquidityd keys show validator --keyring-backend test -a) $COINS
liquidityd add-genesis-account $(liquidityd keys show relayer --keyring-backend test -a) $COINS
liquidityd add-genesis-account $(liquidityd keys show faucet --keyring-backend test -a) $COINS
liquidityd add-genesis-account $(liquidityd keys show user1 --keyring-backend test -a) $COINS

# Create gentx and collect
liquidityd gentx validator ${TRIL}uaurum --chain-id $CHAINID --keyring-backend test
liquidityd collect-gentxs

# NOW! TODO
# rename `stake` to `uaurum` in the genesis file
# reduce the pool_creation_fee to 10
