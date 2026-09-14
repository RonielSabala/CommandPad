import { JustSyntax } from "@/common/variableSyntax";
import { RAW, checkResolution } from "@/test";

checkResolution("just", {
  variables: { NAME: "api", LONG: "api-gateway", WIDTH: "6" },
  cases: [
    ["{NAME|ljust(.; 6)}", "api..."],
    ["{NAME|rjust(0; 6)}", "000api"],
    ["{NAME|just(-; 7)}", "--api--"],
    // The odd character of padding goes to the end
    ["{NAME|just(-; 6)}", "-api--"],
    ["{NAME|ljust(.; {WIDTH})}", "api..."],
    ["{NAME|ljust(.; 4 + 2)}", "api..."],
    ["{NAME|ljust( ; 5)}", "api  "],
    // A value already that wide, or wider, is left alone
    ["{NAME|ljust(.; 3)}", "api"],
    ["{LONG|rjust(.; 5)}", "api-gateway"],
    ["{NAME|ljust(.; 0)}", "api"],
    // A fill longer than one character is repeated and cut to fit
    ["{NAME|ljust(ab; 8)}", "apiababa"],
    ["{NAME|rjust(ab; 6)}", "abaapi"],
  ],
});

checkResolution("just fails loudly", {
  variables: { NAME: "api" },
  cases: [
    ["{NAME|ljust}", RAW],
    ["{NAME|ljust()}", RAW],
    ["{NAME|ljust(.)}", RAW],
    ["{NAME|ljust(; 6)}", RAW],
    ["{NAME|ljust(.; )}", RAW],
    ["{NAME|ljust(.; -1)}", RAW],
    [`{NAME|ljust(.; ${JustSyntax.MAX_WIDTH + 1})}`, RAW],
    ["{NAME|ljust(.; wide)}", RAW],
  ],
});
