import { NextFunction, Request, response, Response } from "express";
import * as passport from "passport";
import { BankAccount, IBankAccount, IUser, User } from "../../database/models";
import fetch from "node-fetch";
import * as qs from "qs";
import { ITransaction, Transaction } from "../../database/models/Transaction";
import { generateUuid } from "../../helpers";
import Logger from "../../utils/Logger";

export interface TransactionCreateRequest {
  account_number: string;
  account_name: string;
  bank: string;
  bank_code: string;
  isPermanent: boolean;
  amount: number;
  narration?: string;
  reference?: string;
}

export interface TransactionCreateResponse {
  email: string;
  trx_ref: string;
  merchant_ref: string;
  amount: number;
  bank: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  narration: string;
  fee: number;
  status: string;
  created_at: Date | string;
  id: number;
}
export interface  TransferCallbackResponse{
    merchant_ref: string;
    meta: any;
    trx_ref: string;
    secret: string;
    status: string;
    session_id: string;
    type: string;
    response: string;
}


export interface CollectionCallbackResponse {
    type: string;
    amount: number;
    session_id: string;
    account_number: string;
    source: any;
    secret: string;
}

function sanitizeQuery(query: Record<string, any>) {
    const validQueryParams = [
        'reference',
        'type',
        'status',
        'user_id'
    ]
    const ret: Record<string, any> = {};
    for(let key of validQueryParams) {
        if(query[key]) {
            ret[key] = query[key]
        }
    }
    console.log(ret);
    return ret;
}

