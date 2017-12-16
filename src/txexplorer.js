
function iterateTransactions (rpc, collection, txArray, currentTx) {
  return new Promise((resolve, reject) => {
    if (currentTx >= txArray.length) {
      console.log('All transactions explored.')
      resolve()
    } else {
      console.log('iterateTransactions. currentTx (' + currentTx + '): ' + txArray[currentTx])
      getTransactionInfo(rpc, txArray[currentTx])
        .then((info) => iterateOutputs(collection, info.vout))
        .then(() => iterateTransactions(rpc, collection, txArray, ++currentTx))
        .then(() => resolve())
        .catch((err) => reject(err))
    }
  })
}

function iterateOutputs (collection, outputArray) {
  return new Promise((resolve, reject) => {
    outputArray.map((output) => {
      let addresses = output.scriptPubKey.addresses
      console.log('iterateOutputs. addresses: ' + addresses)
      addresses.map((address) => persistAddress(collection, address))
    })
    resolve()
  })
}

function persistAddress (collection, address) {
  let persistedAddress = collection.by('address', address);
  if (typeof persistedAddress === 'undefined') {
    collection.insert({address})
  } else {
    // TODO Update address object
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
