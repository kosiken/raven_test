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

  router.post('/register',
  validator.body(schema.registerSchema),
  asyncHandler(controller.createUser),
  );

  router.post('/login',
  validator.body(schema.loginSchema),
  asyncHandler(controller.login),
  );




  app.use('/users', router);
}


