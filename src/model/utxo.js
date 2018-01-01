


class Utxo {

  static getInstance (utxoObj) {
    if (typeof utxoObj !== 'undefined') {
      return new Utxo(utxoObj.txid, utxoObj.outputs)
    } else {
      return null
    }
  }

  constructor (txid, outputs) {
    this.txid = txid
    this.outputs = outputs
  }

  isDefined () {
    return typeof this.txid !== 'undefined'
  }

  getOutput (vout) {
    if (typeof this.outputs[vout] !== 'undefined') {
      return this.outputs[vout]
    } else {
      throw 'this.outputs[vout] is not defined.'
    }
  }

  addOutput (output) {
    this.outputs.push(output)
  }

  isSpent () {
    return this.outputs.reduce((acc, current) => current.spent && acc, true)
  }
}

module.exports = Utxo