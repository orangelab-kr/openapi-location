import {
  RegionGeofenceModel,
  RegionGeofenceType,
  RegionModel,
} from '@prisma/client';

import Database from '../tools/database';
import InternalError from '../tools/error';
import Joi from '../tools/joi';
import OPCODE from '../tools/opcode';
import PATTERN from '../tools/pattern';

const { prisma } = Database;

export default class Geofence {
  public static async getGeofenceTypeByLocation(props: {
    lat?: number;
    lng?: number;
  }): Promise<RegionGeofenceType> {
    let type: RegionGeofenceType = 'NOT_OPERATED';
    const { lat, lng } = await PATTERN.GEOFENCE.POINT.validateAsync(props);

    const regionGeofences: RegionGeofenceModel[] = await prisma.$queryRaw(`
      SELECT * FROM RegionGeofenceModel WHERE enabled = true
      AND MBRContains(ST_GeomFromGeoJSON(geojson), GeomFromText("Point(${lng} ${lat})"));
    `);

    const allowed = regionGeofences.find(
      ({ type }) => type === RegionGeofenceType.ALLOWED
    );

    const disallowed = regionGeofences.find(
      ({ type }) => type === RegionGeofenceType.DISALLOWED
    );

    const notOperated = regionGeofences.find(
      ({ type }) => type === RegionGeofenceType.NOT_OPERATED
    );

    if (allowed) type = 'ALLOWED';
    if (disallowed) type = 'DISALLOWED';
    if (notOperated) type = 'NOT_OPERATED';
    return type;
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
  ): Promise<{ total: number; geofences: RegionGeofenceModel[] }> {
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
    const [total, geofences] = await prisma.$transaction([
      prisma.regionGeofenceModel.count({ where }),
      prisma.regionGeofenceModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { geofences, total };
  }

  /** 구역을 가져옵니다. 없을 경우 오류를 발생시킵니다. */
  public static async getGeofenceOrThrow(
    region: RegionModel,
    regionGeofenceId: string
  ): Promise<RegionGeofenceModel> {
    const regionGeofence = await Geofence.getGeofence(region, regionGeofenceId);
    if (!regionGeofence) {
      throw new InternalError(
        '해당 구역을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return regionGeofence;
  }

  /** 구역을 가져옵니다. */
  public static async getGeofence(
    region: RegionModel,
    regionGeofenceId: string
  ): Promise<RegionGeofenceModel | null> {
    const { regionId } = region;
    const regionGeofence = await prisma.regionGeofenceModel.findFirst({
      where: {
        regionGeofenceId,
        region: { regionId },
      },
    });

    return regionGeofence;
  }

  /** 구역을 생성합니다. */
  public static async createGeofence(
    region: RegionModel,
    props: {
      name: string;
      enabled: boolean;
      type: RegionGeofenceType;
      geojson: { type: 'Polygon'; coordinates: [[number, number]][][] };
    }
  ): Promise<RegionGeofenceModel> {
    const schema = Joi.object({
      name: PATTERN.GEOFENCE.NAME,
      enabled: PATTERN.GEOFENCE.ENABLED,
      type: PATTERN.GEOFENCE.TYPE,
      geojson: PATTERN.GEOFENCE.GEOJSON,
    });

    const { name, enabled, type, geojson } = await schema.validateAsync(props);
    const exists = await Geofence.getGeofenceByName(region, name);
    if (exists) {
      throw new InternalError(
        '이미 동일한 이름의 구역이 존재합니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    const { regionId } = region;
    const regionGeofence = await prisma.regionGeofenceModel.create({
      data: { name, type, enabled, geojson, region: { connect: { regionId } } },
    });

    return regionGeofence;
  }

  /** 구역을 수정합니다. */
  public static async modifyGeofence(
    region: RegionModel,
    regionGeofence: RegionGeofenceModel,
    props: {
      name?: string;
      enabled?: boolean;
      type?: RegionGeofenceType;
      geojson?: { type: 'Polygon'; coordinates: [[number, number]][][] };
    }
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.GEOFENCE.NAME.optional(),
      enabled: PATTERN.GEOFENCE.ENABLED.optional(),
      type: PATTERN.GEOFENCE.TYPE.optional(),
      geojson: PATTERN.GEOFENCE.GEOJSON.optional(),
    });

    const { name, enabled, type, geojson } = await schema.validateAsync(props);
    if (name && name !== regionGeofence.name) {
      const exists = await Geofence.getGeofenceByName(region, name);
      if (exists) {
        throw new InternalError(
          '이미 동일한 이름의 구역이 존재합니다.',
          OPCODE.ALREADY_EXISTS
        );
      }
    }

    const { regionId } = region;
    const { regionGeofenceId } = regionGeofence;
    await prisma.regionGeofenceModel.updateMany({
      where: { regionGeofenceId, region: { regionId } },
      data: { name, type, enabled, geojson },
    });
  }

  /** 구역을 삭제합니다. */
  public static async deleteGeofence(
    region: RegionModel,
    regionGeofence: RegionGeofenceModel
  ): Promise<void> {
    const { regionId } = region;
    const { regionGeofenceId } = regionGeofence;
    await prisma.regionGeofenceModel.deleteMany({
      where: { regionGeofenceId, region: { regionId } },
    });
  }

  /** 구역 이름으로 구역을 가져옵니다. */
  public static async getGeofenceByName(
    region: RegionModel,
    name: string
  ): Promise<RegionGeofenceModel | null> {
    const { regionId } = region;
    const regionGeofence = await prisma.regionGeofenceModel.findFirst({
      where: { name, region: { regionId } },
    });

    return regionGeofence;
  }
}
