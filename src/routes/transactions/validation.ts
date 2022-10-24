import * as Joi from '@hapi/joi';

export default {
    initiateTransaction: Joi.object({
    amount: Joi.number().required(),
    bank_code: Joi.string().required(),
    bank: Joi.string().required(),
    account_number: Joi.string().required(),
    account_name: Joi.string().required(),
    narration: Joi.string(),
 
  }),
};
