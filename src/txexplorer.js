
const AddressParser = require('./addressparser')

class TransactionExplorer {

  constructor (logLevel, rpc, currentBlock, db) {
    this.log = logLevel
    this.rpc = rpc
    this.currentBlock = currentBlock
    this.addressList = db.getCollection('addresses')
    this.parser = new AddressParser(logLevel, db.getCollection('utxoset'))
  }

  iterateTransactions (txArray, currentTx) {
    return new Promise((resolve, reject) => {
      if (currentTx >= txArray.length) {
        if (this.log > 2) console.log('All transactions explored.')
        resolve()
      } else {
        if (this.log > 2) console.log('iterateTransactions. currentTx (' + currentTx + '): ' + txArray[currentTx])
        this.getTransactionInfo(txArray[currentTx])
          .then((info) => this.iterateInputs(info))
          .then((info) => this.iterateOutputs(info))
          .then(() => this.iterateTransactions(txArray, ++currentTx))
          .then(() => resolve())
          .catch((err) => reject(err))
      }
    })
  }

  iterateInputs (tx) {
    return new Promise((resolve, reject) => {
      tx.vin.map((input) => {
        if (typeof input.coinbase !== 'undefined') {
          resolve(tx)
        } else {
          let address = this.parser.parseInput(this.currentBlock, tx, input)
          if (this.log > 2) console.log('iterateInputs. addresses: ' + JSON.stringify(address))
          this.persistAddress(address)
        }
      })
      resolve(tx)
    })
  }

  iterateOutputs (tx) {
    return new Promise((resolve, reject) => {
      tx.vout.map((output) => {
        let addresses = this.parser.parseOutput(this.currentBlock, tx, output)
        if (this.log > 2) console.log('iterateOutputs. addresses: ' + JSON.stringify(addresses))
        addresses.map((address) => this.persistAddress(address))
      })
      resolve(tx)
    })
  }



  persistAddress (addressObj) {
    let persistedAddress = this.addressList.by('address', addressObj.address)
    if (typeof persistedAddress === 'undefined') {
      if (this.log > 1) console.log('Inserted new address: ' + JSON.stringify(addressObj))
      this.addressList.insert(addressObj)
    } else {
      if (this.log > 2) console.log('Updating address: ' + JSON.stringify(persistedAddress))
      if (this.log > 2) console.log('Updating address: ' + addressObj.address)
      persistedAddress.received += addressObj.received
      persistedAddress.spent += addressObj.spent
      persistedAddress.unspent = persistedAddress.received - persistedAddress.spent
      persistedAddress.txs = persistedAddress.txs.concat(addressObj.txs)
      persistedAddress.signatures = persistedAddress.signatures.concat(addressObj.signatures)
      persistedAddress.lastSeen = addressObj.lastSeen
      if (this.log > 1) console.log('Address updated: ' + JSON.stringify(persistedAddress))
      this.addressList.update(persistedAddress)
    }
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
