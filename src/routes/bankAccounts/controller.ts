import { NextFunction, Request, response, Response } from "express";
import * as passport from "passport";
import { BankAccount, IBankAccount, IUser, User } from "../../database/models";
import  fetch from 'node-fetch';

import { AppError, ErrorType } from "../../utils/AppErrors";
import * as qs from "qs";

export interface BankAccountCreateResponse {
  account_number: string;
  account_name: string;
  bank: string;
  customer: Partial<IUser>;
  isPermanent: boolean;
  amount: string;
}

async function generateAccount(user: IUser) {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve<BankAccountCreateResponse>({
      account_number: "7790289993",
      account_name: "Raven/Kosy - " + `${user.first_name} ${user.last_name}`,
      bank: "Wema Bank",
      customer: {
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
      },
      isPermanent: false,
      amount: process.env.TEST_DEFAULT_BALANCE || '100',
    });
  }
  const response = await fetch(
    "https://integrations.getravenbank.com/v1/pwbt/generate_account",
    {
      method: "POST",
      
      body:  qs.stringify({
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          amount: process.env.TEST_DEFAULT_BALANCE || '100',
          email: user.email,
        }),

        headers: {
            'Authorization': `Bearer ${process.env.RAVE_SECRET}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
  );
  const data =  await (response.json() as Promise<{data: BankAccountCreateResponse}>);
  return data.data;
}

export async function createBankAccount(req: Request, res: Response) {
  try {
    const user = await User.getOne({ user_id: res.locals.user.user_id });

    if (!user) {
      return res.status(500).json({
        status: 'failed',
        message: "Failed to find user in session",
      });
    }

    if (user.user_id !== req.body.user_id) {
      return res.status(400).json({
        message: "user_id doesn't match",
        status: 'error'
      });
    }
    const account = await generateAccount(user);
    const bankAccountObj: IBankAccount = {
      user_id: req.body.user_id,
      bank_account_name: account.account_name,
      bank_account_number: account.account_number,
      bank_account_id: "",
      bank_balance: parseInt(account.amount, 10),
      bank_name: account.bank,
    };

    const bankAccount = await BankAccount.create(bankAccountObj);
    return res.status(201).json({
      status: 'success',
      message: "create_bank_account",
      data: bankAccount!,
    });
  } catch (err) {
    if ((err as any).errorType) {
      let error = err as AppError;
      if ((error.errorType = ErrorType.EXISTS)) {
        return res.status(400).json({
          message: error.message,
          data: {},
          status: 'error',
        });
      }
    }

    return res.status(500).json({
      message: (err as any).message || "An error occurred",
      data: (err as any).data,
      status: 'error',
    });
  }
}
