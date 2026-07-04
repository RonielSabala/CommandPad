import { useStore } from "@/store/store";
import { registerImportTrigger } from "@/utils/importTrigger";
import { useEffect, useRef } from "react";

export function RunbookImportInput() {
  const ref = useRef<HTMLInputElement>(null);
  const importRunbooks = useStore((state) => state.importRunbooks);

  useEffect(() => {
    registerImportTrigger(() => ref.current?.click());
    return () => registerImportTrigger(null);
  }, []);

  return (
    <input
      ref={ref}
      id="runbook-import-input"
      type="file"
      accept=".json"
      multiple
      onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length > 0) {
          void importRunbooks(files);
        }

        event.target.value = "";
      }}
    />
  );
}
