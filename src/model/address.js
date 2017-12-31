

class Address {

  constructor (addressObj) {
    if (typeof addressObj !== 'undefined') {
      this._address = addressObj.address
      this._firstSeen = addressObj.blockHeight
      this._lastSeen = addressObj.blockHeight
      this._received = Number(addressObj.received)
      this._spent = Number(addressObj.spent)
      this._unspent = Number(addressObj.received) - Number(addressObj.spent)
      this._txs = addressObj.txs
      this._signatures = addressObj.signatures
    }
  }

  isDefined () {
    return typeof this.address !== 'undefined'
  }

  update (addressObj) {
    this._lastSeen = addressObj.blockHeight
    this._received = round(Number(this.received) + Number(addressObj.received), 6)
    this._spent = round(Number(this.spent) + Number(addressObj.spent), 6)
    this._unspent = round(Number(this.unspent) - Number(addressObj.spent), 6)
    this._txs = this.txs.concat(addressObj.txs)
    this._signatures = this.signatures.concat(addressObj.signatures)
  }

  get address () { return this._address }
  get firstSeen () { return this._firstSeen }
  get lastSeen () { return this._lastSeen }
  get received () { return this._received }
  get spent () { return this._spent }
  get unspent () { return this._unspent }
  get txs () { return this._txs }
  get signatures () { return this._signatures }
}

function round (value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}

module.exports = Address
