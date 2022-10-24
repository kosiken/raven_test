import * as express from 'express';
import { createValidator } from 'express-joi-validation';
import { asyncHandler } from '../../middlewares';
import passport = require('passport');
import * as controller from './controller';
import schema from './validation';
import { IConfig } from '../../config/interface';
import { validateBearerToken } from '../../middlewares/auth/token';


export function init(app: any, config: IConfig) {
  const validator = createValidator({
    passError: true,
  });
  const router = express.Router();

  router.post('/init',
  validator.body(schema.initiateTransaction),
  validateBearerToken(config),
  passport.authenticate('jwt-user', { session: false }),
  asyncHandler(controller.initTransaction),
  );

  router.get('/all',
  validateBearerToken(config),
  passport.authenticate('jwt-user', { session: false }),
  asyncHandler(controller.getAllTransactions),
  );

  router.get('/all/deposits',
  validateBearerToken(config),
  passport.authenticate('jwt-user', { session: false }),
  asyncHandler(controller.getDeposits),
  );

  router.get('/all/withdrawals',
  validateBearerToken(config),
  passport.authenticate('jwt-user', { session: false }),
  asyncHandler(controller.getWithdrawals),
  );

  router.post('/webhook',
  asyncHandler(controller.transactionWebHook),
  );
  app.use('/transactions', router);
}


