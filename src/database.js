
const Loki = require('lokijs')
const lfsa = require('lokijs/src/loki-fs-structured-adapter.js')

class Database {

  constructor (logLevel, dbLocation) {
    this.log = logLevel
    this.dbLocation = dbLocation
  }

  init () {
    if (this.log > 2) console.log('init database')

    return new Promise((resolve, reject) => {
      let adapter = new lfsa()
      let that = this
      this.db = new Loki(this.dbLocation, {
        adapter : adapter,
        autoload: true,
        autoloadCallback: initCallback,
        autosave: true,
        autosaveInterval: 4000
      })

      function initCallback () {
        if (that.log > 2)  console.log('init database callback')
        // Init addresses collection
        let addresses = that.db.getCollection('addresses')
        if (addresses == null) {
          that.db.addCollection('addresses', {unique: ['address']})
        }
        // Init blocks collection
        let blocks = that.db.getCollection('blocks')
        if (blocks == null) {
          that.db.addCollection('blocks')
        }
        that.db.saveDatabase(function() {
          resolve(that.db)
        })
      }
    })
  }
}

module.exports = Database
