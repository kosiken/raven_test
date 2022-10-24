import { Database } from "../db";
import { IUser } from "./User";
import { v4 as uuid } from "uuid";
import { AppError, ErrorType } from "../../utils/AppErrors";
import { Model } from "./model";
import knex from "knex";

export interface IBankAccount {
  bank_account_id: string;
  bank_account_name: string;
  user_id: string | Omit<IUser, "password">;
  bank_account_number: string;
  bank_balance: number;
  bank_name: string;
  created_at?: Date;
  updated_at?: Date;
  id?: number;
}

export class BankAccount extends Model {

  public bank_account_id: string;
  public bank_name: string;
  public id?: number;
  public bank_account_name: string;
  public user_id: Omit<IUser, "password">;
  public bank_account_number: string;
  public bank_balance: number;
  public created_at: Date;
  public updated_at: Date;

  constructor(account: IBankAccount) {
    super();
    this.bank_account_id = account.bank_account_id;
    this.user_id = account.user_id as Omit<IUser, "password">;
    this.bank_account_number = account.bank_account_number;
    this.bank_balance = account.bank_balance;
    this.created_at = account.created_at!;
    this.updated_at = account.updated_at!;
    this.bank_account_name = account.bank_account_name;
    this.bank_name = account.bank_name;
  }

  static async create(account: IBankAccount) {
    const database = Database.getInstance();

    account.bank_account_id = uuid();
    const query = await database
      .db!.insert(account)
      .into("bank_accounts")
      .onConflict('user_ud')
      .ignore()

    if (!query || query[0] == 0) {
      throw new AppError(
        ErrorType.EXISTS,
        new Error("User bank account already exists")
      );
    }



    const created = await BankAccount.getOne({
      bank_account_id: account.bank_account_id,
    });

    if (created) {
      return new BankAccount(created);
    } else throw new AppError(ErrorType.INTERNAL_ERROR);
  }

  static async getOne(columns: Record<string, any>) {
    const database = Database.getInstance();
    const query = database.db!("bank_accounts")
      .where(columns)
      .first<IBankAccount>();
    return (await query) as any as IBankAccount;
  }


  
  static async update(columns: Record<string, any>, where: Record<string,any>) {
    const database = Database.getInstance();
    const query = database.db!("bank_accounts")
    .where(where)
    .update({...columns, updated_at: new Date()})

   
    return (await query);
  }

    
  static async updateRaw(raw: string, where: Record<string,any>) {
    const database = Database.getInstance();
    const query = database.db!("bank_accounts")
    .update(database.db!.raw(raw))
    .where(where);
   
    return (await query);
  }



  static async deleteAll() {
    const database = Database.getInstance();
    const query = database.db!("bank_accounts").where({}).del();
    return (await query);
  }

}
