

class TransactionExplorer {

  constructor (logLevel, rpc, currentBlock, collection) {
    this.log = logLevel
    this.rpc = rpc
    this.currentBlock = currentBlock
    this.collection = collection
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
          .then(() => this.iterateTransactions(txArray, ++currentTx))
          .then(() => resolve())
          .catch((err) => reject(err))
      }
    })
  }

  iterateOutputs (tx) {
    return new Promise((resolve, reject) => {
      tx.vout.map((output) => {
        let addresses = this.parseOutput(tx, output)
        if (this.log > 3) console.log(addresses)
        if (this.log > 2) console.log('iterateOutputs. addresses: ' + addresses)
        addresses.map((address) => this.persistAddress(address))
      })
      resolve()
    })
  }

  parseOutput (tx, output) {
    return output.scriptPubKey.addresses.map((address) => {
      return {
        address: address,
        firstSeen: this.currentBlock,
        lastSeen: this.currentBlock,
        value: output.value,
        txs: [tx.txid]
      }
    })
  }

  persistAddress (addressObj) {
    let persistedAddress = this.collection.by('address', addressObj.address)
    if (typeof persistedAddress === 'undefined') {
      if (this.log > 1) console.log('Inserted new address: ' + addressObj.address)
      this.collection.insert(addressObj)
    } else {
      persistedAddress.value += addressObj.value
      persistedAddress.txs = persistedAddress.txs.concat(addressObj.txs)
      persistedAddress.lastSeen = addressObj.lastSeen
      if (this.log > 1) console.log('Address updated: ' + persistedAddress.address)
      this.collection.update(persistedAddress)
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
          if (that.log > 3) console.log(res.result)
          resolve(res.result)
        }
      })
    })
  }
}

module.exports = TransactionExplorer;
