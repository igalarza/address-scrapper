
const loki = require('lokijs')
const lfsa = require('lokijs/src/loki-fs-structured-adapter.js')

function initDatabase(dbLocation) {
  console.log('initDatabase')
  return new Promise((resolve, reject) => {

    let adapter = new lfsa()
    let db = new loki(dbLocation, {
      adapter : adapter,
      autoload: true,
      autoloadCallback: databaseInitialize,
      autosave: true,
      autosaveInterval: 4000
    })

    function databaseInitialize () {
      console.log('databaseInitialize')
      // Init addresses collection
      let addresses = db.getCollection('addresses')
      if (addresses == null) {
        db.addCollection('addresses', {unique: ['address']})
      }
      // Init blocks collection
      let blocks = db.getCollection('blocks')
      if (blocks == null) {
        db.addCollection('blocks')
      }
      resolve(db)
    }
  })
}

module.exports = initDatabase
