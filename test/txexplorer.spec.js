
const iterateTransactions = require('../src/txexplorer')
const mocks = require('./mocks')

describe("txexplorer test suite", function() {

  it("checks if iterateTransactions works with valid input", function(done) {

    let txArray = [
      '511c645d736c3e5fc25b8fc1a507da81285be6d3f09941d712ff0e870b0a78e0',
      '1b530f57a052db3a8a0987630ee2fe6643e9ae04302844ec91ff3580c52d671d',
      '787a0ed2a93932c5a30687b50d9d1b4a5de011cb23b5eb2194a642a1506c8119'
    ]
    let currentTx = 0

    iterateTransactions(mocks.rpc, mocks.collection, txArray, currentTx)
      .catch((err) => expect(err).toBe(true))
      .then(() => {
        expect(mocks.collection.length()).toBe(3)
        done()
      })
  })

  it("checks if iterateTransactions fails with invalid input", function(done) {

    let txArray = [
      'invalid-transaction-id',
    ]
    let currentTx = 0
    iterateTransactions(mocks.rpc, mocks.collection, txArray, currentTx)
      .catch((err) => expect(err).toBe('Error: mock transaction not found!'))
      .then(() => done())
  })
})
