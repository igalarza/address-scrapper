
const Utxo = require('../../src/model/utxo')

describe("Utxo object test suite", function() {

  let utxo = Utxo.getInstance({
    txid: 'testId',
    outputs: [{
      value: 5.234512,
      address: 'address1',
      spent: false
    }]
  })

  it('checks constructor', function() {

    expect(utxo).toBeDefined()
    expect(utxo.txid).toBe('testId')

    expect(utxo.outputs.length).toBe(1)
  })

  it('checks isDefined method', function() {

    expect(utxo.isDefined()).toBe(true)
  })

  it('checks getOutput method', function() {

    expect(utxo.getOutput(0)).toBeDefined()
    expect(() => utxo.getOutput(1)).toThrow('this.outputs[vout] is not defined.')
  })

  it('checks addOutput method', function() {
    utxo.addOutput({
      value: 5.234512,
      address: 'address2',
      spent: false
    })
    expect(utxo.outputs.length).toBe(2)
  })

  it('checks isSpent method', function() {
    expect(utxo.isSpent()).toBe(false)

    utxo.outputs.map((output) => output.spent = true)
    expect(utxo.isSpent()).toBe(true)
  })
})
