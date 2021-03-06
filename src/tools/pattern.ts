import Joi from './joi';
import { RegionGeofenceType } from '@prisma/client';

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
  GEOFENCE: {
    ID: Joi.string().uuid().required(),
    NAME: Joi.string().min(2).max(16).required(),
    TYPE: Joi.string()
      .valid(...Object.keys(RegionGeofenceType))
      .required(),
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

export default PATTERN;
