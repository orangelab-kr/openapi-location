import { Database, InternalError, Joi, OPCODE, PATTERN } from '../tools';
import { Prisma, RegionModel } from '@prisma/client';

import Pricing from './pricing';

const { prisma } = Database;

export default class Region {
  /** 지역 목록 조회 */
  public static async getRegions(props: {
    take?: number;
    skip?: number;
    search?: string;
    orderByField?: 'name' | 'createdAt';
    orderBySort?: 'asc' | 'desc';
  }): Promise<{ total: number; regions: RegionModel[] }> {
    const schema = await Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
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
    const where: Prisma.RegionModelWhereInput = {};
    const orderBy = { [orderByField]: orderBySort };
    if (search) where.name = { contains: search };
    const include: Prisma.RegionModelInclude = { pricing: true };
    const [total, regions] = await prisma.$transaction([
      prisma.regionModel.count({ where }),
      prisma.regionModel.findMany({
        take,
        skip,
        where,
        orderBy,
        include,
      }),
    ]);

    return { total, regions };
  }

  /** 지역을 가져옵니다. 없을 경우 오류를 발생시킵니다. */
  public static async getRegionOrThrow(regionId: string): Promise<RegionModel> {
    const region = await Region.getRegion(regionId);
    if (!region) {
      throw new InternalError(
        '해당 지역을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return region;
  }

  /** 지역을 가져옵니다. */
  public static async getRegion(regionId: string): Promise<RegionModel | null> {
    const region = await prisma.regionModel.findFirst({
      where: { regionId },
      include: { pricing: true },
    });

    return region;
  }

  /** 지역을 생성합니다. */
  public static async createRegion(props: {
    name: string;
    pricingId: number;
  }): Promise<RegionModel> {
    const schema = Joi.object({
      name: PATTERN.REGION.NAME,
      pricingId: PATTERN.PRICING.ID,
    });

    const { name, pricingId } = await schema.validateAsync(props);
    const exists = await Region.getRegionByName(name);
    if (exists) {
      throw new InternalError(
        '이미 동일한 이름의 지역이 있습니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    await Pricing.getPricingOrThrow(pricingId);
    const region = await prisma.regionModel.create({
      data: { name, pricing: { connect: { pricingId } } },
    });

    return region;
  }

  /** 지역을 수정합니다. */
  public static async modifyRegion(
    region: RegionModel,
    props: {
      name: string;
      pricingId: string;
    }
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.REGION.NAME.optional(),
      pricingId: PATTERN.PRICING.ID.optional(),
    });

    const { regionId } = region;
    const { name, pricingId } = await schema.validateAsync(props);
    const data: Prisma.RegionModelUpdateInput = { name };
    const where: Prisma.RegionModelWhereUniqueInput = { regionId };
    if (name && region.name !== name) {
      const exists = await Region.getRegionByName(name);
      if (exists) {
        throw new InternalError(
          '이미 동일한 이름의 가격 정책이 있습니다.',
          OPCODE.ALREADY_EXISTS
        );
      }
    }

    if (pricingId && region.pricingId !== pricingId) {
      await Pricing.getPricingOrThrow(pricingId);
      data.pricing = { connect: { pricingId } };
    }

    await prisma.regionModel.update({ where, data });
  }

  /** 지역을 삭제합니다. */
  public static async deleteRegion(region: RegionModel): Promise<void> {
    const { regionId } = region;
    await prisma.regionGeofenceModel.deleteMany({ where: { regionId } });
    await prisma.regionModel.deleteMany({ where: { regionId } });
  }

  /** 지역 이름으로 가격 정책을 가져옵니다. */
  public static async getRegionByName(
    name: string
  ): Promise<RegionModel | null> {
    const region = await prisma.regionModel.findFirst({
      where: { name },
    });

    return region;
  }
}
