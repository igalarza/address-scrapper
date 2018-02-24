#!/usr/bin/env node

// External libraries
const RpcClient = require('bitcoind-rpc')
const program = require('commander')

// Internal imports
const MongoDB = require('./src/database/mongodb')
const ChainExplorer = require('./src/chainexplorer')

// Command-line options parser
program
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .option('-d, --databaseUrl <string>', 'The url to connect with the MongoDB database (default: "mongodb://localhost:27017/")')
  .option('-n, --databaseName <string>', 'The name of the MongoDB database (default: "address-scrapper")')
  .option('-t, --protocol <protocol>', 'The protocol used to connect with the Bitcoin node  (default: http)')
  .option('-h, --host <host>', 'The host where the Bitcoin node is running (default: 127.0.0.1)')
  .option('-r, --port <number>', 'The port where the Bitcoin rpc service is running (default: 8332)')
  .option('-l, --log <number>', 'A number indicating the log level (default 0: no log, 1:info, 2: debug, 3:trace)')
  .parse(process.argv)

addressScrapper(program.username, program.password, program.databaseUrl, program.databaseName, program.protocol, program.host, program.port, program.log)

function addressScrapper (username, password,
  dbUrl = 'mongodb://localhost:27017/',
  dbName = 'address-scrapper',
  protocol = 'http',
  host = '127.0.0.1',
  port = '8332',
  logLevel = 0) {

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
  let database = new MongoDB(logLevel)

  database.connect(dbUrl, dbName)
    .then(() => database.exists())
    .then((dbExists) => {
      if (dbExists) {
        return Promise.resolve()
      } else {
        return database.init()
      }
    })
    .then(() => {
      let chainExplorer = new ChainExplorer(logLevel, rpc, database)
      initProcessEvents(chainExplorer)
      return chainExplorer.explore()
    })
    .then((response) => console.log(response))
    .catch((err) => console.error(JSON.stringify(err)))
    .then(() => database.close())
    .then(() => process.exit())
}

function initProcessEvents (chainExplorer) {
  if (process.platform === "win32") {
    let rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.on("SIGINT", function () {
      process.emit("SIGINT")
    })
  }

  process.on('SIGINT', function () {
    console.log('Sigterm received')
    chainExplorer.stop()
  })
}

function checkMandatory (value, msg) {
  if (typeof value === 'undefined') {
    throw new Error(msg)
  }
}
