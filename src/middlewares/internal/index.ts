import jwt from 'jsonwebtoken';
import moment from 'moment';
import { Joi, logger, OPCODE } from '../../tools';
import InternalError from '../../tools/error';
import Wrapper, { Callback } from '../../tools/wrapper';

export { default as InternalGeofenceMiddleware } from './geofence';
export { default as InternalPricingMiddleware } from './pricing';
export { default as InternalRegionMiddleware } from './region';

export default function InternalMiddleware(): Callback {
  return Wrapper(async (req, res, next) => {
    const { headers, query } = req;
    const token = headers.authorization
      ? headers.authorization.substr(7)
      : query.token;

    if (typeof token !== 'string') {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    const key = process.env.HIKICK_OPENAPI_LOCATION_KEY;
    if (!key || !token) {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    try {
      const data = jwt.verify(token, key);
      const schema = Joi.object({
        sub: Joi.string().valid('openapi-location').required(),
        iss: Joi.string().required(),
        aud: Joi.string().email().required(),
        prs: Joi.array().items(Joi.string()).required(),
        iat: Joi.date().timestamp().required(),
        exp: Joi.date().timestamp().required(),
      });

      const payload = await schema.validateAsync(data);
      const iat = moment(payload.iat);
      const exp = moment(payload.exp);
      const prs = parseInt(payload.prs, 36)
        .toString(2)
        .padStart(128, '0')
        .split('')
        .reverse()
        .map((v) => v === '1');

      req.internal = payload;
      req.internal.prs = prs;
      if (exp.diff(iat, 'hours') > 6) throw Error();
      logger.info(
        `[Internal] [${payload.iss}] ${payload.aud} - ${req.method} ${req.originalUrl}`
      );
    } catch (err) {
      throw new InternalError(
        '인증이 필요한 서비스입니다.',
        OPCODE.REQUIRED_INTERAL_LOGIN
      );
    }

    await next();
  });
}
