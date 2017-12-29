
const BlockExplorer = require('./blockexplorer')

class ChainExplorer {

  constructor (logLevel, rpc, db) {
    this.log = logLevel
    this.rpc = rpc
    this.db = db
  }

  explore () {

    let addresses = this.db.getCollection('addresses')
    let allBlocksExplored = false
    let lastExploredBlock = this.getLastExploredBlock(addresses)
    if (this.log > 2) console.log('lastExploredBlock: ' + lastExploredBlock)

    let blockExplorer = new BlockExplorer({
      log: this.log,
      rpc: this.rpc,
      db: this.db
    })

    return this.getBlockCount()
        .then((blockCount) => blockExplorer.iterateBlocks(lastExploredBlock++, blockCount))
  }

  getLastExploredBlock (collection) {
    let lastExploredBlock = collection.max('lastSeen')
    if (Number.isInteger(lastExploredBlock)) {
      return lastExploredBlock
    } else {
      // First block
      return 1
    }
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
