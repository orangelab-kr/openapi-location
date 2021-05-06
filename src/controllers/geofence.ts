import {
  GeofenceModel,
  PricingModel,
  ProfileModel,
  RegionModel,
} from '@prisma/client';
import { InternalError, Joi, OPCODE, PATTERN, Region } from '..';

import { Database } from '../tools';

const { prisma } = Database;

export class Geofence {
  public static async getGeofenceByLocation(props: {
    lat?: number;
    lng?: number;
  }): Promise<
    GeofenceModel & {
      profile: ProfileModel;
      region: RegionModel & { pricing: PricingModel };
    }
  > {
    const { lat, lng } = await PATTERN.GEOFENCE.POINT.validateAsync(props);

    const res = await prisma.$queryRaw(`\
SELECT JSON_OBJECT('geofenceId', g.geofenceId, 'enabled', g.enabled, 'name', g.name,
'geojson', JSON_UNQUOTE(g.geojson), 'regionId', g.regionId, 'profileId', g.profileId,
'createdAt', g.createdAt, 'updatedAt', g.updatedAt, 'deletedAt', g.deletedAt,
'profile', JSON_OBJECT('profileId', p.profileId, 'name', p.name, 'priority', p
.priority, 'speed' , p.speed, 'color', p.color, 'canReturn', IF(p.canReturn = '1', TRUE, FALSE),
'hasSurcharge', IF(p.hasSurcharge = '1', TRUE, FALSE), 'createdAt', p.createdAt,
'updatedAt', p.updatedAt, 'deletedAt', p.deletedAt), 'region', JSON_OBJECT('regionId', r.regionId,
'enabled', r.enabled, 'name', r.name, 'pricingId' , r.pricingId, 'createdAt'
, r.createdAt, 'updatedAt', r.createdAt, 'pricing', JSON_OBJECT('pricingId', pc.pricingId,
'name', pc.name, 'standardPrice', pc.standardPrice, 'nightlyPrice', pc.nightlyPrice,
'standardTime', pc.standardTime, 'perMinuteStandardPrice', pc.perMinuteStandardPrice,
'perMinuteNightlyPrice', pc.perMinuteNightlyPrice, 'surchargePrice', pc.surchargePrice,
'createdAt', pc.createdAt, 'updatedAt', pc.updatedAt, 'deletedAt', pc.deletedAt)
)) as geofence FROM GeofenceModel AS g LEFT OUTER JOIN ProfileModel as p ON g.profileId
= p.profileId LEFT OUTER JOIN RegionModel r on g.regionId = r.regionId LEFT
OUTER JOIN PricingModel pc on r.pricingId = pc.pricingId WHERE r.enabled = true
AND g.enabled = true AND MBRContains(ST_GeomFromGeoJSON(geojson),
GeomFromText("Point(${lng} ${lat})")) ORDER BY p.priority DESC LIMIT 1;`);

    if (res.length <= 0) {
      throw new InternalError('오류가 발생하였습니다.', OPCODE.ERROR);
    }

    const geofence: GeofenceModel & {
      profile: ProfileModel;
      region: RegionModel & { pricing: PricingModel };
    } = JSON.parse(res[0].geofence);
    geofence.geojson = JSON.parse(String(geofence.geojson));
    return geofence;
  }

