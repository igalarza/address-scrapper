


class Utxo {

  constructor (utxoObj) {
    if (typeof utxoObj !== 'undefined') {
      this._txid = utxoObj.txid;
      this._outputs = utxoObj.outputs
    }
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

  get txid () { return this._txid }
  get outputs () { return this._outputs }
}

module.exports = Utxo
