import * as passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import * as passportLocal from "passport-local";

import logger from "../../utils/Logger";
import { readFileSync } from "fs";
import { IConfig } from "../../config/interface";
import { User } from "../../database/models";
import { AppError, ErrorType } from "../../utils/AppErrors";
const LocalStrategy = passportLocal.Strategy;

export function factory(config: IConfig) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secrets.jwtSecret,
  };



  passport.use('jwt-user',
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        const existingUser = await User.getOne({
          user_id: jwt_payload.user.user_id,
        });

        return done(null,new User(existingUser));
      } catch (error) {
        return done(error);
      }
    })
  );

  // ...

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.getOne({ email });
        let err = new AppError(ErrorType.INVALID_USER, new Error(`user with ${email} not found`))
        if (!user) {
          return done(err, false, err);
        }

        const validate = await User.validatePassword({password: user.password!}, password);

        if (!validate) {
          err = new AppError(ErrorType.INVALID_USER, new Error( 'Wrong Password' ))
          return done( err, false, { message: 'Wrong Password' });
        }

        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);
}
