import { CloudProvider } from "@/common/enums";
import { Google, Windows, type Icon } from "react-bootstrap-icons";

export const PROVIDER_ICON: Record<CloudProvider, Icon> = {
  [CloudProvider.SHAREPOINT]: Windows,
  [CloudProvider.GOOGLE_DRIVE]: Google,
};

export const PROVIDER_NAME: Record<CloudProvider, string> = {
  [CloudProvider.SHAREPOINT]: "SharePoint",
  [CloudProvider.GOOGLE_DRIVE]: "Google Drive",
};

export const PROVIDERS: readonly CloudProvider[] = [
  CloudProvider.SHAREPOINT,
  CloudProvider.GOOGLE_DRIVE,
];
