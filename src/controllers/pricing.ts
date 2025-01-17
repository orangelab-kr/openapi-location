import { PricingModel, Prisma } from '@prisma/client';
import { Joi, PATTERN, prisma, RESULT } from '..';

export class Pricing {
  /** 가격 정책 목록 조회 */
  public static async getPricings(props: {
    take?: number;
    skip?: number;
    search?: string;
    orderByField?: 'name' | 'createdAt';
    orderBySort?: 'asc' | 'desc';
  }): Promise<{ total: number; pricings: PricingModel[] }> {
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
    const where: Prisma.PricingModelWhereInput = {};
    const orderBy = { [orderByField]: orderBySort };
    if (search) {
      where.OR = [
        { pricingId: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const [total, pricings] = await prisma.$transaction([
      prisma.pricingModel.count({ where }),
      prisma.pricingModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { pricings, total };
  }

  /** 가격 정책을 가져옵니다. 없을 경우 오류를 발생시킵니다. */
  public static async getPricingOrThrow(
    pricingId: string
  ): Promise<PricingModel> {
    const pricing = await Pricing.getPricing(pricingId);
    if (!pricing) throw RESULT.CANNOT_FIND_PRICING();
    return pricing;
  }

  /** 가격 정책을 가져옵니다. */
  public static async getPricing(
    pricingId: string
  ): Promise<PricingModel | null> {
    const pricing = await prisma.pricingModel.findFirst({
      where: { pricingId },
    });

    return pricing;
  }

  /** 가격 정책을 생성합니다. */
  public static async createPricing(props: {
    name: string;
    standardPrice: number;
    nightlyPrice: number;
    standardTime: number;
    maxPrice?: number;
    perMinuteStandardPrice: number;
    perMinuteNightlyPrice: number;
    surchargePrice: number;
    helmetLostPrice: number;
  }): Promise<PricingModel> {
    const schema = Joi.object({
      name: PATTERN.PRICING.NAME,
      standardPrice: PATTERN.PRICING.STANDARD_PRICE,
      nightlyPrice: PATTERN.PRICING.NIGHTLY_PRICE,
      standardTime: PATTERN.PRICING.STANDARD_TIME,
      maxPrice: PATTERN.PRICING.MAX_PRICE,
      perMinuteStandardPrice: PATTERN.PRICING.PER_MINUTE_STANDARD_PRICE,
      perMinuteNightlyPrice: PATTERN.PRICING.PER_MINUTE_NIGHTLY_PRICE,
      surchargePrice: PATTERN.PRICING.SURCHARGE_PRICE,
      helmetLostPrice: PATTERN.PRICING.HELMET_LOST_PRICE,
    });

    const {
      name,
      standardPrice,
      nightlyPrice,
      standardTime,
      maxPrice,
      perMinuteStandardPrice,
      perMinuteNightlyPrice,
      surchargePrice,
      helmetLostPrice,
    } = await schema.validateAsync(props);
    const exists = await Pricing.getPricingByName(name);
    if (exists) throw RESULT.ALREADY_EXISTS_PRICING_NAME();
    const pricing = await prisma.pricingModel.create({
      data: {
        name,
        standardPrice,
        nightlyPrice,
        standardTime,
        maxPrice,
        perMinuteStandardPrice,
        perMinuteNightlyPrice,
        surchargePrice,
        helmetLostPrice,
      },
    });

    return pricing;
  }

  /** 가격 정책을 수정합니다. */
  public static async modifyPricing(
    pricing: PricingModel,
    props: {
      name: string;
      standardPrice: number;
      nightlyPrice: number;
      standardTime: number;
      maxPrice?: number;
      perMinuteStandardPrice: number;
      perMinuteNightlyPrice: number;
      surchargePrice: number;
      helmetLostPrice: number;
    }
  ): Promise<PricingModel> {
    const schema = Joi.object({
      name: PATTERN.PRICING.NAME.optional(),
      standardPrice: PATTERN.PRICING.STANDARD_PRICE.optional(),
      nightlyPrice: PATTERN.PRICING.NIGHTLY_PRICE.optional(),
      standardTime: PATTERN.PRICING.STANDARD_TIME.optional(),
      maxPrice: PATTERN.PRICING.MAX_PRICE.optional(),
      perMinuteStandardPrice:
        PATTERN.PRICING.PER_MINUTE_STANDARD_PRICE.optional(),
      perMinuteNightlyPrice:
        PATTERN.PRICING.PER_MINUTE_NIGHTLY_PRICE.optional(),
      surchargePrice: PATTERN.PRICING.SURCHARGE_PRICE.optional(),
      helmetLostPrice: PATTERN.PRICING.HELMET_LOST_PRICE.optional(),
    });

    const {
      name,
      standardPrice,
      nightlyPrice,
      standardTime,
      maxPrice,
      perMinuteStandardPrice,
      perMinuteNightlyPrice,
      surchargePrice,
      helmetLostPrice,
    } = await schema.validateAsync(props);
    if (name && pricing.name !== name) {
      const exists = await Pricing.getPricingByName(name);
      if (exists) throw RESULT.ALREADY_EXISTS_PRICING_NAME();
    }

    const { pricingId } = pricing;
    return prisma.pricingModel.update({
      where: { pricingId },
      data: {
        name,
        standardPrice,
        nightlyPrice,
        standardTime,
        maxPrice,
        perMinuteStandardPrice,
        perMinuteNightlyPrice,
        surchargePrice,
        helmetLostPrice,
      },
    });
  }

  /** 가격 정책을 삭제합니다. */
  public static async deletePricing(pricing: PricingModel): Promise<void> {
    try {
      const { pricingId } = pricing;
      await prisma.pricingModel.deleteMany({ where: { pricingId } });
    } catch (err: any) {
      throw RESULT.PRICING_IS_USING();
    }
  }

  /** 가격 정책 이름으로 가격 정책을 가져옵니다. */
  public static async getPricingByName(
    name: string
  ): Promise<PricingModel | null> {
    const pricing = await prisma.pricingModel.findFirst({ where: { name } });
    return pricing;
  }
}
