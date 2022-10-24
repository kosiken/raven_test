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

  router.post('/create',
  validator.body(schema.createBankAccount),
  validateBearerToken(config),
  passport.authenticate('jwt-user', { session: false }),
  asyncHandler(controller.createBankAccount),
  );

  app.use('/bank-accounts', router);
}


