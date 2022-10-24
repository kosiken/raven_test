import { BankAccount, ITransaction, IUser, Transaction, User } from "../src/database/models";
import  { generateUuid } from '../src/helpers'
import  * as jwt from 'jsonwebtoken';
export async function insertUser(user: Partial<IUser>) {
    const userObj: IUser = {
        first_name: 'Kosy',
        last_name: 'Allison',
        password: 'temp_password',
        email: 'allisonkosy@gmail.com',
        phone: '+2348146392214',
        user_id: generateUuid(),
        ...user,
    }

    return await User.create(userObj);
    
}

export async function createWebToken(user: Pick<IUser, 'email' | 'user_id'>) {
    
    const token = jwt.sign({ user , created_at: new Date() }, 'jwtSecret');
    return token;

}

export async function createBankAccont(user_id: string) {
   const bank = await BankAccount.create({
        bank_account_number: '100000000',
        bank_balance: 1000,
        user_id,
        bank_name: 'Test Bank',
        bank_account_name: 'Test Name',
        bank_account_id: generateUuid(),
    })

    return bank;
}


export async function createTransactions(user_id: string, count = 6) {
   let array =  new Array<number>(count).fill(0)
    .map<Promise<Transaction>>((v, i) => Transaction.create({
        type:  (['WITHDRAWAL', 'DEPOSIT'][i%2]) as any,
        balance_after: 1000,
        balance_before: 900,
        created_at: new Date(),
        narration: 'narrrate',
        amount: 10,
        reference: generateUuid(),
        user_id,
        status: (['PENDING', 'FAILED', 'SUCCESSFULL'][i % 3]) as any,


    }))

    return await Promise.all(array);
 }
 
export async function clearDb() {
    const models = [User.deleteAll(), BankAccount.deleteAll(), Transaction.deleteAll()]
   return await Promise.all(models)
}

export function transferWebHookMock(override: Record<string, any> ) {
    const body = JSON.parse(`{
        "merchant_ref": "my_ref",
        "meta": {
          "account_name": "Allison Kosisochukwu",
          "account_number": "0069471301",
          "narration": "narrate",
          "currency": "NGN",
          "amount": 10
        },
        "trx_ref": "202210232430AHHFHJE",
        "secret": "mysecret",
        "status": "successful",
        "session_id": "090405221024003009791842955740",
        "type": "transfer",
        "response": "Transfer successful"
      }`)

      return {...body, ...override}
}

export function collectionWebhook(override: Record<string, any>) {
    const body = JSON.parse(`{
        "type": "collection",
        "amount": 108,
        "session_id": "090267221024002440041004984328",
        "account_number": "7790289984",
        "source": {
          "account_number": "2004984328",
          "first_name": "ALLISON,",
          "last_name": "RHEMA",
          "narration": "NOTE",
          "bank": "KUDA MICROFINANCE BANK",
          "bank_code": "090267",
          "createdAt": "2022-10-23 23:26:59"
        },
        "secret": "mysecret"
      }`)

      return {...body, ...override}
}

export function delay(time = 500) {
    return new Promise(res => {
        setTimeout(() => {
            res('ok')
        }, 500);
    })
}