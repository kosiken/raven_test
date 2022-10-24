import { NextFunction, Request, Response } from 'express';
import * as passport from "passport";
import { IUser, User } from '../../database/models';
import { appConfig } from '../../config';

import { AppError, ErrorType } from '../../utils/AppErrors';
import  * as jwt from 'jsonwebtoken';

const config = appConfig.default;

export async function createUser(req: Request, res: Response) {
   try {
    const user = await User.create(req.body);
    return res.status(201).json({
        message: 'create_user',
        data: user!,
        status: 'success',
    })
   }catch(err) {
    if((err as any).errorType) {
        let error = err as AppError;
        if(error.errorType = ErrorType.EXISTS) {
            return res.status(400)
            .json({
                message: error.message,
                data: {},

            })
        }
    
    }
    return res.status(400)
            .json({
                message: (err as any).message || 'An error occurred',
                data: {},
                status: 'failed',

            })
   }


}

export async function login(req: Request, res: Response, next: NextFunction) {
   return passport.authenticate(
        'login',
        async (err: any, user: IUser, info) => {
          try {
            if (err || !user) {
              let error = new Error('An error occurred.');
            if(err) {
                error = err;
            }
              return next(error);
            }
  
            req.login(
              user,
              { session: false },
              async (error) => {
                if (error) return next(error);
  
                const body = { user_id: user.user_id, email: user.email };
                const token = jwt.sign({ user: body, created_at: new Date() }, config.secrets.jwtSecret);
                const loggedIn = new User(user);
                return res.status(200).json({message: 'user_login', status: 'success', data: {token, user: loggedIn} });
              }
            );
          } catch (error) {
            return next(error);
          }
        }
      )(req, res, next);
}   
