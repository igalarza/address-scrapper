
const AddressParser = require('./addressparser')
const Address = require('./model/address')

class TransactionExplorer {

  constructor (logLevel, rpc, currentBlock, db) {
    this.log = logLevel
    this.rpc = rpc
    this.currentBlock = currentBlock
    this.db = db
    this.parser = new AddressParser(logLevel, this.db)
  }

  iterateTransactions (txArray, currentTx) {

    return new Promise((resolve, reject) => {

      if (currentTx >= txArray.length) {
        if (this.log > 2) console.log('All transactions explored.')
        resolve()

      } else {
        if (this.log > 2) console.log('iterateTransactions. currentTx (' + currentTx + '): ' + txArray[currentTx])
        this.getTransactionInfo(txArray[currentTx])
          .then((info) => this.iterateOutputs(info))
          .then((info) => this.iterateInputs(info))
          .then(() => this.iterateTransactions(txArray, ++currentTx))
          .then(() => resolve())
          .catch((err) => reject(err))
      }
    })
  }

  iterateInputs (tx) {
    let inputPromises = tx.vin.map((input) => {
      if (typeof input.coinbase !== 'undefined') {
        return Promise.resolve(tx)
      } else {
        this.parser.parseInput(this.currentBlock, tx, input)
          .then((address) => {
            if (this.log > 2) console.log('iterateInputs. addresses: ' + JSON.stringify(address))
            if (address.isDefined()) {
              this.persistAddress(address)
                .then(() => Promise.resolve(tx))
                .catch((err) => Promise.reject(err))
            }
          })
      }
    })
    return Promise.all(inputPromises)
      .then(() => Promise.resolve(tx))
  }

  iterateOutputs (tx) {
    let outputPromises = tx.vout.map((output) => {
      return this.parser.parseOutput(this.currentBlock, tx, output)
        .then((addresses) => {
          if (this.log > 2) console.log('iterateOutputs. addresses: ' + JSON.stringify(addresses))
          let addressPromises = addresses.map((address) => {
            if (address.isDefined()) {
              return this.persistAddress(address)
                .then(() => Promise.resolve(tx))
                .catch((err) => Promise.reject(err))
            }
            return Promise.resolve()
          })
          return Promise.all(addressPromises)
            .then(() => Promise.resolve(tx))
        })
    })
    return Promise.all(outputPromises)
      .then(() => Promise.resolve(tx))
  }

  persistAddress (addressObj) {
    return this.db.findAddress(addressObj.address)
      .then((persistedAddress) => {
        if (persistedAddress.isDefined()) {
          if (this.log > 2) console.log('Updating address: ' + persistedAddress.address)
          return persistedAddress.update(addressObj)
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
