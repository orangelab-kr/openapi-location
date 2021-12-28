import { Prisma, ProfileModel } from '@prisma/client';
import { Joi, PATTERN, prisma, RESULT } from '..';

export class Profile {
  /** 프로파일 목록 조회 */
  public static async getProfiles(props: {
    take?: number;
    skip?: number;
    search?: string;
    orderByField?: 'name' | 'createdAt';
    orderBySort?: 'asc' | 'desc';
  }): Promise<{ total: number; profiles: ProfileModel[] }> {
    const schema = await Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'name',
        'priority',
        'createdAt'
      ).default('name'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT.valid('asc', 'desc'),
    });

    const { take, skip, search, orderByField, orderBySort } =
      await schema.validateAsync(props);
    const where: Prisma.ProfileModelWhereInput = {};
    const orderBy = { [orderByField]: orderBySort };
    if (search) where.name = { contains: search };
    const [total, profiles] = await prisma.$transaction([
      prisma.profileModel.count({ where }),
      prisma.profileModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { profiles, total };
  }

  /** 프로파일을 가져옵니다. 없을 경우 오류를 발생시킵니다. */
  public static async getProfileOrThrow(
    profileId: string
  ): Promise<ProfileModel> {
    const profile = await Profile.getProfile(profileId);
    if (!profile) throw RESULT.CANNOT_FIND_PROFILE();
    return profile;
  }

  /** 프로파일을 가져옵니다. */
  public static async getProfile(
    profileId: string
  ): Promise<ProfileModel | null> {
    const profile = await prisma.profileModel.findFirst({
      where: { profileId },
    });

    return profile;
  }

  /** 프로파일을 생성합니다. */
  public static async createProfile(props: {
    name: string;
    priority: number;
    speed?: number;
    color: string;
    canReturn: boolean;
    hasSurcharge: boolean;
  }): Promise<ProfileModel> {
    const schema = Joi.object({
      name: PATTERN.PROFILE.NAME,
      priority: PATTERN.PROFILE.PRIORITY,
      speed: PATTERN.PROFILE.SPEED,
      color: PATTERN.PROFILE.COLOR,
      canReturn: PATTERN.PROFILE.CAN_RETURN,
      hasSurcharge: PATTERN.PROFILE.HAS_SURCHARGE,
    });

    const { name, priority, speed, color, canReturn, hasSurcharge } =
      await schema.validateAsync(props);
    const exists = await Profile.getProfileByName(name);
    if (exists) throw RESULT.ALREADY_EXISTS_PROFILE_NAME();
    const profile = await prisma.profileModel.create({
      data: {
        name,
        priority,
        speed,
        color,
        canReturn,
        hasSurcharge,
      },
    });

    return profile;
  }

  /** 프로파일을 수정합니다. */
  public static async modifyProfile(
    profile: ProfileModel,
    props: {
      name?: string;
      priority?: number;
      speed?: number;
      color?: string;
      canReturn?: boolean;
      hasSurcharge?: boolean;
    }
  ): Promise<ProfileModel> {
    const schema = Joi.object({
      name: PATTERN.PROFILE.NAME.optional(),
      priority: PATTERN.PROFILE.PRIORITY.optional(),
      speed: PATTERN.PROFILE.SPEED.optional(),
      color: PATTERN.PROFILE.COLOR.optional(),
      canReturn: PATTERN.PROFILE.CAN_RETURN.optional(),
      hasSurcharge: PATTERN.PROFILE.HAS_SURCHARGE.optional(),
    });

    const { name, priority, speed, color, canReturn, hasSurcharge } =
      await schema.validateAsync(props);
    if (name && profile.name !== name) {
      const exists = await Profile.getProfileByName(name);
      if (exists) throw RESULT;
    }

    const { profileId } = profile;
    return prisma.profileModel.update({
      where: { profileId },
      data: {
        name,
        priority,
        speed,
        color,
        canReturn,
        hasSurcharge,
      },
    });
  }

  /** 프로파일을 삭제합니다. */
  public static async deleteProfile(profile: ProfileModel): Promise<void> {
    try {
      const { profileId } = profile;
      await prisma.profileModel.deleteMany({ where: { profileId } });
    } catch (err: any) {
      throw RESULT.PROFILE_IS_USING();
    }
  }

  /** 프로파일 이름으로 프로파일을 가져옵니다. */
  public static async getProfileByName(
    name: string
  ): Promise<ProfileModel | null> {
    const profile = await prisma.profileModel.findFirst({ where: { name } });
    return profile;
  }
}
