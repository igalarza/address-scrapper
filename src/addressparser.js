
const bitcoinjs = require('bitcoinjs-lib')

class AddressParser {

  constructor (logLevel, utxoset) {
    this.log = logLevel
    this.utxoSet = utxoset
  }

  parseOutput (blockHeight, tx, output) {
    if (this.log > 2) console.log('parseOutput: ' + JSON.stringify(output))
    return output.scriptPubKey.addresses.map((address) => {
      this.updateUtxoSet(tx, output, address)
      return {
        address: address,
        firstSeen: blockHeight,
        lastSeen: blockHeight,
        received: output.value,
        spent: 0,
        unspent: output.value,
        txs: [tx.txid],
        signatures: []
      }
    })
  }

  parseInput (blockHeight, tx, input) {
    if (this.log > 2) console.log('parseInput: ' + JSON.stringify(input))
    let utxo = this.utxoSet.by('txid', input.txid)
    if (typeof utxo === 'undefined') {
      console.log('utxo not found for this transaction id: ' + input.txid)
      process.exit()
    }
    let utxoObject = utxo.outputs[input.vout]
    if (this.log > 3) console.log('utxo: ' + JSON.stringify(utxo))
    let addressObject = {
      address: utxoObject.address,
      firstSeen: blockHeight,
      lastSeen: blockHeight,
      received: 0,
      spent: utxoObject.value,
      unspent: 0,
      txs: [],
      signatures: [input.scriptSig.hex]
    }
    if (this.log > 3) console.log('addressObject: ' + JSON.stringify(addressObject))
    utxo.outputs[input.vout].spent = true
    // TODO Remove UTXO if all vouts are spent
    return addressObject
  }

  updateUtxoSet (tx, output, address) {
    let utxo = this.utxoSet.by('txid', tx.txid)
    if (typeof utxo === 'undefined') {
      utxo = {
        txid: tx.txid,
        outputs: [{
          value: output.value,
          address: address
        }]
      }
      if (this.log > 2) console.log('new utxo: ' + JSON.stringify(utxo))
      this.utxoSet.insert(utxo)
    } else {
      utxo.outputs.push({
        value: output.value,
        address: address
      })
      if (this.log > 2) console.log('update utxo: ' + JSON.stringify(utxo))
      this.utxoSet.update(utxo)
    }
  }
}

module.exports = AddressParser
