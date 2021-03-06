
const MongoClient = require('mongodb').MongoClient
const Address = require('../model/address')

/**
 * Persistence layer implementation with MongoDB. All methods (except
 * constructor) return a Promise.
 */
class MongoDB {

  // TODO Move persistence layer to new github project
  // TODO Add a mysql/mariadb implementation

  /**
   * constructor - Creates a MongoDB instance
   *
   * @param  {integer} logLevel level of verbosity
   */
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
        if (collections.length === 3) {
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
      this.db.createCollection('status')
        .then((addresses) => addresses.createIndex('key', { unique: true })),
      this.db.createCollection('addresses')
        .then((addresses) => addresses.createIndex('address', { unique: true })),
    ])
  }

  getStatus (key) {
    if (this.log > 2) console.log('MongoDB getStatus method. key: ' + key)
    let status = this.db.collection('status')
    return status.findOne({key: key})
      .then((obj) => obj !== null ? obj.value : null)
  }

  setStatus (key, value) {
    if (this.log > 2) console.log('MongoDB setStatus method. key: ' + key)
    let status = this.db.collection('status')
    return status.replaceOne(
      {key: key},
      {
        key: key,
        value: value
      },
      {w: 1, j:true, upsert: true})
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
  
  clean () {
    if (this.log > 2) console.log('MongoDB clean method')
    if (typeof this.db !== 'undefined') {
      let p1 = this.db.dropCollection('addresses')
      let p3 = this.db.dropCollection('status')
      return Promise.all([p1, p2, p3])
    } else {
      return Promise.resolve()
    }
  }
}

module.exports = MongoDB
