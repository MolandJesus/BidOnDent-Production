export const canonicalStorageBuckets = {
  accountMedia: "bidondent-account-media",
  reportMedia: "bidondent-report-media",
  vehicleMedia: "bidondent-vehicle-media",
} as const;

export const legacyStorageBuckets = {
  damagePhotos: "bidondent-damage-photos",
  landingPageImages: "bidondent-landing-page-images",
  profiles: "bidondent-profiles",
  vehicles: "bidondent-vehicles",
} as const;

export const activeStorageBuckets = [
  ...Object.values(canonicalStorageBuckets),
  legacyStorageBuckets.profiles,
  legacyStorageBuckets.vehicles,
  legacyStorageBuckets.damagePhotos,
] as const;

export const supportedStorageBuckets = [
  ...Object.values(canonicalStorageBuckets),
  ...Object.values(legacyStorageBuckets),
] as const;

export const bucketMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export function isSupportedStorageBucket(bucket: string) {
  return supportedStorageBuckets.includes(bucket as (typeof supportedStorageBuckets)[number]);
}

export function isCanonicalStorageBucket(bucket: string) {
  return Object.values(canonicalStorageBuckets).includes(
    bucket as (typeof canonicalStorageBuckets)[keyof typeof canonicalStorageBuckets]
  );
}
