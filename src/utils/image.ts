import { ImageBlockConfig } from "@/common/config";
import { isString } from "./typeGuards";

const HTTP_PROTOCOLS: readonly string[] = ImageBlockConfig.HTTP_PROTOCOLS;

export function isAttachedImage(src: string): boolean {
  return src.startsWith(ImageBlockConfig.DATA_IMAGE_PREFIX);
}

function isHttpUrl(value: string): boolean {
  try {
    return HTTP_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isImageSrc(value: string): boolean {
  return isAttachedImage(value) || isHttpUrl(value);
}

export function normalizeImageSrc(value: unknown): string {
  if (!isString(value)) {
    return "";
  }

  const trimmed = value.trim();
  return isImageSrc(trimmed) ? trimmed : "";
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith(ImageBlockConfig.MIME_PREFIX);
}

/** Read an image file into the data URI stored on the block. */
export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
