
const Address = require('./model/address')
const Utxo = require('./model/utxo')

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
      let addressPromises = output.scriptPubKey.addresses.map((address) => {
        return this.db.findAddress(address)
          .then((addressObj) => {
            if (addressObj.isDefined() && addressObj.txs.includes(tx.txid)) {
              if (this.log > 1) console.log('output already parsed!')
              return Promise.resolve(Address.getInstance())
            } else {
              return this.updateUtxoSet(tx, output, address)
                .then(() => Promise.resolve(new Address(address, blockHeight, output.value, 0, [tx.txid], [])))
            }
          })
      })
      return Promise.all(addressPromises)
    }
  }

  parseInput (blockHeight, tx, input) {
    if (this.log > 2) console.log('parseInput: ' + JSON.stringify(input))
    return this.db.findUtxo(input.txid)
      .then((utxo) => {
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
        return this.db.updateUtxo(utxo)
          .then(() => {
            this.pruneUtxoSet(utxo)
            return Promise.resolve(addressObject)
          })
          .catch((err) => Promise.reject(err))
      })
      .catch((err) => Promise.reject(err))
  }

  pruneUtxoSet (utxo) {
    let allSpent = utxo.outputs.reduce((acc, current) => current.spent && acc, true)
    if (allSpent) {
      this.db.removeUtxo(utxo)
    }
  }

  checkUtxoSet (utxoObject) {
    if (typeof utxoObject === 'undefined') {
      console.log('utxo not found! vout: ' + input.vout)
      console.log('tx utxo : ' + utxo)
      process.kill(process.pid, 'SIGINT')

    } else if (utxoObject.spent === true) {
      console.log('utxo already spent?: ' + utxoObject)
      console.log(input)
      process.kill(process.pid, 'SIGINT')
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
