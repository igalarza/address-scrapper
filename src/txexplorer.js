
const AddressParser = require('./addressparser')
const Address = require('./model/address')
const promiseMap = require('./util/promiseMap')

class TransactionExplorer {

  constructor (logLevel, rpc, currentBlock, db) {
    this.log = logLevel
    this.rpc = rpc
    this.currentBlock = currentBlock
    this.db = db
    this.parser = new AddressParser(logLevel, this.db)
  }

  iterateTransactions (txArray, currentTx) {

    if (currentTx >= txArray.length) {
      if (this.log > 1) console.log('All transactions explored.')
      return Promise.resolve()

    } else {
      if (this.log > 2) console.log('iterateTransactions. currentTx (' + currentTx + '): ' + txArray[currentTx])

      return this.getTransactionInfo(txArray[currentTx])
        .then((info) => this.iterateOutputs(info))
        .then(() => this.iterateTransactions(txArray, ++currentTx))
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject(err))
    }
  }

  iterateOutputs (tx) {
    if (tx === null) {
      return Promise.resolve(null)
    }
    return promiseMap(tx.vout, (output) => {
      return this.parser.parseOutput(this.currentBlock, tx, output)
        .then((addresses) => {
          if (this.log > 2) console.log('iterateOutputs. addresses: ' + JSON.stringify(addresses))
          let addressPromises = addresses.map((address) => {
            if (address.isDefined()) {
              return this.persistAddress(address)
                .then(() => Promise.resolve())
                .catch((err) => Promise.reject(err))
            } else {
              return Promise.resolve()
            }
          })
          return Promise.all(addressPromises)
            .then(() => Promise.resolve(tx))
            .catch((err) => Promise.reject(err))
        })
      })
      .then(() => Promise.resolve(tx))
      .catch((err) => Promise.reject(err))
  }

  persistAddress (addressObj) {
    return this.db.findAddress(addressObj.address)
      .then((persistedAddress) => {
        if (persistedAddress.isDefined()) {
          if (this.log > 2) console.log('Updating address: ' + persistedAddress.address)
          persistedAddress.update(addressObj)
          if (this.log > 1) console.log('Address updated: ' + persistedAddress.address)
          return this.db.updateAddress(persistedAddress)
        } else {
          if (this.log > 1) console.log('Inserted new address: ' + addressObj.address)
          return this.db.insertAddress(addressObj)
        }
      })
      .catch((err) => Promise.reject('Error persisting address! ' + err))
  }

  getTransactionInfo (txId) {
    if (this.log > 2) console.log('getTransactionInfo. txId: ' + txId)
    return new Promise((resolve, reject) => {
      let that = this
      this.rpc.getRawTransaction(txId, 1, function (err, res) {
        if (err) {
          reject('Error: ' + err)
        } else {
          if (that.log > 2) console.log(res.result)
          resolve(res.result)
        }
      })
    })
  }
}

module.exports = TransactionExplorer;
