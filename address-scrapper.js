#!/usr/bin/env node

// External libraries
const RpcClient = require('bitcoind-rpc')
const program = require('commander')

// Internal imports
const Database = require('./src/database')
const ChainExplorer = require('./src/chainexplorer')

// Command-line options parser
program
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .option('-d, --database <file>', 'The file uri of the database to save the addresses (default: "loki.db")')
  .option('-t, --protocol <protocol>', 'The protocol used to connect with the Bitcoin node  (default: http)')
  .option('-h, --host <host>', 'The host where the Bitcoin node is running (default: 127.0.0.1)')
  .option('-r, --port <number>', 'The port where the Bitcoin rpc service is running (default: 8332)')
  .option('-l, --log <number>', 'A number indicating the log level (default 0: no log, 1:info, 2: debug, 3:trace)')
  .parse(process.argv)

addressScrapper(program.username, program.password, program.database, program.protocol, program.host, program.port, program.log)

function addressScrapper (username, password, dbLocation, protocol, host, port, logLevel) {

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
  let database = new Database(logLevel, dbLocation)

  database.init()
    .then((db) => {
      initProcessEvents(db)
      let chainExplorer = new ChainExplorer(logLevel, rpc, db)
      return chainExplorer.explore()
    })
    .catch((err) => console.error(err))
    .then(() => {
      database.get().saveDatabase(function() {
        process.exit()
      })
    })
}

function initProcessEvents (db) {
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
    console.log('Closing gracefully...')
    db.saveDatabase(function() {
      process.exit()
    })
  })
}

function initOption (value, defaultValue) {
  return (typeof value ===  'undefined') ? defaultValue : value
}

function checkMandatory (value, msg) {
  if (typeof value === 'undefined') {
    throw new Error(msg)
  }
}
