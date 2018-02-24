
# address-scrapper

This little script explores bitcoin blockchain and creates an address database. 

**Caution!** This is a work in progress, with bugs and unimplemented features. I will release a beta as soon as the code is ready.

## Branch 0.0.x

When I started programing this I thought it would be easy to store the balances of each address, simply adding and substracting the amounts of the transactions in the address objects. Well, I've found out its not easy. Since I'm only really interested in the addresses themselves and not in the balances of each address, I'm going to prune the master branch of all the code about balances and utxos and move on.

## Dependencies

The code is written in javascript and needs [node](https://nodejs.org/) to execute it. It also needs a bitcoin full node with the RCP service enabled.

The connection with the bitcoin node is made using [bitcoind-rpc](https://github.com/bitpay/bitcoind-rpc).

Command-line arguments are processed using [commander](https://github.com/tj/commander.js)

Persistence layer uses [MongoDB](https://github.com/mongodb/node-mongodb-native)

## Installation

Clone this project or download it from npm:

`git clone https://github.com/igalarza/address-scrapper.git`

`npm install address-scrapper`

## Usage

You can run it as a command:

    >node address-scrapper.js --help

    Usage: address-scrapper [options]

    Options:

    -u, --username <username>    The user to authenticate as
    -p, --password <password>    The user's password
    -d, --databaseUrl <string>   The url to connect with the MongoDB database (default: "loki.db")
    -d, --databaseName <string>  The name of the MongoDB database (default: "mongodb://localhost:27017/")
    -t, --protocol <protocol>    The protocol used to connect with the Bitcoin node  (default: http)
    -h, --host <host>            The host where the Bitcoin node is running (default: 127.0.0.1)
    -r, --port <number>          The port where the Bitcoin rpc service is running (default: 8332)
    -l, --log <number>           A number indicating the log level (default 0: no log, 1:info, 2: debug, 3:trace)
    -h, --help                   output usage information

## TODO

- [x] Close the database properly when the process is killed or an exception is raised
- [ ] Add jsdoc documentation
- [ ] Calculate balances properly
- [ ] Wait for the next block when we have explored all blocks instead of killing the process
- [x] Refactor persistence layer to allow more databases
- [x] Add some tests
- [x] Don't store blocks
- [x] Add more info to the address objects (first seen, last seen, signatures, unspent outputs)
