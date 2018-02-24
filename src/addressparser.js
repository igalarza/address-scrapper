
const Address = require('./model/address')
const promiseMap = require('./util/promiseMap')

class AddressParser {

  constructor (logLevel, db) {
    this.log = logLevel
    this.db = db
  }

  parseOutput (blockHeight, tx, output) {
    if (this.log > 2) console.log('parseOutput: ' + JSON.stringify(output))
    if (typeof output.scriptPubKey.addresses === 'undefined') {
      return Promise.resolve([])
    } else {
      return promiseMap(output.scriptPubKey.addresses, (address) => {
        return this.db.findAddress(address)
          .then((addressObj) => Promise.resolve(new Address(address, blockHeight)))
          .catch((err) => Promise.reject(err))
      })
    }
  }
}

module.exports = AddressParser
