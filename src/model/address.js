

class Address {

  static getInstance (addressObj) {
    if (typeof addressObj !== 'undefined') {
      let address = new Address(
        addressObj.address,
        addressObj.lastSeen,
        addressObj.received,
        addressObj.spent,
        addressObj.txs,
        addressObj.signatures)

      address.firstSeen = addressObj.firstSeen
      return address
    } else {
      return new Address()
    }
  }

  constructor (address, blockHeight, received, spent, txs = [], signatures = []) {
    this.address = address
    this.firstSeen = blockHeight
    this.lastSeen = blockHeight
    this.received = Number(received)
    this.spent = Number(spent)
    this.unspent = Number(received) - Number(spent)
    this.txs = txs
    this.signatures = signatures
  }

  isDefined () {
    return typeof this.address !== 'undefined'
  }

  update (addressObj) {
    this.lastSeen = addressObj.lastSeen
    this.received = round(Number(this.received) + Number(addressObj.received), 6)
    this.spent = round(Number(this.spent) + Number(addressObj.spent), 6)
    this.unspent = round(Number(this.unspent) - Number(addressObj.spent), 6)
    this.txs = this.txs.concat(addressObj.txs)
    this.signatures = this.signatures.concat(addressObj.signatures)
  }
}

function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

module.exports = Address
