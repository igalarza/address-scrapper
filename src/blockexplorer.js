
const iterateTransactions = require('./txexplorer')

function iterateBlocks (rpc, db, currentBlock, blockCount) {
  return new Promise((resolve, reject) => {
    if (currentBlock >= blockCount) {
      resolve('All blocks explored.')
    } else {
      console.log('iterateBlocks. currentBlock: ' + currentBlock)
      let addresses = db.getCollection('addresses')
      getBlockInfo(rpc, currentBlock)
        .then((info) => persistBlock(db, info))
        .then((info) => iterateTransactions(rpc, addresses, info.tx, 0))
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

module.exports = iterateBlocks;
