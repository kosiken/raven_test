import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable('transactions',  function (table)  {
        table.primary(['id', 'reference']);
        table.increments('id')
        table.string('reference', 255).notNullable();
        table.string('provider_reference', 255).nullable();
        table.integer('amount').notNullable();
        table.integer('balance_before').nullable();
        table.integer('balance_after').nullable();
        table.string('user_id', 255).notNullable();
        table.json('metaData').notNullable();
        table.string('status', 255).notNullable();
        table.string('type', 255).notNullable();
        table.string('narration', 255).defaultTo('none')

        table.dateTime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.dateTime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.foreign('user_id').references('users.user_id').onDelete('CASCADE');


    })
}


export async function down(knex: Knex): Promise<void> {
}

