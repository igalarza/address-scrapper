

class TransactionExplorer {

  constructor (logLevel, rpc, collection) {
    this.log = logLevel
    this.rpc = rpc
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
          .then((info) => this.iterateOutputs(info.vout))
          .then(() => this.iterateTransactions(txArray, ++currentTx))
          .then(() => resolve())
          .catch((err) => reject(err))
      }
    })
  }

  iterateOutputs (outputArray) {
    return new Promise((resolve, reject) => {
      outputArray.map((output) => {
        let addresses = output.scriptPubKey.addresses
        if (this.log > 2) console.log('iterateOutputs. addresses: ' + addresses)
        addresses.map((address) => this.persistAddress(address))
      })
      resolve()
    })
  }

  persistAddress (address) {
    let persistedAddress = this.collection.by('address', address);
    if (typeof persistedAddress === 'undefined') {
      this.collection.insert({address})
    } else {
      // TODO Update address object
    }
  }

  getTransactionInfo (txId) {
    if (this.log > 2) console.log('getTransactionInfo. txId: ' + txId)
    return new Promise((resolve, reject) => {
      this.rpc.getRawTransaction(txId, 1, function (err, res) {
        if (err) {
          reject('Error: ' + err)
        } else {
          resolve(res.result)
        }
      })
    })
  }
}

module.exports = TransactionExplorer;
