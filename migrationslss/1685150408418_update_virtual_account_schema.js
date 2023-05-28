'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UpdateVirtualAccountSchema extends Schema {
  up () {
    this.alter('virtual_accounts', (table) => {
      // alter table
      table.date('expires_at').nullable().alter();
    })
  }

  down () {
    this.table('virtual_accounts', (table) => {
      // reverse alternations
      table.date('expires_at').notNullable().alter();
    })

  }
}

module.exports = UpdateVirtualAccountSchema
