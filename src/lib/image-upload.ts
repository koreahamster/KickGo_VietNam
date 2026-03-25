import type { ImagePickerAsset } from "expo-image-picker";

import type { SupportedTeamAssetContentType } from "@/types/team.types";

export function getSelectedImageContentType(asset: ImagePickerAsset): SupportedTeamAssetContentType | null {
  const mimeType = asset.mimeType?.toLowerCase();

  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif"
  ) {
    return mimeType;
  }

  const sourceName = (asset.fileName ?? asset.uri).toLowerCase();

  if (sourceName.endsWith(".jpg") || sourceName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (sourceName.endsWith(".png")) {
    return "image/png";
  }

  if (sourceName.endsWith(".webp")) {
    return "image/webp";
  }

  if (sourceName.endsWith(".heic")) {
    return "image/heic";
  }

  if (sourceName.endsWith(".heif")) {
    return "image/heif";
  }

  return null;
}

export function getSelectedImageFileName(
  asset: ImagePickerAsset,
  prefix: string,
  contentType: SupportedTeamAssetContentType,
): string {
  if (asset.fileName) {
    return asset.fileName;
  }

  const extension =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : contentType === "image/heic"
          ? "heic"
          : contentType === "image/heif"
            ? "heif"
            : "jpg";

  return `${prefix}-${Date.now()}.${extension}`;
}