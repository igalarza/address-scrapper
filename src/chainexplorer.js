
const iterateBlocks = require('./blockexplorer')

function exploreBlockchain (rpc, db) {

  let blocks = db.getCollection('blocks')
  let allBlocksExplored = false
  let lastExploredBlock = blocks.count()
  console.log('lastExploredBlock: ' + lastExploredBlock)

  return getBlockCount(rpc)
      .then((blockCount) => iterateBlocks(rpc, db, ++lastExploredBlock, blockCount))
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

module.exports = exploreBlockchain;