  /** 모든 구역 조회 */
  public static async getGeofences(
    region: RegionModel,
    props: {
      take?: number;
      skip?: number;
      search?: string;
      orderByField?: 'name' | 'createdAt';
      orderBySort?: 'asc' | 'desc';
    }
  ): Promise<{ total: number; geofences: GeofenceModel[] }> {
    const schema = await Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH.default(''),
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'name',
        'createdAt'
      ).default('name'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT.valid('asc', 'desc'),
    });

    const {
      take,
      skip,
      search,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const { regionId } = region;
    const where = { regionId, name: { contains: search } };
    const orderBy = { [orderByField]: orderBySort };
    const include = { profile: true };
    const [total, geofences] = await prisma.$transaction([
      prisma.geofenceModel.count({ where }),
      prisma.geofenceModel.findMany({
        take,
        skip,
        where,
        include,
        orderBy,
      }),
    ]);

    return { geofences, total };
  }

  /** 구역을 가져옵니다. 없을 경우 오류를 발생시킵니다. */
  public static async getGeofenceOrThrow(
    region: RegionModel,
    geofenceId: string
  ): Promise<GeofenceModel> {
    const geofence = await Geofence.getGeofence(region, geofenceId);
    if (!geofence) {
      throw new InternalError(
        '해당 구역을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return geofence;
  }

  /** 구역을 가져옵니다. */
  public static async getGeofence(
    region: RegionModel,
    geofenceId: string
  ): Promise<GeofenceModel | null> {
    const { regionId } = region;
    const geofence = await prisma.geofenceModel.findFirst({
      include: { profile: true },
      where: {
        geofenceId,
        region: { regionId },
      },
    });

    return geofence;
  }

  /** 구역을 생성합니다. */
  public static async createGeofence(
    region: RegionModel,
    props: {
      name: string;
      enabled: boolean;
      profileId: string;
      geojson: { type: 'Polygon'; coordinates: [[number, number]][][] };
    }
  ): Promise<GeofenceModel> {
    const schema = Joi.object({
      name: PATTERN.GEOFENCE.NAME,
      enabled: PATTERN.GEOFENCE.ENABLED,
      profileId: PATTERN.PROFILE.ID,
      geojson: PATTERN.GEOFENCE.GEOJSON,
    });

    const { name, enabled, profileId, geojson } = await schema.validateAsync(
      props
    );

    const exists = await Geofence.getGeofenceByName(region, name);
    if (exists) {
      throw new InternalError(
        '이미 동일한 이름의 구역이 존재합니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    const { regionId } = region;
    const geofence = await prisma.geofenceModel.create({
      data: {
        name,
        enabled,
        geojson,
        profile: { connect: { profileId } },
        region: { connect: { regionId } },
      },
    });

    return geofence;
  }

  /** 구역을 수정합니다. */
  public static async modifyGeofence(
    region: RegionModel,
    geofence: GeofenceModel,
    props: {
      name?: string;
      enabled?: boolean;
      profileId?: string;
      regionId?: string;
      geojson?: { type: 'Polygon'; coordinates: [[number, number]][][] };
    }
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.GEOFENCE.NAME.optional(),
      enabled: PATTERN.GEOFENCE.ENABLED.optional(),
      profileId: PATTERN.PROFILE.ID.optional(),
      regionId: PATTERN.REGION.ID.optional(),
      geojson: PATTERN.GEOFENCE.GEOJSON.optional(),
    });

    const {
      name,
      enabled,
      profileId,
      regionId,
      geojson,
    } = await schema.validateAsync(props);
    if (name && name !== geofence.name) {
      const exists = await Geofence.getGeofenceByName(region, name);
      if (exists) {
        throw new InternalError(
          '이미 동일한 이름의 구역이 존재합니다.',
          OPCODE.ALREADY_EXISTS
        );
      }
    }

    if (regionId && regionId !== geofence.regionId) {
      await Region.getRegionOrThrow(regionId);
    }

    const { geofenceId } = geofence;
    await prisma.geofenceModel.updateMany({
      where: { geofenceId },
      data: { name, profileId, enabled, regionId, geojson },
    });
  }

  /** 구역을 삭제합니다. */
  public static async deleteGeofence(
    region: RegionModel,
    geofence: GeofenceModel
  ): Promise<void> {
    const { regionId } = region;
    const { geofenceId } = geofence;
    await prisma.geofenceModel.deleteMany({
      where: { geofenceId, region: { regionId } },
    });
  }

  /** 구역 이름으로 구역을 가져옵니다. */
  public static async getGeofenceByName(
    region: RegionModel,
    name: string
  ): Promise<GeofenceModel | null> {
    const { regionId } = region;
    const geofence = await prisma.geofenceModel.findFirst({
      where: { name, region: { regionId } },
      include: { profile: true },
    });

    return geofence;
  }
}
