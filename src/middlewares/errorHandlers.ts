import { NextFunction, Request, Response } from 'express';
import logger from '../utils/Logger';
import { get } from 'lodash';
import { AppError, ErrorType } from '../utils/AppErrors';

enum ResponseStatus {
    SUCCESS = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    DUPLICATE = 409,
    INTERNAL_ERROR = 500,
  }



export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
   res.status(404).json({
    message: 'Cannot find route ' + req.url,
    data: {

    }
  })
  return next();
}


function cleanErrorMessage(error) {
    return {
      message: error.message.replace(/[\"]/g, ''),
      path: error.path,
    };
  }

export function serverErrorHandler(errorThrown: any, req: Request, res: Response, next: NextFunction) {

    let appError: AppError = errorThrown;
    const logData: any = {
      remoteAddress: req.ip,
      host: get(req.headers, 'host'),
      method: req.method,
      query: req.query,
      request: req.body,
      url: req.url,
      userAgent: get(req.headers, 'user-agent'),
      
    };
  

  
    logData.errorMessage = errorThrown.message;
    logData.errorStack = errorThrown.stack;
    logData.statusCode =  500;


   if(appError && appError.errorType) {
    if(appError.errorType === ErrorType.INVALID_USER) {
      res.status(ResponseStatus.BAD_REQUEST).json({
        error: 'INVALID_PARAMETERS',
        message: 'password or email incorrect',
        
    })
    return next();
    }
   }
  
    if (errorThrown.error && errorThrown.error.isJoi) {
    //   const error = new JoiValidationError(err);
    //   AppError.handle(error, res);
    let error = errorThrown.error as any;

    res.status(ResponseStatus.BAD_REQUEST).json({
        error: 'INVALID_PARAMETERS',
        message: 'Invalid parameters',
        data: error.details.map(cleanErrorMessage),
    })
    return next()
    } else {
        res.status(ResponseStatus.INTERNAL_ERROR).json({
            message: logData.errorMessage,
            data: {

            }
        })
        logger.logLevel.err(logData);
        return next();
    }
  }
  