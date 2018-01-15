

const MongoDB = require('../../src/database/mongodb')
const Address = require('../../src/model/address')
const Utxo = require('../../src/model/utxo')

let url = 'mongodb://localhost:27017/address-scrapper'
let dbName = 'address-scrapper-test'

describe("MongoDB object test suite", function() {

  let db = new MongoDB(0)


  it('checks constructor', function() {
    expect(db).toBeDefined()
  }, 10000)


  it('checks connect, connected and close methods', function(done) {

    db.connect(url, dbName)
      .then(() => db.connected())
      .then((res) => expect(res).toBe(true))
      .catch()
      .then(() => done())
      .then(() => db.close())
  }, 10000)


  it('checks getStatus and setStatus methods', function(done) {

    let obj = {
      key: 'testkey',
      value: 'testvalue'
    }

    db.connect(url, dbName)
      .then(() => db.init())
      .then(() => db.setStatus(obj.key, obj.value))
      .then(() => db.getStatus(obj.key))
      .then((res) => {
        expect(res.key).toBe(obj.key);
        expect(res.value).toBe(obj.value);
        return Promise.resolve()
      })
      .catch()
      .then(() => db.clean())
      .then(() => done())
      .then(() => db.close())
  }, 10000)


  it('checks getLastExploredBlock method', function(done) {

    let addressObj = Address.getInstance({
      address: 'testAddress',
      lastSeen: 20
    })

    db.connect(url, dbName)
      .then(() => db.init())
      .then(() => db.getLastExploredBlock())
      .then((lastExploredBlock) => expect(lastExploredBlock).toBe(1))
      .then(() => db.insertAddress(addressObj))
      .then(() => db.getLastExploredBlock())
      .then((lastExploredBlock) => expect(lastExploredBlock).toBe(20))
      .catch()
      .then(() => db.clean())
      .then(() => done())
      .then(() => db.close())
  }, 10000)


  it('checks exists and init methods', function(done) {

    db.connect(url, dbName)
      .then(() => db.exists())
      .then((res) => expect(res).toBe(false))
      .then(() => db.init())
      .then(() => db.exists())
      .then((res) => expect(res).toBe(true))
      .catch()
      .then(() => db.clean())
      .then(() => done())
      .then(() => db.close())
  }, 10000)

  it('checks insertAddress and findAddress methods', function(done) {

    let addressObj = Address.getInstance({ address: 'testAddress' })

    db.connect(url, dbName)
      .then(() => db.init())
      .then(() => db.insertAddress(addressObj))
      .then(() => db.findAddress('testAddress'))
      .then((addressFound) => expect(addressFound.address).toBe('testAddress'))
      .then(() => done())
      .catch()
      .then(() => db.close())
      .then(() => db.clean())
  }, 10000)

  it('checks updateAddress method', function(done) {

    db.connect(url, dbName)
      .then(() => db.connected())
      .then((res) => expect(res).toBe(true))
      .then(() => done())
      .then(() => db.close())
  }, 10000)

  it('checks insertUtxo, findUtxo and removeUtxo methods', function(done) {

    let utxo = Utxo.getInstance({
      txid: 'testId',
      outputs: []
    })

    db.connect(url, dbName)
      .then(() => db.init())
      .then(() => db.insertUtxo(utxo))
      .then(() => db.findUtxo('testId'))
      .then((utxoFound) => expect(utxoFound.txid).toBe('testId'))
      .then(() => db.removeUtxo('testId'))
      .then((response) => expect(response).toBe(true))
      .catch()
      .then(() => db.clean())
      .then(() => done())
      .then(() => db.close())
  }, 10000)
})
