
const BlockExplorer = require('./blockexplorer')

class ChainExplorer {

  constructor (logLevel, rpc, db) {
    this.log = logLevel
    this.rpc = rpc
    this.db = db
    this.blockExplorer = new BlockExplorer({
      log: this.log,
      rpc: this.rpc,
      db: this.db
    })
  }

  explore () {

    let allBlocksExplored = false
    let currentBlock = 1

    return this.db.getStatus('lastExploredBlock')
      .then((lastExploredBlock) => {
          if (lastExploredBlock !== null) {
            currentBlock = Number(lastExploredBlock)
          }
          if (this.log > 2) console.log('current block: ' + currentBlock)
          return Promise.resolve()
      })
      .then(() => this.getBlockCount())
      .then((blockCount) => this.blockExplorer.iterateBlocks(currentBlock++, blockCount))
      .then((response) => Promise.resolve(response))
      .catch((err) => Promise.reject(err))
  }

  stop () {
    this.blockExplorer.stop()
  }

  getBlockCount () {
    if (this.log > 2) console.log('getBlockCount')
    return new Promise((resolve, reject) => {
      this.rpc.getBlockCount(function (err, res) {
        if (err) {
          reject('Error: ' + err)
        } else {
          resolve(res.result)
        }
      })
    })
  }
}

module.exports = ChainExplorer;
