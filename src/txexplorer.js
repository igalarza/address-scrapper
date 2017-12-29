
const AddressParser = require('./addressparser')

class TransactionExplorer {

  constructor (logLevel, rpc, currentBlock, db) {
    this.log = logLevel
    this.rpc = rpc
    this.currentBlock = currentBlock
    this.addressList = db.getCollection('addresses')
    this.utxoSet = db.getCollection('utxoset')
    this.parser = new AddressParser(logLevel, this.utxoSet)
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
      if (this.log > 1) console.log('Inserted new address: ' + addressObj.address)
      this.addressList.insert(addressObj)
    } else {
      if (this.log > 2) console.log('Updating address: ' + persistedAddress.address)
      persistedAddress.lastSeen = addressObj.lastSeen
      persistedAddress.received = round(Number(persistedAddress.received) + Number(addressObj.received), 6)
      persistedAddress.spent = round(Number(persistedAddress.spent) + Number(addressObj.spent), 6)
      persistedAddress.unspent = round(Number(persistedAddress.received) - Number(persistedAddress.spent), 6)
      persistedAddress.txs = persistedAddress.txs.concat(addressObj.txs)
      persistedAddress.signatures = persistedAddress.signatures.concat(addressObj.signatures)
      if (this.log > 1) console.log('Address updated: ' + persistedAddress.address)
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

function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

module.exports = TransactionExplorer;
