import { CloudProvider } from "@/common/enums";
import { GoogleDriveIcon, OneDriveIcon } from "@/components/icons/providers";
import type { SVGProps } from "react";

export const PROVIDER_ICON: Record<
  CloudProvider,
  (props: SVGProps<SVGSVGElement>) => React.ReactElement
> = {
  [CloudProvider.ONEDRIVE]: OneDriveIcon,
  [CloudProvider.GOOGLE_DRIVE]: GoogleDriveIcon,
};

export const PROVIDER_NAME: Record<CloudProvider, string> = {
  [CloudProvider.ONEDRIVE]: "OneDrive",
  [CloudProvider.GOOGLE_DRIVE]: "Google Drive",
};

export const PROVIDERS: readonly CloudProvider[] = [
  CloudProvider.ONEDRIVE,
  CloudProvider.GOOGLE_DRIVE,
];
