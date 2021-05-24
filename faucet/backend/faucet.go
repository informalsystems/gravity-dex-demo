package main

import (
	//"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"sync"

	"github.com/joho/godotenv"
	//"github.com/tendermint/tmlibs/bech32"

	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"
)

var chain string

type coin struct {
	amt   int
	denom string
}

var (
	coins1 = []coin{{137, "aurum"}, {15240, "fecal"}, {721, "argent"}, {810, "oak"}, {3700, "musk"}, {1200, "coyote"}, {10, "bucky"}}
	coins2 = []coin{{137, "aurum"}, {15240, "mold"}, {721, "plumbum"}, {810, "berry"}, {3700, "pomp"}, {1200, "taz"}, {10, "bucky"}}
	coins3 = []coin{{137, "aurum"}, {15240, "mud"}, {721, "plumbum"}, {810, "egg"}, {370, "higgs"}, {1200, "dory"}, {10, "bucky"}}
)

var key string
var pass string
var node string
var publicUrl string
var already []string

func getEnv(key string) string {
	if value, ok := os.LookupEnv(key); ok {
		fmt.Println(key, "=", value)
		return value
	} else {
		log.Fatal("Error loading environment variable: ", key)
		return ""
	}
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	chain = getEnv("FAUCET_CHAIN")

	key = getEnv("FAUCET_KEY")
	pass = getEnv("FAUCET_PASS")
	node = getEnv("FAUCET_NODE")
	publicUrl = getEnv("FAUCET_PUBLIC_URL")

	http.HandleFunc("/", getCoinsHandler)

	if err := http.ListenAndServe(publicUrl, nil); err != nil {
		log.Fatal("failed to start server", err)
	}
}

var mtx sync.Mutex

func executeCmd(command string, writes ...string) (string, error) {
	fmt.Println(time.Now().UTC().Format(time.RFC3339), command)
	cmd, wc, out := goExecute(command)

	for _, write := range writes {
		wc.Write([]byte(write + "\n"))
	}
	b, _ := ioutil.ReadAll(out)
	return string(b), cmd.Wait()
}

func goExecute(command string) (cmd *exec.Cmd, pipeIn io.WriteCloser, pipeOut io.ReadCloser) {
	cmd = getCmd(command)
	pipeIn, _ = cmd.StdinPipe()
	pipeOut, _ = cmd.StderrPipe()
	go cmd.Start()
	time.Sleep(2 * time.Second)
	return cmd, pipeIn, pipeOut
}

func getCmd(command string) *exec.Cmd {
	// split command into command and args
	split := strings.Split(command, " ")

	var cmd *exec.Cmd
	if len(split) == 1 {
		cmd = exec.Command(split[0])
	} else {
		cmd = exec.Command(split[0], split[1:]...)
	}

	return cmd
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func getCoinsHandler(w http.ResponseWriter, request *http.Request) {
	enableCors(&w)
	query := request.URL.Query()
	address := query.Get("address")

	for _, addres := range already {
		if address == addres {
			fmt.Fprintf(w, "You can only make 1 faucet request per account.")
			return
		}
	}

	mtx.Lock()
	defer mtx.Unlock()

	coinsString := faucetCoins()

	sendFaucet := fmt.Sprintf("liquidityd tx --keyring-backend test bank send %v %v %v --chain-id=%v -y --home ~/.liquidityapp --broadcast-mode sync",
		key, address, coinsString, chain)
	output, err := executeCmd(sendFaucet, pass)
	if err != nil {
		fmt.Println(output)
		fmt.Fprintf(w, "Something went wrong. Please try again")
		return
	}

	already = append(already, address)
	fmt.Fprintf(w, "Your faucet request has been processed successfully. Please check your wallet :)")

	return
}

func faucetCoins() string {

	var coins []coin
	switch rand.Intn(3) {
	case 0:
		coins = coins1
	case 1:
		coins = coins2
	case 2:
		coins = coins3
	}

	// convert array of coin types to a comma separated string
	coinString := coinToString(coins[0])
	for _, c := range coins[1:] {
		coinString = coinString + "," + coinToString(c)
	}
	return coinString
}

func coinToString(c coin) string {
	amt := c.amt + rand.Intn(c.amt)
	return fmt.Sprintf("%du%s", amt*1000000, c.denom)
}
