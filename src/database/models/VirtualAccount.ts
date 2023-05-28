import { AppError, ErrorType } from "../../utils/AppErrors";
import { appConfig } from "../../config";
import { Database } from "../db";
import { FinovoModel, Model } from "./model";

export interface IVirtualAccount {
    id?: number;
    provider: string;
    bank_code:string;
    account_number: string;
    expires_at?: Date;
    wallet_id: number;
    meta: Record<string, any>;
    created_at?: Date;
    bank_name: string;
    provider_reference: string;
    finovo_reference: string;
    order_reference: string;
}
class VirtualAccount extends FinovoModel<IVirtualAccount> {
    public save(): Promise<IVirtualAccount> {
        throw new Error("Method not implemented.");
    }
    static table() {
        return 'virtual_accounts'
    }
    

    constructor(fields: IVirtualAccount) {
        super(fields);
      }

      static async create(virtual_account: IVirtualAccount): Promise<VirtualAccount | null> {
        const database = Database.getInstance();
  
        const query = await database.db!.insert({ created_at: new Date(), updated_at: new Date(), ...virtual_account,})
        .into(VirtualAccount.table())
        .onConflict('finovo_reference')
        .ignore();
    
        if(!query || query[0] == 0) {
            throw new AppError(ErrorType.EXISTS, new Error('user already exitsts'))
        }
        
    
        const created = await VirtualAccount.getOne({id: query[0]});
    
        return created;
        
      }
      public static async find (columns: Record<string, any>, match = true) {
        const database = Database.getInstance();
        
        let ans: VirtualAccount[];
        let query: IVirtualAccount[] = [];
        if(!match) {
            query = await database.db!(VirtualAccount.table()).whereNot(columns).select<IVirtualAccount[], IVirtualAccount[]>()
        }
        else 
       {  query= await database.db!(VirtualAccount.table()).where(columns).select<IVirtualAccount[], IVirtualAccount[]>();}
        if(!query) {
            ans = [];
        }
       
        ans = query.map(v => new VirtualAccount(v))

        return ans;
      };
 
      public static async getOne (columns: Record<string, any>) {
        const database = Database.getInstance();
    
        let ans: VirtualAccount | null;
        const query = await database.db!(VirtualAccount.table()).where(columns).first<IVirtualAccount>();
        if(!query) {
            ans = null;
        }
       else  ans = new VirtualAccount(query);

        
        return ans;
      };
      
}

export default VirtualAccount;
