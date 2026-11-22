import { useStoreActions } from "@/store/store";
import { readSystemTheme, subscribeSystemTheme } from "@/utils/systemTheme";
import { useEffect } from "react";

/** Keep the store's system theme in step with the device's. */
export function useSystemTheme(): void {
  const { setSystemTheme } = useStoreActions();

  useEffect(() => {
    const sync = () => setSystemTheme(readSystemTheme());
    sync();

    return subscribeSystemTheme(sync);
  }, [setSystemTheme]);
}
