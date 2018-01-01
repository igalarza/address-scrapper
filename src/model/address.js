

class Address {

  constructor (addressObj) {
    if (typeof addressObj !== 'undefined') {
      this.address = addressObj.address
      this.firstSeen = addressObj.blockHeight
      this.lastSeen = addressObj.blockHeight
      this.received = Number(addressObj.received)
      this.spent = Number(addressObj.spent)
      this.unspent = Number(addressObj.received) - Number(addressObj.spent)
      this.txs = addressObj.txs
      this.signatures = addressObj.signatures
    }
  }

  isDefined () {
    return typeof this.address !== 'undefined'
  }

  update (addressObj) {
    this.lastSeen = addressObj.blockHeight
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
