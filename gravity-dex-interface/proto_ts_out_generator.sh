ROOT_PROTO_DIR="./src/cosmos-amm"
LIQUIDITY_PROTO_DIR="$ROOT_PROTO_DIR/liquidity_proto"
THIRD_PARTY_PROTO_DIR="$ROOT_PROTO_DIR/third_party"
OUT_DIR="./src/cosmos-amm/liquidity_codecs"

mkdir -p "$OUT_DIR"

protoc \
  --plugin="./node_modules/.bin/protoc-gen-ts_proto" \
  --ts_proto_out="$OUT_DIR" \
  --proto_path="$LIQUIDITY_PROTO_DIR" \
   --proto_path="$THIRD_PARTY_PROTO_DIR" \
  --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=true" \
  "$LIQUIDITY_PROTO_DIR/genesis.proto" \
  "$LIQUIDITY_PROTO_DIR/query.proto" \
  "$LIQUIDITY_PROTO_DIR/liquidity.proto" \
  "$LIQUIDITY_PROTO_DIR/tx.proto" \
