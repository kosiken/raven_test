
import logger from '../utils/Logger';
export {notFoundHandler, serverErrorHandler} from './errorHandlers'
export { requestLogger } from './requestLogger';
import { NextFunction, Request, Response } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler =  (execution: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    execution(req, res, next).catch(next);
 };
 