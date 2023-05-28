'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UpdateTierSchema extends Schema {
  up() {
    this.alter('tiers', table => {
      // alter table
      table.bigInteger('max-daily-transactions').default(1000000);
      table.integer('max-daily-transactions-count').default(5);
      // table.string('allow_use').defaultTo('all')
    });
  }

  down() {
    this.table('tiers', table => {
      // reverse alternations
     
    });
  }
}

module.exports = UpdateTierSchema
