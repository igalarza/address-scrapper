
const Address = require('../../src/model/address')

describe("Address object test suite", function() {

  let data1 = {
    address: 'test',
    blockHeight: 1,
    received: 10928346.982734,
    spent: 324.874650,
    txs: ['tx1','tx2'],
    signatures: ['sig1']
  }

  let data2 = {
    address: 'test',
    blockHeight: 5,
    received: 0,
    spent: 10062310.342536,
    txs: ['tx3'],
    signatures: ['sig2','sig3','sig4']
  }

  it('checks constructor', function() {

    let addressObj = new Address(data1)

    expect(addressObj).toBeDefined()
    expect(addressObj.address).toBe('test')
    expect(addressObj.unspent).toBe(10928022.108084)
  })

  it('checks isDefined method', function() {
    let addressObj = new Address({})
    expect(addressObj.isDefined()).toBe(false)
  })

  it('checks update method', function() {

    let addressObj = new Address(data1)
    addressObj.update(data2)

    expect(addressObj.lastSeen).toBe(5)
    expect(addressObj.received).toBe(10928346.982734)
    expect(addressObj.spent).toBe(10062635.217186)
    expect(addressObj.unspent).toBe(865711.765548)
    expect(addressObj.txs.length).toBe(3)
    expect(addressObj.signatures.length).toBe(4)
  })
})
