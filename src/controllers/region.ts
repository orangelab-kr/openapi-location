import { Prisma, RegionModel } from '@prisma/client';
import { Joi, PATTERN, Pricing } from '..';
import { Database, RESULT } from '../tools';

const { prisma } = Database;

export class Region {
  /** 지역에 따른 모든 Geofence 를 가져옵니다. */
  public static async getRegionsForUser(): Promise<RegionModel[]> {
    const enabled = true;
    const regions = await prisma.regionModel.findMany({
      include: { pricing: true, geofences: { include: { profile: true } } },
      where: { enabled, geofences: { some: { enabled } } },
    });

    return regions;
  }

  /** 특정 지역을 가져옵니다. */
  public static async getRegionForUser(
    regionId: string
  ): Promise<RegionModel | null> {
    const enabled = true;
    const region = await prisma.regionModel.findFirst({
      include: { pricing: true, geofences: { include: { profile: true } } },
      where: { enabled, regionId, geofences: { some: { enabled } } },
    });

    return region;
  }

  /** 특정 지역을 가져옵니다. 또는 오류를 발생합니다. */
  public static async getRegionForUserOrThrow(
    regionId: string
  ): Promise<RegionModel> {
    const region = await Region.getRegionForUser(regionId);
    if (!region) throw RESULT.CANNOT_FIND_PROFILE();
    return region;
  }

  /** 지역 이름과 지역 ID를 가져옵니다. */
  public static async getShortRegionsForUser(): Promise<
    { regionId: string; name: string }[]
  > {
    const regions = await prisma.regionModel.findMany({
      where: { enabled: true },
      select: { regionId: true, name: true },
    });

    return regions;
  }

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

    const { take, skip, search, orderByField, orderBySort } =
      await schema.validateAsync(props);
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
    if (!region) throw RESULT.CANNOT_FIND_REGION();
    return region;
  }

  /** 지역을 가져옵니다. */
  public static async getRegion(regionId: string): Promise<RegionModel | null> {
    const region = await prisma.regionModel.findFirst({
      where: { regionId },
      include: { pricing: true, geofences: { include: { profile: true } } },
    });

    return region;
  }

  /** 지역을 생성합니다. */
  public static async createRegion(props: {
    name: string;
    enabled: boolean;
    pricingId: number;
  }): Promise<RegionModel> {
    const schema = Joi.object({
      name: PATTERN.REGION.NAME,
      enabled: PATTERN.REGION.ENABLED,
      pricingId: PATTERN.PRICING.ID,
    });

    const { name, enabled, pricingId } = await schema.validateAsync(props);
    const exists = await Region.getRegionByName(name);
    if (exists) throw RESULT.ALREADY_EXISTS_REGION_NAME();
    await Pricing.getPricingOrThrow(pricingId);
    const region = await prisma.regionModel.create({
      data: { name, enabled, pricing: { connect: { pricingId } } },
    });

    return region;
  }

  /** 지역을 수정합니다. */
  public static async modifyRegion(
    region: RegionModel,
    props: {
      name: string;
      enabled: boolean;
      pricingId: string;
    }
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.REGION.NAME.optional(),
      enabled: PATTERN.REGION.ENABLED.optional(),
      pricingId: PATTERN.PRICING.ID.optional(),
    });

    const { regionId } = region;
    const { name, enabled, pricingId } = await schema.validateAsync(props);
    const data: Prisma.RegionModelUpdateInput = { name, enabled };
    const where: Prisma.RegionModelWhereUniqueInput = { regionId };
    if (name && region.name !== name) {
      const exists = await Region.getRegionByName(name);
      if (exists) throw RESULT.ALREADY_EXISTS_REGION_NAME();
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
    await prisma.geofenceModel.deleteMany({ where: { regionId } });
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
