
const Address = require('./model/address')
const Utxo = require('./model/utxo')

class AddressParser {

  constructor (logLevel, utxoset) {
    this.log = logLevel
    this.utxoSet = utxoset
  }

  parseOutput (blockHeight, tx, output) {
    if (this.log > 2) console.log('parseOutput: ' + JSON.stringify(output))
    if (typeof output.scriptPubKey.addresses === 'undefined') {
      return []
    } else {
      return output.scriptPubKey.addresses.map((address) => {
        this.updateUtxoSet(tx, output, address)
        return new Address(address, blockHeight, output.value, 0, [tx.txid], [])
      })
    }
  }

  parseInput (blockHeight, tx, input) {
    if (this.log > 2) console.log('parseInput: ' + JSON.stringify(input))
    let utxo = this.utxoSet.by('txid', input.txid)
    if (typeof utxo === 'undefined') {
      console.log('utxo not found for this transaction id: ' + input.txid)
      process.kill(process.pid, 'SIGINT')
    }
    let utxoObject = utxo.outputs[input.vout]
    this.checkUtxoSet(utxoObject)

    if (this.log > 3) console.log('utxo: ' + JSON.stringify(utxo))

    let addressObject = new Address(utxoObject.address, blockHeight, 0, utxoObject.value, [], [input.scriptSig.hex])
    if (this.log > 3) console.log('addressObject: ' + JSON.stringify(addressObject))
    utxo.outputs[input.vout].spent = true
    this.utxoSet.update(utxo)
    this.pruneUtxoSet(utxo)
    return addressObject
  }

  pruneUtxoSet (utxo) {
    let allSpent = utxo.outputs.reduce((acc, current) => current.spent && acc, true)
    if (allSpent) {
      this.utxoSet.remove(utxo)
    }
  }

  checkUtxoSet (utxoObject) {
    if (typeof utxoObject === 'undefined') {
      console.log('utxo not found! vout: ' + input.vout)
      console.log('tx utxo : ' + utxo)
      process.kill(process.pid, 'SIGINT')
    }
    if (utxoObject.spent === true) {
      console.log('utxo already spent?: ' + utxoObject)
      console.log(input)
      process.kill(process.pid, 'SIGINT')
    }
  }

  updateUtxoSet (tx, output, address) {
    let utxo = new Utxo(this.utxoSet.by('txid', tx.txid))
    if (utxo.isDefined()) {
      utxo.addOutput({
        value: output.value,
        address: address,
        spent: false
      })
      if (this.log > 2) console.log('update utxo: ' + JSON.stringify(utxo))
      this.utxoSet.update(utxo)

    } else {
      utxo = new Utxo({
        txid: tx.txid,
        outputs: [{
          value: output.value,
          address: address,
          spent: false
        }]
      })

      if (this.log > 2) console.log('new utxo: ' + JSON.stringify(utxo))
      this.utxoSet.insert(utxo)
    }
  }
}

module.exports = AddressParser
