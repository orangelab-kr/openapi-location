/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const pricingName = '기본료';
const profileName = '미운영';
const regionName = '미운영';
const geofenceName = '미운영';
const geojson = {
  type: 'Polygon',
  coordinates: [
    [
      [125.73303222656251, 33.128351191631566],
      [127.35351562499999, 33.05932046347212],
      [130.0616455078125, 35.68853320738875],
      [129.012451171875, 38.865374851611634],
      [127.1063232421875, 38.33734763569314],
      [125.26611328125, 37.29153547292737],
      [124.73876953125, 33.947916898356404],
      [125.73303222656251, 33.128351191631566],
    ],
  ],
};

async function main() {
  const { profileId } = await getProfile();
  console.log(`기본 프로필 이름: ${profileId}`);

  const { pricingId } = await getPricing();
  console.log(`기본 가격 정책 이름: ${pricingId}`);

  const { regionId } = await getRegion(pricingId);
  console.log(`기본 지역: ${regionId}`);

  const { geofenceId } = await getGeofence(regionId, profileId);
  console.log(`기본 구역: ${geofenceId}`);

  console.log('모든 준비가 완료되었습니다.');
  process.exit(0);
}

async function getPricing() {
  let defaultPricing = await prisma.pricingModel.findFirst({
    where: { name: pricingName },
  });

  if (!defaultPricing) {
    console.log('- 기본 가격 정책이 없어 생성합니다.');
    defaultPricing = await prisma.pricingModel.create({
      data: {
        name: pricingName,
        standardPrice: 1200,
        nightlyPrice: 1200,
        standardTime: 5,
        maxPrice: null,
        perMinuteStandardPrice: 120,
        perMinuteNightlyPrice: 120,
        surchargePrice: 10000,
        helmetLostPrice: 15000,
      },
    });
  }

  return defaultPricing;
}

async function getProfile() {
  let notOperated = await prisma.profileModel.findFirst({
    where: { name: profileName },
  });

  if (!notOperated) {
    console.log('- 기본 지역 프로필이 없어 생성합니다.');
    notOperated = await prisma.profileModel.create({
      data: {
        name: profileName,
        priority: 0,
        speed: 10,
        color: '#FF0000',
        canReturn: true,
        hasSurcharge: true,
      },
    });
  }

  return notOperated;
}

async function getRegion(pricingId) {
  let region = await prisma.regionModel.findFirst({
    where: { name: regionName },
  });

  if (!region) {
    console.log('- 미운영 지역이 없어 생성합니다.');
    region = await prisma.regionModel.create({
      data: {
        name: regionName,
        pricing: { connect: { pricingId } },
        main: true,
      },
    });
  }

  return region;
}

async function getGeofence(regionId, profileId) {
  let geofence = await prisma.geofenceModel.findFirst({
    where: { name: geofenceName },
  });

  if (!geofence) {
    console.log('- 미운영 구역이 없어 생성합니다.');
    geofence = await prisma.geofenceModel.create({
      data: {
        name: geofenceName,
        region: { connect: { regionId } },
        profile: { connect: { profileId } },
        geojson: geojson,
        main: true,
      },
    });
  }

  return geofence;
}

main();
