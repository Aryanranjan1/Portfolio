import { getDefaultSocialImage } from "@/db/queries/site";

export async function getDefaultSocialImageMetadata() {
  const image = await getDefaultSocialImage();
  if (!image) return undefined;
  return [{
    url: image.url,
    alt: image.altText || image.filename,
    ...(image.width ? { width: image.width } : {}),
    ...(image.height ? { height: image.height } : {}),
  }];
}
