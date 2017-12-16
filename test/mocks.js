
const fs = require('fs')

let transactions = JSON.parse(fs.readFileSync('./test/transactions.json', 'utf8'));
let db = []
let rpc = {
  getRawTransaction: function (txId, json, callback) {
    let jsonTx = transactions.filter((tx) => tx.txid === txId)
    let error = null
    if (jsonTx.length === 0) {
      error = 'mock transaction not found!'
    }
    return callback(error, {result: jsonTx[0]})
  }
}
let collection = {
  length: function() {
    return db.length
  },
  by: function (name, value) {
    if (name === 'address' && typeof db[value] !== 'undefined') {
      return db[value]
    } else {
      return undefined;
    }
  },
  insert: function (object) {
    if (typeof db[object.address] !== 'undefined') {
      throw new Error('primary key validation failed')
    } else {
      db.push(object)
    }
  }
}

module.exports = {
  transactions,
  rpc,
  collection
}
