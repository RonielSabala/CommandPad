import { InputType } from "@/common/constants/dom";
import { useStore } from "@/store/store";
import { registerImportTrigger } from "@/utils/importTrigger";
import { useEffect, useRef } from "react";

export function RunbookImportInput() {
  const ref = useRef<HTMLInputElement>(null);
  const importRunbooks = useStore((state) => state.importRunbooks);

  useEffect(() => {
    registerImportTrigger((accept) => {
      const input = ref.current;
      if (input) {
        input.accept = accept;
        input.click();
      }
    });

    return () => registerImportTrigger(null);
  }, []);

  return (
    <input
      ref={ref}
      id="runbook-import-input"
      type={InputType.FILE}
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
