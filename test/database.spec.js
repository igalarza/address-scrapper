
const fs = require('fs')
const Database = require('../src/database')

const dbLocation = 'test/test.db'

describe("Database object test suite", function() {

  afterEach(function() {
    // Clean up
    fs.unlinkSync(dbLocation)
    fs.unlinkSync(dbLocation + '.0')
    fs.unlinkSync(dbLocation + '.1')
  });

  it('checks if the database inits properly (integration test with lokijs)', function(done) {
    let database = new Database(0, dbLocation)

    database.init()
      .then((db) => {
        expect(db).toBeDefined()
        expect(fs.existsSync(dbLocation)).toBeTruthy()
        expect(fs.existsSync(dbLocation + '.0')).toBeTruthy()
        expect(fs.existsSync(dbLocation + '.1')).toBeTruthy()

        expect(db.getCollection('blocks')).toBeDefined()
        expect(db.getCollection('addresses')).toBeDefined()

        db.saveDatabase(function() {
          done()
        })
      })
  })
})
