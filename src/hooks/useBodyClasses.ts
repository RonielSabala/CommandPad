import { CssClass } from "@/common/constants/css";
import { AppMode, Theme } from "@/common/enums";
import { useStore } from "@/store/store";
import { useEffect } from "react";

export function useBodyClasses(): void {
  const mode = useStore((state) => state.mode);
  const theme = useStore((state) => state.theme);
  const ctrlHeld = useStore((state) => state.ctrlHeld);
  const altHeld = useStore((state) => state.altHeld);

  useEffect(() => {
    document.body.classList.toggle(CssClass.READ_MODE, mode === AppMode.READ);
  }, [mode]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      CssClass.THEME_LIGHT,
      theme === Theme.LIGHT,
    );
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle(CssClass.CTRL_HELD, ctrlHeld);
  }, [ctrlHeld]);

  useEffect(() => {
    document.body.classList.toggle(CssClass.ALT_HELD, altHeld);
    if (!altHeld) {
      document.body.style.cursor = "";
    }
  }, [altHeld]);
}
