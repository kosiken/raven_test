import { NextFunction, Request, Response } from 'express';
import { AppError, ErrorType } from '../../utils/AppErrors';
import * as jwt from 'jsonwebtoken';
import { IConfig } from '../../config/interface';

export function decodeToken(token: string, config: IConfig): { user_id: string, email: string } {

  if (!jwt.decode(token)) {
    throw new AppError(ErrorType.INVALID_TOKEN, new Error('Invalid token'));
  }
  const { user } = jwt.decode(token)! as any;

  // Decrypt
  return user;
}


function getTokenFromHeader(req: Request, config: IConfig) {
  if (!req.headers.authorization && !req.params.token && !req.body.token) {
    throw new AppError(ErrorType.INVALID_TOKEN, new Error('Missing authorization token'));
  } else {
    const bearerToken = (req.headers.authorization) ? req.headers.authorization.split(' ')[1] : req.params.token || req.body.token;
    return { bearerToken, decodedToken: decodeToken(bearerToken, config) };
  }
}

export const validateBearerToken = (config: IConfig) => ((req: Request, res: Response, next: NextFunction) => {
  try {
    const { bearerToken, decodedToken } = getTokenFromHeader(req, config);

    res.locals.user = decodedToken;
    res.locals.token = bearerToken;
    return next();
    
  } catch (err) {
    return next(err);
  }
})
