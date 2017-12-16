
function iterateTransactions (rpc, db, txArray, currentTx) {
  return new Promise((resolve, reject) => {
    if (currentTx >= txArray.length) {
      console.log('All transactions explored.')
      resolve()
    } else {
      console.log('iterateTransactions. currentTx (' + currentTx + '): ' + txArray[currentTx])
      getTransactionInfo(rpc, txArray[currentTx])
        .then((info) => iterateOutputs(db, info.vout))
        .then(() => iterateTransactions(rpc, db, txArray, ++currentTx))
        .then(() => resolve())
        .catch((err) => reject(err))
    }
  })
}

function iterateOutputs (db, outputArray) {
  return new Promise((resolve, reject) => {
    outputArray.map((output) => {
      let addresses = output.scriptPubKey.addresses
      console.log('iterateOutputs. addresses: ' + addresses)
      addresses.map((address) => persistAddress(db, address))
    })
    resolve()
  })
}

function persistAddress (db, address) {
  let collection = db.getCollection('addresses')
  console.log(collection.by('address', address))
  if (typeof collection.by('address', address) === 'undefined') {
    collection.insert({address})
  }
}

function getTransactionInfo (rpc, txId) {
  console.log('getTransactionInfo. txId: ' + txId)
  return new Promise((resolve, reject) => {
    rpc.getRawTransaction(txId, 1, function (err, res) {
      if (err) {
        reject('Error: ' + err)
      } else {
        resolve(res.result)
      }
    })
  })
}

module.exports = iterateTransactions;
