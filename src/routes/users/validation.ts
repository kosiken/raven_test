import * as Joi from '@hapi/joi';

export default {
  passwordResetSchema: Joi.object({
    password: Joi.string().required(),
    passwordConfirmation: Joi.string().required(),
  }),
  registerSchema: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone: Joi.string().required(),
  }),

  loginSchema: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  })
};
