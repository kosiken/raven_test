import * as Joi from '@hapi/joi';

export default {

  createBankAccount: Joi.object({
    user_id: Joi.string().required(),
  }),

};
