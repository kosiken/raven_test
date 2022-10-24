import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable('bank_accounts', function (table) {
        table.primary(['id', 'bank_account_id']);
        table.increments('id')
        table.string('bank_account_name', 255).notNullable();
        table.string('bank_name', 255).notNullable();
        table.string('bank_account_number', 255).notNullable();
        table.string('bank_account_id',255 ).notNullable().unique();
        table.double('bank_balance').defaultTo(0);
        table.dateTime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.dateTime('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.string('user_id', 255).notNullable().unique();
        table.foreign('user_id').references('users.user_id').onDelete('CASCADE');

    })
}


export async function down(knex: Knex): Promise<void> {
}

