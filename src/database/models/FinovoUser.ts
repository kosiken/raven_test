import { appConfig } from "../../config";
import { Database } from "../db";
import VirtualAccount, { IVirtualAccount } from "./VirtualAccount";
import Wallet from "./Wallet";
import WalletAccount, { IWalletAccount } from "./WalletAccount";
import { FinovoModel } from "./model";


export interface IUser {
    first_name: string;
    last_name: string;
    email: string;
    user_id: string;
    phone: string;
    id: number;
    meta: any;
  }

  class FinovoUser extends FinovoModel<IUser> {
      public save(): Promise<IUser> {
          throw new Error("Method not implemented.");
      }


     async wallet(): Promise<Wallet | null> {
        let wallet = await Wallet.getOne({
            owner_id: this.fields.id!
        })
        return wallet;


      }
      

      public static async getOne (columns: Record<string, any>) {
        const database = Database.getInstance();
     
        let ans: FinovoUser | null;
        const query = await database.db!("users").where(columns).first<IUser>();
        if(!query) {
            ans = null;
        }
       else ans = new FinovoUser(query);

        await database.closeDb();
        return ans;
      };
      public static async find (columns: Record<string, any>, match = true) {
        const database = Database.getInstance();
  
        let ans: FinovoUser[];
        let query: IUser[] = [];
        if(!match) {
            query = await database.db!("users").whereNot(columns).select<IUser[], IUser[]>()
        }
        else 
       {  query= await database.db!("users").where(columns).select<IUser[], IUser[]>();}
        if(!query) {
            ans = [];
        }
        
        ans = query.map(v => new FinovoUser(v))

        return ans;
      };
  }


  async function  getUsers() {

    const database = Database.getInstance();
    await database.setupDb(appConfig.default);
    const users = await FinovoUser.find({email: 'none'}, false);

    return users;
  }
async function getWallets() {

    const database = Database.getInstance();
    await database.setupDb(appConfig.default);
    const users = await getUsers();
    const wallets = await Promise.all(users.map(u => u.wallet()));
    return wallets
    
}

async function* createWalletAccounts() {
    const database = Database.getInstance();
    await database.setupDb(appConfig.default);

    const wallets =( await getWallets()).filter(w => {
        if(w) {
            return true
        }
        return false;
    }) as Wallet[];
    let i = 0;

    while(i < wallets.length) {
        const wallet = wallets[i];
        const wallet_accounts = await wallet.walletAcounts()
        let wallets_: any[] = []
        if(wallet_accounts.length < 2) {

            let to_create: IWalletAccount['currency'][] = ['NGN', 'USD']
            let c = 0;
            to_create = to_create.filter(c => {
                return !(wallet_accounts.map(w => w.currency).includes(c));
            })
            
            while(c < to_create.length) {
                const currency = to_create[c];
                const balance_available = currency === 'NGN' ?  parseFloat(wallet.balance) * 100 : 0;

                const wallet_account_payload: IWalletAccount = {
                    currency,
                    balance_available,
                    balance_before: 0,
                    balance_ledger: balance_available,
                    wallet_id: wallet.id,
                    meta: {},
                }
                c++;
                const created = await WalletAccount.create(wallet_account_payload);
                wallets_.push(created);
            }
        }

        i++;
        yield wallets_;
    }

}

async function* createVirtualAccounts() {

    const database = Database.getInstance();
    await database.setupDb(appConfig.default);
    const users = await FinovoUser.find({email: 'allisonkosy@gmail.com'}, false);
   
    let i = 0;
    while (i < users.length) {
        const user = users[i];
        const wallet = await users[i].wallet();
        if (!wallet || !users[i].meta.virtual_account) {
            i++;
            continue;
        }

        const virtual_account_ = users[i].meta.virtual_account;
        const virtual_account_payload: IVirtualAccount= {
            provider: 'flutterwave',
            provider_reference: virtual_account_.referece || virtual_account_.reference,
            meta: {
                note: virtual_account_.note
            },
            bank_code: virtual_account_.bank_code,
            account_number: virtual_account_.account_number,
            created_at: new Date(virtual_account_.ordered_at),
            order_reference: virtual_account_.order_reference,
            wallet_id: wallet!.id,
            bank_name: virtual_account_.bank_name,
            finovo_reference: `to_finovo_user.id=${user.id}`
        }
        if(!virtual_account_payload.bank_code) {
            virtual_account_payload.bank_code = '232';
        }
        const virtual_account = await VirtualAccount.create(virtual_account_payload)
        i++;
        
        yield virtual_account;
    }
     
}


// async function runWalletAccount () {
   
//     const request = [];
//     for await (const wallets of createWalletAccounts()) {
//       // Incrementing the total response length.
//       console.log(wallets);
//     }

//   };

async function run () {
   
    for await (const account of createVirtualAccounts()) {
      // Incrementing the total response length.
      console.log(account);
    }

  };
run().then((w) => {
   console.log(w);
   const database = Database.getInstance();
   database.closeDb()
}).catch(console.log)