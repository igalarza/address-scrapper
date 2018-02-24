
class Address {

  static getInstance (addressObj) {
    if (typeof addressObj !== 'undefined') {
      let address = new Address(
        addressObj.address,
        addressObj.lastSeen)

      address.firstSeen = addressObj.firstSeen
      return address
    } else {
      return new Address()
    }
  }

  constructor (address, blockHeight) {
    this.address = address
    this.firstSeen = blockHeight
    this.lastSeen = blockHeight
  }

  isDefined () {
    return typeof this.address !== 'undefined'
  }

  update (addressObj) {
    this.lastSeen = addressObj.lastSeen
  }
}

module.exports = Address
