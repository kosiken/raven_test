import { AppError, ErrorType } from "../../utils/AppErrors";
import { appConfig } from "../../config";
import { Database } from "../db";
import { FinovoModel, Model } from "./model";

export interface IWalletAccount {
    id?: number;
    balance_available: number;
    balance_ledger: number;
    balance_before:  number;
    wallet_id: number;
    meta: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
    currency: 'NGN' | 'USD';
}
class WalletAccount extends FinovoModel<IWalletAccount> {
    public save(): Promise<IWalletAccount> {
        throw new Error("Method not implemented.");
    }
    static table() {
        return 'wallet_accounts'
    }
    

    constructor(fields: IWalletAccount) {
        super(fields);
      }

      static async create(wallet_account: IWalletAccount): Promise<WalletAccount | null> {
        const database = Database.getInstance();
  
        const query = await database.db!.insert({...wallet_account, created_at: new Date(), updated_at: new Date()})
        .into(WalletAccount.table())
        .onConflict('wallet_id')
        .ignore();
    
        if(!query || query[0] == 0) {
            throw new AppError(ErrorType.EXISTS, new Error('user already exitsts'))
        }
        
    
        const created = await WalletAccount.getOne({id: query[0]});
    
        return created;
        
      }
      public static async find (columns: Record<string, any>, match = true) {
        const database = Database.getInstance();
        
        let ans: WalletAccount[];
        let query: IWalletAccount[] = [];
        if(!match) {
            query = await database.db!(WalletAccount.table()).whereNot(columns).select<IWalletAccount[], IWalletAccount[]>()
        }
        else 
       {  query= await database.db!(WalletAccount.table()).where(columns).select<IWalletAccount[], IWalletAccount[]>();}
        if(!query) {
            ans = [];
        }
       
        ans = query.map(v => new WalletAccount(v))

        return ans;
      };
 
      public static async getOne (columns: Record<string, any>) {
        const database = Database.getInstance();
    
        let ans: WalletAccount | null;
        const query = await database.db!(WalletAccount.table()).where(columns).first<IWalletAccount>();
        if(!query) {
            ans = null;
        }
       else  ans = new WalletAccount(query);

        
        return ans;
      };
      
}

export default WalletAccount;