async function initiateTransaction(transactionObj: TransactionCreateRequest) {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve<TransactionCreateResponse>({
      email: "allisonkosy@gmail.com",
      trx_ref: "202210232430AHHFHJE",
      merchant_ref: transactionObj.reference!,
      amount: transactionObj.amount,
      bank: transactionObj.bank,
      bank_code: transactionObj.bank_code,
      account_number: "0069471301",
      account_name: "Allison Kosisochukwu",
      narration: "narrate",
      fee: 10,
      status: "pending",
      created_at: "2022-10-23T23:30:04.811Z",
      id: 12250,
    });
  }
  const response = await fetch(
    "https://integrations.getravenbank.com/v1/transfers/create",
    {
      method: "POST",

      body: qs.stringify({ ...transactionObj, currency: "NGN" }),

      headers: {
        Authorization: `Bearer ${process.env.RAVE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const data = await (response.json() as Promise<{
    status: string;
    data: TransactionCreateResponse;
  }>);

  if (data.status === "fail") {
    Logger.logLevel.err(data);
    throw new Error("Failed to start transaction");
  }
  return data.data;
}


async function fetchTransactions(columns : Partial<ITransaction>, page: number, limit: number) {
    return Transaction.findAll(sanitizeQuery(columns), page, limit);
}


async function transferCallback(req: Request, res: Response) {
    const body = req.body as TransferCallbackResponse;
    const transaction = await Transaction.getOne({reference: body.merchant_ref});
    if(!transaction) {
        return res.status(404).json({
            status: 'error',
            message: 'failed to find transaction',
            data: {
                reference: body.merchant_ref,
                provider_reference: body.trx_ref,
                type: 'transfer',
                reason: 'INVALID_TRANSACTION_REF',
                meta: body.meta
            }
        })
    }
    if(transaction.status != 'FAILED') {
        let bankAccount = await BankAccount.getOne({user_id: transaction.user_id});
        if(!bankAccount) {
            return res.status(500).json({
                status: 'error',
                message: 'failed to find a valid bank account',
                data: {
                    reference: body.merchant_ref,
                    provider_reference: body.trx_ref,
                    type: 'transfer',
                    reason: 'INVALID_BANK_ACCOUNT',
                    amount: body.meta.amount,
                    meta: body.meta
                }
            })
        }

        if(body.status === 'successful') {
            await Transaction.update({status: 'SUCCESSFULL'}, {reference: body.merchant_ref})
           
        }
        else if(body.status === 'failed' || body.status === 'failure') {
            
            await Transaction.update({status: 'FAILED', metaData: JSON.stringify(body.meta), provider_reference: body.trx_ref}, {reference: body.merchant_ref,});
            bankAccount = await BankAccount.getOne({user_id: transaction.user_id});
            await BankAccount.update({bank_balance: bankAccount.bank_balance + transaction.amount}, {bank_account_id: bankAccount.bank_account_id})

        }
        else {
            Logger.logLevel.debug('ignored ' + body.status)
        }

        return res.status(200).send('');
    }
}

async function collectionCallBack(req: Request, res: Response) {

    const body = req.body as CollectionCallbackResponse;

    let bankAccount = await BankAccount.getOne({bank_account_number: body.account_number})
    if(!bankAccount) {
        return res.status(500).json({
            status: 'error',
            message: 'failed to find a valid bank account',
            data: {
                reference: 'none',
                provider_reference: 'none',
                type: 'collection',
                reason: 'INVALID_BANK_ACCOUNT',
                amount: body.amount,
                meta: {
                    account_number: body.account_number
                }
            }
        })
    }
    const transactionObj: ITransaction = {
            reference: generateUuid(),
            user_id: bankAccount.user_id,
            balance_before: bankAccount.bank_balance,
            balance_after: bankAccount.bank_balance + body.amount,
            amount: body.amount,
            status: 'SUCCESSFULL',
            type: 'DEPOSIT',
            metaData: JSON.stringify(body.source) as any,
    }


    try {
    bankAccount = await BankAccount.getOne({bank_account_id: bankAccount.bank_account_id});
    await BankAccount.update({bank_balance: bankAccount.bank_balance + transactionObj.amount!}, {bank_account_id: bankAccount.bank_account_id})
    transactionObj.balance_before = bankAccount.bank_balance;
    transactionObj.balance_after = bankAccount.bank_balance + transactionObj.amount!;
    await Transaction.create(transactionObj);
    res.status(200).send('');
    } catch(err) {
        Logger.logLevel.err(err);
        res.status(500).send('');
    }
}

export async function initTransaction(req: Request, res: Response) {
  try {
    const user = await User.getOne({ user_id: res.locals.user.user_id });
    const body = req.body as TransactionCreateRequest;
    if (!user) {
      return res.status(500).json({
        status: "error",
        message: "Failed to find user in session",
      });
    }

    const amount = body.amount;

   let account = await BankAccount.getOne({ user_id: user.user_id });

    if (account.bank_balance < amount + 10) {
      return res.status(400).json({
        status: "error",
        message: "Insufficient funds",
      });
    }

    const transferRequest = await initiateTransaction({
      ...body,
      reference: generateUuid(),
    });

    const transactionObj: ITransaction = {
      reference: transferRequest.merchant_ref,
      provider_reference: transferRequest.trx_ref,
      amount: transferRequest.amount + 10,
      user_id: user.user_id,
      narration: transferRequest.narration,
      status: "PENDING",
      created_at: new Date(transferRequest.created_at),
      balance_before: account.bank_balance,
      balance_after: account.bank_balance - (amount + 10),
      type: "WITHDRAWAL",
    };
     account = await BankAccount.getOne({ user_id: user.user_id });
     await BankAccount.update({bank_balance: account.bank_balance - transactionObj.amount},
      { bank_account_id: account.bank_account_id }
    );
    
     transactionObj.balance_after = account.bank_balance - transactionObj.amount;
     transactionObj.balance_before = account.bank_balance;
    const transaction = await Transaction.create(transactionObj);
    return res.status(201).json({
      status: "success",
      message: "initiate_transaction",
      data: transaction,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: (err as any).message || "An error occurred",
      data: (err as any).data,
    });
  }
}


export async function getDeposits(req: Request, res: Response) {
try {
    let page = parseInt(req.query!.page! as string);
    let limit = 50;

    let limitString = req.query.limit as string;
    if (limitString) {
      limit = parseInt(limitString);
      if (isNaN(limit) || limit < 1) {
        Logger.logLevel.err("No valid limit parameter");
        // page = 1;
        limit = 50;
      }
    }
    if (isNaN(page) || page < 1) {
      Logger.logLevel.err("No valid page parameter");
      page = 1;
    }

    const data = await fetchTransactions({type: 'DEPOSIT',  user_id: res.locals.user.user_id }, page, limit)

    return res.status(200).json({
        status: "success",
        message: "get_all_deposits",
        data,
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: (err as any).message || "An error occurred",
        data: (err as any).data,
      });
    }


}

export async function getWithdrawals(req: Request, res: Response) {
    try {
        let page = parseInt(req.query!.page! as string);
        let limit = 50;
    
        let limitString = req.query.limit;
        if (limitString) {
          limit = parseInt(limitString as string);
          if (isNaN(limit) || limit < 1) {
            Logger.logLevel.err("No valid limit parameter");
            // page = 1;
            limit = 50;
          }
        }
        if (isNaN(page) || page < 1) {
          Logger.logLevel.err("No valid page parameter");
          page = 1;
        }
    
        const data = await fetchTransactions({type: 'WITHDRAWAL',  user_id: res.locals.user.user_id }, page, limit)
    
        return res.status(200).json({
            status: "success",
            message: "get_all_transactions",
            data,
          });
        } catch (err) {
          return res.status(500).json({
            status: "error",
            message: (err as any).message || "An error occurred",
            data: (err as any).data,
          });
        }
    
    
    }


export async function getAllTransactions(req: Request, res: Response) {
    try {
        const {page: pageParam, limit: limitParam, ...others} = req.query
        let page = parseInt(pageParam as string);
        let limit = 50;
    
        let limitString = limitParam as string;
        if (limitString) {
          limit = parseInt(limitString);
          if (isNaN(limit) || limit < 1) {
            Logger.logLevel.err("No valid limit parameter");
            // page = 1;
            limit = 50;
          }
        }
        if (isNaN(page) || page < 1) {
          Logger.logLevel.err("No valid page parameter");
          page = 1;
        }

        console.log(others)
    
        const data = await fetchTransactions({...others,  user_id: res.locals.user.user_id }, page, limit)
    
        return res.status(200).json({
            status: "success",
            message: "get_all_withdrawals",
            data,
          });
        } catch (err) {
          return res.status(500).json({
            status: "error",
            message: (err as any).message || "An error occurred",
            data: (err as any).data,
          });
        }
    
    
    }

    export async function transactionWebHook(req: Request, res: Response) {
        if(req.body.secret !== process.env.TRX_SECRET) {
            return res.status(400).send();
        }
        if(req.body.type === 'transfer') {
            return transferCallback(req, res);
        }

        else if(req.body.type === 'collection') {
            return collectionCallBack(req, res);
        }
        else return res.status(404).send();
    }