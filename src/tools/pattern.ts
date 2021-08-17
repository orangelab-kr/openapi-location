import { Joi } from '.';

export const PATTERN = {
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
    MAX_PRICE: Joi.number().allow(null).optional(),
    PER_MINUTE_STANDARD_PRICE: Joi.number().required(),
    PER_MINUTE_NIGHTLY_PRICE: Joi.number().required(),
    SURCHARGE_PRICE: Joi.number().required(),
  },
  REGION: {
    ID: Joi.string().uuid().required(),
    ENABLED: Joi.boolean().required(),
    NAME: Joi.string().min(2).max(16).required(),
  },
  PROFILE: {
    ID: Joi.string().uuid().required(),
    NAME: Joi.string().min(2).max(16).required(),
    PRIORITY: Joi.number().required(),
    SPEED: Joi.number().min(5).max(50).allow(null).optional(),
    COLOR: Joi.string()
      .regex(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/)
      .required(),
    CAN_RETURN: Joi.boolean().required(),
    HAS_SURCHARGE: Joi.boolean().required(),
  },
  GEOFENCE: {
    POINT: Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required(),
    }).required(),
    ID: Joi.string().uuid().required(),
    ENABLED: Joi.boolean().required(),
    NAME: Joi.string().min(2).max(16).required(),
    GEOJSON: Joi.object({
      type: Joi.string().valid('Polygon').required(),
      coordinates: Joi.array()
        .min(1)
        .required()
        .items(
          Joi.array()
            .min(1)
            .required()
            .items(
              Joi.array().items(
                Joi.number().min(-90).max(90).required(),
                Joi.number().min(-180).max(180).required()
              )
            )
        ),
    }),
  },
};
