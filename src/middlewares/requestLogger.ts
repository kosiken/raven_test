import { NextFunction, Request, Response } from 'express';
import logger from '../utils/Logger';
import { get } from 'lodash';

export function requestLogger(req: Request, res: Response, next: NextFunction) {

  const logData = {
    host: get(req.headers, 'host'),
    method: req.method,
    url: req.url,
    userAgent: get(req.headers, 'user-agent'),
  };

  logger.log(logData);

  next();
}
