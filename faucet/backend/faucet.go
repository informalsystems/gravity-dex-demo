package main

import (
	//"encoding/json"
	"fmt"

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
var amountAtom string
var amountRegen string
var amountBtsg string
var amountDvpn string
var amountXprt string
var amountAkt string
var amountLuna string
var amountNgm string
var amountGcyb string
var amountIris string
var amountRun string
var amountCom string
var amountDsm string
var amountFecal string
var amountAurum string
var amountOak string
var amountMusk string

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
	amountFecal = getEnv("FAUCET_AMOUNT_FECAL")
	amountAurum = getEnv("FAUCET_AMOUNT_AURUM")
	amountOak = getEnv("FAUCET_AMOUNT_OAK")
	amountMusk = getEnv("FAUCET_AMOUNT_MUSK")

	key = getEnv("FAUCET_KEY")
	pass = getEnv("FAUCET_PASS")
	node = getEnv("FAUCET_NODE")
	publicUrl = getEnv("FAUCET_PUBLIC_URL")

	http.HandleFunc("/", getCoinsHandler)

	if err := http.ListenAndServe(publicUrl, nil); err != nil {
		log.Fatal("failed to start server", err)
	}
}

func executeCmd(command string, writes ...string) {
	cmd, wc, _ := goExecute(command)

	for _, write := range writes {
		wc.Write([]byte(write + "\n"))
	}
	cmd.Wait()
}

func goExecute(command string) (cmd *exec.Cmd, pipeIn io.WriteCloser, pipeOut io.ReadCloser) {
	cmd = getCmd(command)
	pipeIn, _ = cmd.StdinPipe()
	pipeOut, _ = cmd.StdoutPipe()
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
	already = append(already, address)

	sendFaucet := fmt.Sprintf("liquidityd tx --keyring-backend test bank send %v %v %v,%v,%v,%v --chain-id=%v -y --home ~/.liquidityapp",
		key, address, amountFecal, amountAurum, amountOak, amountMusk, chain)
	fmt.Println(sendFaucet)
	fmt.Println(time.Now().UTC().Format(time.RFC3339), address, "[1]")
	executeCmd(sendFaucet, pass)
	fmt.Fprintf(w, "Your faucet request has been processed successfully. Please check your wallet :)")

	return
}
