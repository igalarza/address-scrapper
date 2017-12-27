
const BlockExplorer = require('./blockexplorer')

class ChainExplorer {

  constructor (logLevel, rpc, db) {
    this.log = logLevel
    this.rpc = rpc
    this.db = db
  }

  explore () {

    let blocks = this.db.getCollection('blocks')
    let allBlocksExplored = false
    let lastExploredBlock = blocks.count()
    if (this.log > 2) console.log('lastExploredBlock: ' + lastExploredBlock)

    let blockExplorer = new BlockExplorer({
      log: this.log,
      rpc: this.rpc,
      db: this.db
    })

    return this.getBlockCount()
        .then((blockCount) => blockExplorer.iterateBlocks(++lastExploredBlock, blockCount))
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
