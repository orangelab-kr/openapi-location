import { WrapperResult, WrapperResultLazyProps } from '.';

export function $_$(
  opcode: number,
  statusCode: number,
  message?: string,
  reportable?: boolean
): (props?: WrapperResultLazyProps) => WrapperResult {
  return (lazyOptions: WrapperResultLazyProps = {}) =>
    new WrapperResult({
      opcode,
      statusCode,
      message,
      reportable,
      ...lazyOptions,
    });
}

export const RESULT = {
  /** SAME ERRORS  */
  SUCCESS: $_$(0, 200),
  REQUIRED_ACCESS_KEY: $_$(-401, 401, 'REQUIRED_ACCESS_KEY'),
  EXPIRED_ACCESS_KEY: $_$(-402, 401, 'EXPIRED_ACCESS_KEY'),
  PERMISSION_DENIED: $_$(-403, 403, 'PERMISSION_DENIED'),
  INVALID_ERROR: $_$(-404, 500, 'INVALID_ERROR', true),
  FAILED_VALIDATE: $_$(-405, 400, 'FAILED_VALIDATE'),
  INVALID_API: $_$(-406, 404, 'INVALID_API'),
  /** CUSTOM ERRORS  */
  CANNOT_FIND_GEOFENCE: $_$(-407, 404, 'CANNOT_FIND_GEOFENCE'),
  ALREADY_EXISTS_GEOFENCE_NAME: $_$(-408, 404, 'ALREADY_EXISTS_GEOFENCE_NAME'),
  CANNOT_FIND_PRICING: $_$(-409, 404, 'CANNOT_FIND_PRICING'),
  ALREADY_EXISTS_PRICING_NAME: $_$(-410, 409, 'ALREADY_EXISTS_PRICING_NAME'),
  PRICING_IS_USING: $_$(-411, 409, 'PRICING_IS_USING'),
  CANNOT_FIND_PROFILE: $_$(-412, 404, 'CANNOT_FIND_PROFILE'),
  ALREADY_EXISTS_PROFILE_NAME: $_$(-413, 409, 'ALREADY_EXISTS_PROFILE_NAME'),
  PROFILE_IS_USING: $_$(-414, 409, 'PROFILE_IS_USING'),
  CANNOT_FIND_REGION: $_$(-415, 404, 'CANNOT_FIND_REGION'),
  ALREADY_EXISTS_REGION_NAME: $_$(-416, 409, 'ALREADY_EXISTS_REGION_NAME'),
};
