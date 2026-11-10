import { ZipConfig } from "@/common/zipFormat";

export const readU16 = (view: DataView, offset: number) =>
  view.getUint16(offset, ZipConfig.LITTLE_ENDIAN);

export const readU32 = (view: DataView, offset: number) =>
  view.getUint32(offset, ZipConfig.LITTLE_ENDIAN);

export const writeU16 = (view: DataView, offset: number, value: number) =>
  view.setUint16(offset, value, ZipConfig.LITTLE_ENDIAN);

export const writeU32 = (view: DataView, offset: number, value: number) =>
  view.setUint32(offset, value, ZipConfig.LITTLE_ENDIAN);
