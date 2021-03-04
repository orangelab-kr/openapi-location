import Joi from './joi';

const PATTERN = {
  PAGINATION: {
    TAKE: Joi.number().default(10).optional(),
    SKIP: Joi.number().default(0).optional(),
    SEARCH: Joi.string().allow('').optional(),
    ORDER_BY: {
      FIELD: Joi.string().optional(),
      SORT: Joi.string().valid('asc', 'desc').default('asc').optional(),
    },
  },
  PRICING: {
    ID: Joi.string().uuid().required(),
    NAME: Joi.string().min(2).max(16).required(),
    STANDARD_PRICE: Joi.number().required(),
    NIGHTLY_PRICE: Joi.number().required(),
    STANDARD_TIME: Joi.number().required(),
    PER_MINUTE_STANDARD_PRICE: Joi.number().required(),
    PER_MINUTE_NIGHTLY_PRICE: Joi.number().required(),
    PENALTY_PRICE: Joi.number().required(),
  },
  REGION: {
    ID: Joi.string().uuid().required(),
    NAME: Joi.string().min(2).max(16).required(),
  },
};

export default PATTERN;
