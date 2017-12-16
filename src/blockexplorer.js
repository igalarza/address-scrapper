

function exploreBlockchain (rpc, db) {

  let blocks = db.getCollection('blocks')
  let allBlocksExplored = false
  let lastExploredBlock = blocks.count()
  console.log('lastExploredBlock: ' + lastExploredBlock)

  return getBlockCount(rpc)
      .then((blockCount) => iterateBlocks(rpc, db, ++lastExploredBlock, blockCount))
}

function iterateBlocks (rpc, db, currentBlock, blockCount) {
  return new Promise((resolve, reject) => {
    if (currentBlock >= blockCount) {
      resolve('All blocks explored.')
    } else {
      console.log('iterateBlocks. currentBlock: ' + currentBlock)
      getBlockInfo(rpc, currentBlock)
        .then((info) => persistBlock(db, info))
        .then((info) => iterateTransactions(rpc, db, info.tx, 0))
        .then(() => iterateBlocks(rpc, db, ++currentBlock, blockCount))
        .then(() => resolve())
        .catch((err) => reject(err))
    }
  })
}

function persistBlock (db, info) {
  db.getCollection('blocks').insert(info)
  return Promise.resolve(info)
}

function iterateTransactions (rpc, db, txArray, currentTx) {
  return new Promise((resolve, reject) => {
    if (currentTx >= txArray.length) {
      console.log('All transactions explored.')
      resolve()
    } else {
      console.log('iterateTransactions. currentTx: ' + txArray[currentTx])
      getTransactionInfo(rpc, txArray[currentTx])
        .then((info) => iterateOutputs(rpc, db, info.vout))
        .then(() => iterateTransactions(rpc, db, txArray, ++currentTx))
        .then(() => resolve())
        .catch((err) => reject(err))
    }
  })
}

function iterateOutputs (rpc, db, outputArray) {
  return new Promise((resolve, reject) => {
    outputArray.map((output) => {
      let addresses = output.scriptPubKey.addresses
      console.log('iterateOutputs. addresses: ' + addresses)
      addresses.map((address) => db.getCollection('addresses').insert({address}))
    })
    resolve()
  })
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


function getBlockCount (rpc) {
  console.log('getBlockCount')
  return new Promise((resolve, reject) => {
    rpc.getBlockCount(function (err, res) {
      if (err) {
        reject('Error: ' + err)
      } else {
        resolve(res.result)
      }
    })
  })
}


function getBlockInfo (rpc, height) {
  console.log('getBlockInfo. Height: ' + height)
  return new Promise((resolve, reject) => {
    getBlockHash(height)
      .then((hash) => {
        console.log('hash: ' + hash)
        getBlock(hash).then((info) => resolve(info))
      })
      .catch((err) => reject(err))
  })

  function getBlockHash (height) {
    console.log('getBlockHash')
    return new Promise((resolve, reject) => {
      rpc.getBlockHash(height, function (err, res) {
        if (err) {
          reject('Error: ' + err)
        } else {
          resolve(res.result)
        }
      })
    })
  }

  function getBlock (hash) {
    console.log('getBlock')
    return new Promise((resolve, reject) => {
      rpc.getBlock(hash, function (err, res) {
        if (err) {
          reject('Error: ' + err)
        } else {
          resolve(res.result)
        }
      })
    })
  }
}

module.exports = exploreBlockchain;
