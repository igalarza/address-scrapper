
const Address = require('./model/address')
const Utxo = require('./model/utxo')
const promiseMap = require('./util/promiseMap')

class AddressParser {

  constructor (logLevel, db) {
    this.log = logLevel
    this.db = db
  }

  parseOutput (blockHeight, tx, output) {
    if (this.log > 2) console.log('parseOutput: ' + JSON.stringify(output))
    if (typeof output.scriptPubKey.addresses === 'undefined') {
      return Promise.resolve([])
    } else {
      return promiseMap(output.scriptPubKey.addresses, (address) => {
        return this.db.findAddress(address)
          .then((addressObj) => {
            return this.updateUtxoSet(tx, output, address)
              .then(() => Promise.resolve(new Address(address, blockHeight, output.value, 0, [tx.txid], [])))
          })
      })
    }
  }

  parseInput (blockHeight, tx, input) {
    if (this.log > 2) console.log('parseInput: ' + JSON.stringify(input))
    return this.db.findUtxo(input.txid)
      .then((utxo) => {
        if (!utxo.isDefined()) {
          console.log('utxo not found for this transaction id: ' + input.txid)
          process.kill(process.pid, 'SIGINT')
        }
        if (this.log > 3) console.log('utxo: ' + JSON.stringify(utxo))
        if (typeof utxo.outputs[input.vout] === 'undefined') {
          if (this.log > 1) console.log('utxo not found!')
          if (this.log > 1) console.log(blockHeight)
          if (this.log > 1) console.log(tx)
          if (this.log > 1) console.log(input)
          if (this.log > 1) console.log(utxo)
          process.kill(process.pid, 'SIGINT')
          return false
        }
        let utxoObject = utxo.outputs[input.vout]
        if (this.checkUtxoSet(utxoObject)) {
          let addressObject = new Address(utxoObject.address, blockHeight, 0, utxoObject.value, [], [input.scriptSig.hex])
          if (this.log > 3) console.log('addressObject: ' + JSON.stringify(addressObject))
          utxo.outputs[input.vout].spent = true
          return this.db.updateUtxo(utxo)
            .then(() => {
              this.pruneUtxoSet(utxo)
              return Promise.resolve(addressObject)
            })
            .catch((err) => Promise.reject(err))
        } else {
          if (this.log > 2) console.log('utxo not found for this transaction id: ' + input.txid)
          return Promise.resolve(Address.getInstance())
        }
      })
      .catch((err) => Promise.reject(err))
  }

  pruneUtxoSet (utxo) {
    let allSpent = utxo.outputs.reduce((acc, current) => current.spent && acc, true)
    if (allSpent) {
      if (this.log > 1) console.log('all outputs spent. txid: ' + utxo.txid)
      this.db.removeUtxo(utxo)
    }
  }

  checkUtxoSet (utxoObject) {
    if (utxoObject.spent === true) {
      if (this.log > 1) console.log('utxo already spent?: ' + JSON.stringify(utxoObject))
      return false

    } else {
      return true
    }
  }

  updateUtxoSet (tx, output, address) {
    return this.db.findUtxo(tx.txid)
      .then((utxo) => {
        if (utxo.isDefined()) {
          utxo.addOutput({
            value: output.value,
            address: address,
            spent: false
          })
          if (this.log > 2) console.log('update utxo: ' + JSON.stringify(utxo))
          return this.db.updateUtxo(utxo)

        } else {
          utxo = new Utxo(tx.txid, [{
            value: output.value,
            address: address,
            spent: false
          }])

          if (this.log > 2) console.log('new utxo: ' + JSON.stringify(utxo))
          return this.db.insertUtxo(utxo)
        }
      })
      .catch((err) => Promise.reject(err))
  }
}

module.exports = AddressParser
