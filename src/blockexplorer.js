
const TransactionExplorer = require('./txexplorer')

class BlockExplorer {

  constructor (config) {
    this.log = config.log
    this.rpc = config.rpc
    this.db = config.db
  }

  iterateBlocks (currentBlock, blockCount) {
    return new Promise((resolve, reject) => {

      if (currentBlock >= blockCount) {
        resolve('All blocks explored.')
      } else {

        if (this.log > 1) console.log('iterateBlocks. currentBlock: ' + currentBlock)
        let txExplorer = new TransactionExplorer(this.log, this.rpc, currentBlock, this.db)

        this.getBlockInfo(currentBlock)
          .then((info) => txExplorer.iterateTransactions(info.tx, 0))
          .then(() => this.iterateBlocks(++currentBlock, blockCount))
          .then(() => resolve())
          .catch((err) => reject(err))
      }
    })
  }

  getBlockInfo (height) {
    if (this.log > 2) console.log('getBlockInfo. Height: ' + height)
    return new Promise((resolve, reject) => {
      this.getBlockHash(height)
        .then((hash) => {
          if (this.log > 2) console.log('hash: ' + hash)
          this.getBlock(hash).then((info) => resolve(info))
        })
        .catch((err) => reject(err))
    })
  }

  getBlockHash (height) {
    if (this.log > 2) console.log('getBlockHash')
    return new Promise((resolve, reject) => {
      this.rpc.getBlockHash(height, function (err, res) {
        if (err) {
          reject('Error: ' + err)
        } else {
          resolve(res.result)
        }
      })
    })
  }

  getBlock (hash) {
    if (this.log > 2) console.log('getBlock')
    return new Promise((resolve, reject) => {
      this.rpc.getBlock(hash, function (err, res) {
        if (err) {
          reject('Error: ' + err)
        } else {
          resolve(res.result)
        }
      })
    })
  }
}

module.exports = BlockExplorer;
