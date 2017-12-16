
# address-scrapper

This little script explores bitcoin blockchain and creates an address database.

## Installation

Clone this project or download it from npm:

`git clone https://github.com/igalarza/address-scrapper.git`

`npm install address-scrapper`

## Usage

You can run it as a command:

    D:\Devel\bitcoin\address-scrapper>node address-scrapper.js --help

    Usage: address-scrapper [options]

    Options:

    -u, --username <username>    The user to authenticate as
    -p, --password <password>    The user's password
    -d, --database <dbLocation>  The file uri of the database to save the addresses (default: "loki.db")
    -t, --protocol <protocol>    The protocol used to connect with the Bitcoin node  (default: http)
    -h, --host <host>            The host where the Bitcoin node is running (default: 127.0.0.1)
    -r, --port <port>            The port where the Bitcoin rpc service is running (default: 8332)
    -h, --help                   output usage information

## TODO

- [ ] Add some tests
- [ ] Don't store blocks
- [ ] Add more info to the address objects (first seen, last seen, signatures, unspent outputs)


