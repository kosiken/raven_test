import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable('users', function (table) {
        table.primary(['id', 'user_id']);
        table.increments('id')
        table.string('first_name', 255).notNullable();
        table.string('last_name', 255).notNullable();
        table.string('user_id',255 ).notNullable().unique();
        table.string('phone', 255).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('password', 255).notNullable();
        
    })
 
}


export async function down(knex: Knex): Promise<void> {
    knex.schema.dropTable('users');
}

