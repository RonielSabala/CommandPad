import { CloudProvider } from "@/common/enums";
import { GoogleDriveIcon, SharePointIcon } from "@/components/icons/providers";
import type { SVGProps } from "react";

export const PROVIDER_ICON: Record<
  CloudProvider,
  (props: SVGProps<SVGSVGElement>) => React.ReactElement
> = {
  [CloudProvider.SHAREPOINT]: SharePointIcon,
  [CloudProvider.GOOGLE_DRIVE]: GoogleDriveIcon,
};

export const PROVIDER_NAME: Record<CloudProvider, string> = {
  [CloudProvider.SHAREPOINT]: "SharePoint",
  [CloudProvider.GOOGLE_DRIVE]: "Google Drive",
};

export const PROVIDERS: readonly CloudProvider[] = [
  CloudProvider.SHAREPOINT,
  CloudProvider.GOOGLE_DRIVE,
];
