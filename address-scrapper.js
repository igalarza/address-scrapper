#!/usr/bin/env node

// External libraries
const bitcoin = require('bitcoinjs-lib')
const RpcClient = require('bitcoind-rpc')
const program = require('commander')

// Internal imports
const initDatabase = require('./src/database')
const exploreBlockchain = require('./src/chainexplorer')

// Command-line options parser
program
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .option('-d, --database <dbLocation>', 'The file uri of the database to save the addresses (default: "loki.db")')
  .option('-t, --protocol <protocol>', 'The protocol used to connect with the Bitcoin node  (default: http)')
  .option('-h, --host <host>', 'The host where the Bitcoin node is running (default: 127.0.0.1)')
  .option('-r, --port <port>', 'The port where the Bitcoin rpc service is running (default: 8332)')
  .parse(process.argv)

addressScrapper(program.username, program.password, program.database, program.protocol, program.host, program.port)

function addressScrapper (username, password, dbLocation, protocol, host, port) {

  host = initOption(host, '127.0.0.1')
  port = initOption(port, '8332')
  protocol = initOption(protocol, 'http')
  dbLocation = initOption(dbLocation, 'loki.db')

  checkMandatory(username, '--username is mandatory, run with --help for more info');
  checkMandatory(password, '--password is mandatory, run with --help for more info');

  let config = {
    protocol: protocol,
    user: username,
    pass: password,
    host: host,
    port: port,
  }

  let rpc = new RpcClient(config)
  initDatabase(dbLocation)
    .then((db) => exploreBlockchain(rpc, db))
    .catch((err) => console.error(err))
    .then(() => process.exit())
}

function initOption (value, defaultValue) {
  return (typeof value ===  'undefined') ? defaultValue : value
}

function checkMandatory (value, msg) {
  if (typeof value === 'undefined') {
    throw new Error(msg)
  }
}
