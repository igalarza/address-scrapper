
let MongoClient = require('mongodb').MongoClient

class MongoDB {

  constructor (logLevel) {
    this.log = logLevel
  }

  connect (url, name) {
    return MongoClient.connect(url)
      .then((mongoClient) => {
        this.mongoClient = mongoClient
        this.db = mongoClient.db(name)
        return Promise.resolve()
      })
  }

  connected () {
    return Promise.resolve(typeof this.db !== 'undefined')
  }

  close () {
    if (this.connected()) {
      return this.mongoClient.close()
    } else {
      return Promise.resolve()
    }
  }

  exists () {
    return this.db.collections().then((collections) => {
      if (collections.length === 2) {
        return Promise.resolve(true)
      } else {
        return Promise.resolve(false)
      }
    });
  }

  init () {
    return Promise.all([
      this.db.createCollection('addresses')
        .then((addresses) => addresses.createIndex('address')),
      this.db.createCollection('utxoset')
        .then((utxoset) => utxoset.createIndex('txid'))
    ])
  }

  insertAddress (address) {
    let addresses = this.db.collection('addresses')
    return addresses.insertOne(address)
  }

  findAddress (address) {
    let addresses = this.db.collection('addresses')
    return addresses.findOne({address: address})
  }

  insertUtxo (utxo) {
    let utxoset = this.db.collection('utxoset')
    return utxoset.insertOne(utxo)
  }

  findUtxo (txid, vout) {
    let utxoset = this.db.collection('utxoset')
    return utxoset.findOne({txid: txid})
  }

  clean () {
    if (typeof this.db !== 'undefined') {
      let p1 = this.db.dropCollection('addresses')
      let p2 = this.db.dropCollection('utxoset')
      return Promise.all([p1, p2])
    } else {
      return Promise.resolve()
    }

  }
}

module.exports = MongoDB
