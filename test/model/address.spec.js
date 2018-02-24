
const Address = require('../../src/model/address')

describe("Address object test suite", function() {

  let data1 = {
    address: 'test',
    firstSeen: 1,
    lastSeen: 1
  }

  let data2 = {
    address: 'test',
    firstSeen: 1,
    lastSeen: 5
  }

  it('checks constructor', function() {
    let addressObj = Address.getInstance(data1)
    expect(addressObj).toBeDefined()
    expect(addressObj.address).toBe('test')
  })

  it('checks isDefined method', function() {
    let addressObj = Address.getInstance({})
    expect(addressObj.isDefined()).toBe(false)
  })

  it('checks update method', function() {
    let addressObj = Address.getInstance(data1)
    addressObj.update(data2)
    expect(addressObj.lastSeen).toBe(5)
  })
})
