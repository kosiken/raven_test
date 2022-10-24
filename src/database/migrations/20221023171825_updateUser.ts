import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .alterTable('users', function (table) {
       table.dateTime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6))
       table.dateTime('logged_out_at');
        
    })
}


export async function down(knex: Knex): Promise<void> {
}

