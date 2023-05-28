import { appConfig } from "../../config";
import { Database } from "../db";
import WalletAccount from "./WalletAccount";
import { FinovoModel, Model } from "./model";

interface IWallet {
    id?: number;
    balance: string;
    owner_id: number;
    meta: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    owner: string;
}
class Wallet extends FinovoModel<IWallet> {
    public static table() {
        return 'wallets';
    };
    public save(): Promise<IWallet> {
        throw new Error("Method not implemented.");
    }

    

    constructor(fields: IWallet) {
        super(fields);
      }

      async walletAcounts(): Promise<WalletAccount[]> {
        let accounts = await WalletAccount.find({
            wallet_id: this.fields.id
        });

        return accounts;


      }

      public static async getOne (columns: Record<string, any>) {
        const database = Database.getInstance();
    
        let ans: Wallet | null;
        const query = await database.db!("wallets").where(columns).first<IWallet>();
        if(!query) {
            ans = null;
        }
       else  ans = new Wallet(query);

        
        return ans;
      };
      public static async find (columns: Record<string, any>, match = true) {
        return [];
      };
 
      
}

export default Wallet;