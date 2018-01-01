

const MongoDB = require('../../src/database/mongodb')
const Address = require('../../src/model/address')
const Utxo = require('../../src/model/utxo')

let url = 'mongodb://localhost:27017/address-scrapper'
let dbName = 'address-scrapper-test'

describe("MongoDB object test suite", function() {

  let db = new MongoDB(0)

  it('checks constructor', function() {

    expect(db).toBeDefined()
  })

  it('checks connect, connected and close methods', function(done) {

    db.connect(url, dbName)
      .then(() => db.connected())
      .then((res) => expect(res).toBe(true))
      .then(() => db.close())
      .then(() => done())
  })

  it('checks exists and init methods', function(done) {

    db.connect(url, dbName)
      .then(() => db.exists())
      .then((res) => expect(res).toBe(false))
      .then(() => db.init())
      .then(() => db.exists())
      .then((res) => expect(res).toBe(true))
      .then(() => db.clean())
      .then(() => db.close())
      .then(() => done())
  })

  it('checks insertAddress and findAddress methods', function(done) {

    let addressObj = Address.getInstance({ address: 'testAddress' })

    db.connect(url, dbName)
      .then(() => db.init())
      .then(() => db.insertAddress(addressObj))
      .then(() => db.findAddress('testAddress'))
      .then((addressFound) => expect(addressFound.address).toBe('testAddress'))
      .then(() => db.clean())
      .then(() => db.close())
      .then(() => done())
  })

  it('checks insertUtxo and findUtxo methods', function(done) {

    let utxo = Utxo.getInstance({
      txid: 'testId',
      outputs: []
    })

    db.connect(url, dbName)
      .then(() => db.init())
      .then(() => db.insertUtxo(utxo))
      .then(() => db.findUtxo('testId'))
      .then((utxoFound) => expect(utxoFound.txid).toBe('testId'))
      .then(() => db.clean())
      .then(() => db.close())
      .then(() => done())
  })
})
