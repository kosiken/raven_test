import { Database } from "../db";
import { IUser } from "./User";
import { v4 as uuid } from "uuid";
import { AppError, ErrorType } from "../../utils/AppErrors";
import { Model } from "./model";

export interface ITransaction {
    reference: string;
    narration?: string;
    provider_reference?: string;
    user_id: string | Omit<IUser, "password">;
    amount: number;
    balance_before?: number;
    balance_after?: number;
    metaData?: Record<string, any>;
    status: 'PENDING' | 'FAILED' | 'SUCCESSFULL';
    type: 'DEPOSIT' | 'WITHDRAWAL';
    created_at?: Date;
    updated_at?: Date;
    id?: number;

  }
  

export class Transaction extends Model {
    public reference: string;
    public narration?: string;
    public provider_reference?: string;
    public user_id: Omit<IUser, "password">
    public amount: number;
    public balance_before?: number;
    public balance_after?: number;
    public metaData:  Record<string, any>;
    public status: ITransaction['status'];
    public type: ITransaction['type'];
    public id?: number;
    public created_at?: Date;
    public updated_at?: Date;
  

    constructor(transactionObj: ITransaction) {
        super();
        this.narration = transactionObj.narration;
        this.reference = transactionObj.reference;
        this.user_id = transactionObj.user_id as Omit<IUser, "password">;
        this.amount = transactionObj.amount;
        this.balance_after = transactionObj.balance_after;
        this.balance_before = transactionObj.balance_before;
        this.metaData = transactionObj.metaData || {};
        this.status = transactionObj.status;
        this.type  = transactionObj.type;
        this.created_at = transactionObj.created_at!;
        this.updated_at = transactionObj.updated_at!;
    }

    static async create(transactionObj: ITransaction) {
        const database = Database.getInstance();
    
        
        const query = await database
          .db!.insert(transactionObj)
          .into("transactions")
          .onConflict('reference')
          .ignore()
    
        if (!query || query[0] == 0) {
          throw new AppError(
            ErrorType.INTERNAL_ERROR,
            new Error("Failed to register transaction")
          );
        }
    
        console.log(query);
    
        const created = await Transaction.getOne({
          reference: transactionObj.reference,
        });
    
        if (created) {
          return new Transaction(created);
        } else throw new AppError(ErrorType.INTERNAL_ERROR);
      }

      static async getOne(columns: Record<string, any>) {
        const database = Database.getInstance();
        const query = database.db!("transactions")
          .where(columns)
          .first<ITransaction>();
        return (await query) as any as ITransaction;
      }
    
      static async deleteAll() {
        const database = Database.getInstance();
        const query = database.db!("transactions").where({}).del();
        return (await query);
      }

  
      static async update(columns: Record<string, any>, where: Record<string,any>) {
        const database = Database.getInstance();
        const query = database.db!("transactions")
        .where(where)
        .update({...columns, updated_at: new Date()})
        return (await query);
      }

      static async findAll(columns: Record<string, any>, page: number = 1, limit = 50) {
        const database = Database.getInstance();
        if(page < 0) {
            page = 1
        }
        const queryTotal = database.db!<ITransaction>("transactions").where(columns).count({id: '*'})
        const total = (await queryTotal)[0].id as number;
     
        let payload: Transaction[] = [];
        if(total > 0){
        const query = database.db!<ITransaction>("transactions")
        .where(columns)
        .limit(limit)
        .offset((page - 1) * limit)
        const result = await query;
        payload = result.map( r => new Transaction(r))
}
        let rows =
        total >= limit ? Math.ceil(total / limit) : payload.length === 0 ? 0 : 1;

        
        
        
        return  {
            rows,
            page,
            size: payload.length,
            total,
            payload,
          };
      }
}