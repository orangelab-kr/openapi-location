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
import { Polygon } from '../tools';
import { v1 as UUIDv1 } from 'uuid';
import { escape } from 'sqlstring';

const { prisma } = Database;

export default class Geofence {
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
    const escapeSearch = escape(`%${search}%`);
    const where = { regionId, name: { contains: search } };
    const [total, geofences] = await prisma.$transaction([
      prisma.regionGeofenceModel.count({ where }),
      prisma.$queryRaw(`
        SELECT *, ST_AsGeoJSON(polygon) as polygon
        FROM RegionGeofenceModel
        WHERE name LIKE ${escapeSearch}
        AND regionId = '${regionId}'
        ORDER BY ${orderByField} ${orderBySort}
        LIMIT ${take} OFFSET ${skip};`),
    ]);

    return { geofences, total };
  }

  /** 구역을 가져옵니다. 없을 경우 오류를 발생시킵니다. */
  public static async getGeofenceOrThrow(
    regionGeofenceId: string
  ): Promise<RegionGeofenceModel> {
    const regionGeofence = await Geofence.getGeofence(regionGeofenceId);
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
    regionGeofenceId: string
  ): Promise<RegionGeofenceModel | null> {
    const regionGeofence = await prisma.$queryRaw(`
      SELECT *, ST_AsGeoJSON(polygon) as polygon FROM RegionGeofenceModel
      WHERE regionGeofenceId = "${regionGeofenceId}";`);

    return regionGeofence[0] || null;
  }

  /** 구역을 생성합니다. */
  public static async createGeofence(
    region: RegionModel,
    props: {
      name: string;
      type: RegionGeofenceType;
      polygon: [[number, number]][];
    }
  ): Promise<RegionGeofenceModel> {
    const schema = Joi.object({
      name: PATTERN.GEOFENCE.NAME,
      type: PATTERN.GEOFENCE.TYPE,
      polygon: PATTERN.GEOFENCE.POLYGON,
    });

    const { name, type, polygon } = await schema.validateAsync(props);
    const exists = await Geofence.getGeofenceByName(region, name);
    if (exists) {
      throw new InternalError(
        '이미 동일한 이름의 구역이 존재합니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    const { regionId } = region;
    const ecsapedName = escape(name);
    const regionGeofenceId = await Geofence.generateGeofenceId();
    const queryPolygon = Polygon.getQueryPolygonFromPolygon(polygon);
    await prisma.$executeRaw(`INSERT INTO RegionGeofenceModel(regionGeofenceId, name, type, polygon, regionId, createdAt, updatedAt)
      VALUES ("${regionGeofenceId}", ${ecsapedName}, "${type}", ${queryPolygon}, "${regionId}", NOW(), NOW());`);
    const regionGeofence = await Geofence.getGeofenceOrThrow(regionGeofenceId);
    return regionGeofence;
  }

  /** 구역을 수정합니다. */
  public static async modifyGeofence(
    region: RegionModel,
    regionGeofence: RegionGeofenceModel,
    props: {
      name?: string;
      type?: RegionGeofenceType;
      polygon?: [[number, number]][];
    }
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.GEOFENCE.NAME.optional(),
      type: PATTERN.GEOFENCE.TYPE.optional(),
      polygon: PATTERN.GEOFENCE.POLYGON.optional(),
    });

    let query = 'UPDATE RegionGeofenceModel SET updatedAt = NOW()';
    const { name, type, polygon } = await schema.validateAsync(props);
    if (regionGeofence.name !== name) {
      query += `, name = ${escape(name)}`;
      const exists = await Geofence.getGeofenceByName(region, name);
      if (exists) {
        throw new InternalError(
          '이미 동일한 이름의 구역이 존재합니다.',
          OPCODE.ALREADY_EXISTS
        );
      }
    }

    if (regionGeofence.type !== type) {
      query += `, type = '${type}'`;
    }

    if (polygon) {
      const queryPolygon = Polygon.getQueryPolygonFromPolygon(polygon);
      query += `, polygon = ${queryPolygon}`;
    }

    query += ` WHERE regionGeofenceId = '${regionGeofence.regionGeofenceId}';`;
    await prisma.$executeRaw(query);
  }

  /** 구역을 삭제합니다. */
  public static async deleteGeofence(
    regionGeofence: RegionGeofenceModel
  ): Promise<void> {
    const { regionGeofenceId } = regionGeofence;
    await prisma.regionGeofenceModel.deleteMany({
      where: { regionGeofenceId },
    });
  }

  /** 구역 이름으로 구역을 가져옵니다. */
  public static async getGeofenceByName(
    region: RegionModel,
    name: string
  ): Promise<RegionGeofenceModel | null> {
    const ecsapedName = escape(name);
    const { regionId } = region;
    const regionGeofence = await prisma.$queryRaw(`
      SELECT *, ST_AsGeoJSON(polygon) as polygon FROM RegionGeofenceModel
      WHERE regionId = "${regionId}" AND name = ${ecsapedName};`);

    console.log(regionGeofence);
    return regionGeofence[0] || null;
  }

  /** 랜덤 UUID를 생성합니다. */
  private static async generateGeofenceId(): Promise<string> {
    let regionGeofenceId;
    while (true) {
      regionGeofenceId = UUIDv1();
      const regionGeofence = await prisma.regionGeofenceModel.findFirst({
        where: { regionGeofenceId },
      });

      if (!regionGeofence) break;
    }

    return regionGeofenceId;
  }
}
