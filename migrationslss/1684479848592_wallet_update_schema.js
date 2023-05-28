'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WalletUpdateSchema extends Schema {
  up () {
    this.alter('wallet_accounts', (table) => {
      // table.dropUnique('wallet_id');
    })
  }

  down () {
   
  }
}

module.exports = WalletUpdateSchema
