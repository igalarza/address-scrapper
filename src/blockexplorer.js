
const TransactionExplorer = require('./txexplorer')

class BlockExplorer {

  constructor (config) {
    this.log = config.log
    this.rpc = config.rpc
    this.db = config.db
    this.sigterm = false
  }

  iterateBlocks (currentBlock, blockCount) {
    return new Promise((resolve, reject) => {

      if (currentBlock >= blockCount) {
        resolve('All blocks explored.')
      } else {

        if (this.log > 1) console.log('iterateBlocks. currentBlock: ' + currentBlock)
        let txExplorer = new TransactionExplorer(this.log, this.rpc, currentBlock, this.db)

        return this.getBlockInfo(currentBlock)
          .then((info) => txExplorer.iterateTransactions(info.tx, 0))
          .then(() => this.db.setStatus('lastExploredBlock', (currentBlock + 1)))
          .then(() => {
            if (this.sigterm) {
              return Promise.reject('Closing gracefully')
            } else {
              return this.iterateBlocks(++currentBlock, blockCount)
            }
          })
          .then((response) => resolve(response))
          .catch((err) => reject(err))
      }
    })
  }

  stop () {
    this.sigterm = true
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
          reject('Error: ' + JSON.stringify(err))
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
          reject('Error: ' + JSON.stringify(err))
        } else {
          resolve(res.result)
        }
      })
    })
  }
}

module.exports = BlockExplorer;
