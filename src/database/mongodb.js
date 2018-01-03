
const MongoClient = require('mongodb').MongoClient
const Address = require('../model/address')
const Utxo = require('../model/utxo')

class MongoDB {

  constructor (logLevel) {
    this.log = logLevel
  }

  connect (url, name) {
    if (this.log > 2) console.log('MongoDB connect method')
    return MongoClient.connect(url)
      .then((mongoClient) => {
        this.mongoClient = mongoClient
        this.db = mongoClient.db(name)
        return Promise.resolve()
      })
      .catch((err) => Promise.reject(err))
  }

  connected () {
    if (this.log > 2) console.log('MongoDB connected method')
    return Promise.resolve(typeof this.db !== 'undefined')
  }

  close () {
    if (this.log > 2) console.log('MongoDB close method')
    if (this.connected()) {
      return this.mongoClient.close()
    } else {
      return Promise.resolve()
    }
  }

  exists () {
    if (this.log > 2) console.log('MongoDB exists method')
    return this.db.collections()
      .then((collections) => {
        if (collections.length === 2) {
          return Promise.resolve(true)
        } else {
          return Promise.resolve(false)
        }
      })
      .catch((err) => Promise.reject(err))
  }

  init () {
    if (this.log > 2) console.log('MongoDB init method')
    return Promise.all([
      this.db.createCollection('addresses')
        .then((addresses) => addresses.createIndex('address')),
      this.db.createCollection('utxoset')
        .then((utxoset) => utxoset.createIndex('txid'))
    ])
  }

  getLastExploredBlock () {
    if (this.log > 2) console.log('MongoDB getLastExploredBlock method')
    let addresses = this.db.collection('addresses')
    return addresses.find().sort({lastSeen: -1}).limit(1).toArray()
      .then((arr) => {
        if (arr.length === 1) {
          return Promise.resolve(arr[0].lastSeen)
        } else {
          return Promise.resolve(1)
        }
      })
      .catch((err) => Promise.resolve(1))
  }

  insertAddress (address) {
    if (this.log > 2) console.log('MongoDB insertAddress method')
    let addresses = this.db.collection('addresses')
    return addresses.insertOne(address, {w: 1, j:true})
  }

  updateAddress (addressObj) {
    if (this.log > 2) console.log('MongoDB updateAddress method')
    let addresses = this.db.collection('addresses')
    return addresses.replaceOne({address: addressObj.address}, addressObj, {w: 1, j:true})
  }

  findAddress (address) {
    if (this.log > 2) console.log('MongoDB findAddress method')
    let addresses = this.db.collection('addresses')
    return addresses.findOne({address: address})
      .then((addressObj) => Promise.resolve(Address.getInstance(addressObj)))
      .catch((err) => Promise.resolve(Address.getInstance()))
  }

  insertUtxo (utxo) {
    if (this.log > 2) console.log('MongoDB insertUtxo method')
    let utxoset = this.db.collection('utxoset')
    return utxoset.insertOne(utxo, {w: 1, j:true})
  }

  updateUtxo (utxo) {
    if (this.log > 2) console.log('MongoDB updateUtxo method')
    let utxoset = this.db.collection('utxoset')
    return utxoset.replaceOne({txid: utxo.txid}, utxo, {w: 1, j:true})
  }

  findUtxo (txid) {
    if (this.log > 2) console.log('MongoDB findUtxo method')
    let utxoset = this.db.collection('utxoset')
    return utxoset.findOne({txid: txid})
      .then((utxo) => Promise.resolve(Utxo.getInstance(utxo)))
      .catch((err) => Promise.resolve(Utxo.getInstance()))
  }

  removeUtxo (txid) {
    if (this.log > 2) console.log('MongoDB removeUtxo method')
    let utxoset = this.db.collection('utxoset')
    return utxoset.deleteOne({txid: txid})
      .then((response) => Promise.resolve(response.result.ok === 1))
      .catch(() => Promise.resolve(false))
  }

  clean () {
    if (this.log > 2) console.log('MongoDB clean method')
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
