'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UpdateTierSchema extends Schema {
  up () {
    this.table('update_tiers', (table) => {
      // alter table
    })
  }

  down () {
    this.table('update_tiers', (table) => {
      // reverse alternations
    })
  }
}

module.exports = UpdateTierSchema
