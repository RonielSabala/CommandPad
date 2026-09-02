import { ImageBlockConfig } from "@/common/config";
import { downloadBlob } from "./download";
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

function linkedImageName(src: string): string | undefined {
  try {
    const segment = new URL(src).pathname
      .split(ImageBlockConfig.PATH_SEPARATOR)
      .pop();
    return segment ? decodeURIComponent(segment) : undefined;
  } catch {
    return undefined;
  }
}

function hasExtension(name: string): boolean {
  const dot = name.lastIndexOf(ImageBlockConfig.EXTENSION_SEPARATOR);
  return dot > 0 && dot < name.length - 1;
}

function extensionForMimeType(mimeType: string): string {
  if (!mimeType.startsWith(ImageBlockConfig.MIME_PREFIX)) {
    return "";
  }

  const subtype = mimeType
    .slice(ImageBlockConfig.MIME_PREFIX.length)
    .split(ImageBlockConfig.MIME_PARAM_SEPARATOR)[0]
    .split(ImageBlockConfig.MIME_SUFFIX_SEPARATOR)[0]
    .trim();

  return subtype ? ImageBlockConfig.EXTENSION_SEPARATOR + subtype : "";
}

function imageFilename(
  src: string,
  alt: string | undefined,
  mimeType: string,
): string {
  const name =
    alt?.trim() ||
    (isAttachedImage(src) ? undefined : linkedImageName(src)) ||
    ImageBlockConfig.DEFAULT_DOWNLOAD_NAME;

  return hasExtension(name) ? name : name + extensionForMimeType(mimeType);
}

export async function downloadImage(src: string, alt?: string): Promise<void> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Image request failed: ${response.status}`);
  }

  const blob = await response.blob();
  downloadBlob(blob, imageFilename(src, alt, blob.type));
}
