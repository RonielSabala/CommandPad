import { AppMode, Theme } from "@/common/enums";
import { useStore } from "@/store/store";
import { useEffect } from "react";

export function useBodyClasses(): void {
  const mode = useStore((state) => state.mode);
  const theme = useStore((state) => state.theme);
  const ctrlHeld = useStore((state) => state.ctrlHeld);
  const altHeld = useStore((state) => state.altHeld);

  useEffect(() => {
    document.body.classList.toggle("read-mode", mode === AppMode.READ);
  }, [mode]);

  useEffect(() => {
    document.body.classList.toggle("ctrl-held", ctrlHeld);
  }, [ctrlHeld]);

  useEffect(() => {
    document.body.classList.toggle("alt-held", altHeld);
    if (!altHeld) {
      document.body.style.cursor = "";
    }
  }, [altHeld]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "theme-light",
      theme === Theme.LIGHT,
    );
  }, [theme]);
}
