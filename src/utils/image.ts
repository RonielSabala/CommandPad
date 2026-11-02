import { ImageBlockConfig } from "@/common/config";
import { BlockType, HttpMethod } from "@/common/enums";
import type { Block, ImageBlock } from "@/common/types";
import { downloadBlob } from "./download";
import { stripEnd, utf8ByteLength } from "./string";
import { isString } from "./typeGuards";

const HTTP_PROTOCOLS: readonly string[] = ImageBlockConfig.HTTP_PROTOCOLS;

export function isFilledImage(block: Block): block is ImageBlock {
  return block.type === BlockType.IMAGE && !!block.src;
}

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

function mimeSubtype(mimeType: string): string {
  if (!mimeType.startsWith(ImageBlockConfig.MIME_PREFIX)) {
    return "";
  }

  return mimeType
    .slice(ImageBlockConfig.MIME_PREFIX.length)
    .split(ImageBlockConfig.MIME_PARAM_SEPARATOR)[0]
    .split(ImageBlockConfig.MIME_SUFFIX_SEPARATOR)[0]
    .trim();
}

function extensionForMimeType(mimeType: string): string {
  const subtype = mimeSubtype(mimeType);
  return subtype ? ImageBlockConfig.EXTENSION_SEPARATOR + subtype : "";
}

export function imageFormatOfMimeType(mimeType: string): string | null {
  return mimeSubtype(mimeType).toUpperCase() || null;
}

/** A data URI's header and payload. */
function splitDataUri(src: string): { header: string; payload: string } {
  const separator = src.indexOf(ImageBlockConfig.DATA_SEPARATOR);
  return {
    header: src.slice(0, separator),
    payload: src.slice(separator + ImageBlockConfig.DATA_SEPARATOR.length),
  };
}

/** The decoded size of an attached image. */
export function dataUriByteLength(src: string): number {
  const { header, payload } = splitDataUri(src);

  if (header.endsWith(ImageBlockConfig.BASE64_MARKER)) {
    const unpadded = stripEnd(payload, ImageBlockConfig.BASE64_PADDING);
    const padding = payload.length - unpadded.length;

    return (
      Math.floor(
        (payload.length * ImageBlockConfig.BASE64_GROUP_BYTES) /
          ImageBlockConfig.BASE64_GROUP_CHARS,
      ) - padding
    );
  }

  try {
    return utf8ByteLength(decodeURIComponent(payload));
  } catch {
    return utf8ByteLength(payload);
  }
}

export function imageFormat(src: string): string | null {
  if (isAttachedImage(src)) {
    return imageFormatOfMimeType(
      splitDataUri(src).header.slice(ImageBlockConfig.DATA_PREFIX.length),
    );
  }

  const name = linkedImageName(src);
  if (!name || !hasExtension(name)) {
    return null;
  }

  return name
    .slice(name.lastIndexOf(ImageBlockConfig.EXTENSION_SEPARATOR) + 1)
    .toUpperCase();
}

export interface LinkedImageHead {
  bytes: number | null;
  mimeType: string | null;
}

/** A linked image's size and type. */
export async function probeLinkedImage(src: string): Promise<LinkedImageHead> {
  try {
    const response = await fetch(src, { method: HttpMethod.HEAD });
    if (!response.ok) {
      return { bytes: null, mimeType: null };
    }

    const length = Number(
      response.headers.get(ImageBlockConfig.CONTENT_LENGTH_HEADER),
    );

    return {
      bytes: Number.isFinite(length) && length > 0 ? length : null,
      mimeType: response.headers.get(ImageBlockConfig.CONTENT_TYPE_HEADER),
    };
  } catch {
    return { bytes: null, mimeType: null };
  }
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
