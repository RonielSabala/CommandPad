import { RAW, checkResolution } from "@/test";

checkResolution("replace", {
  variables: {
    TICKET: "fix login timeout",
    PATH: "C:\\logs\\app",
    REPEATED: "aaaa",
  },
  cases: [
    ["{TICKET|replace( ;-)}", "fix-login-timeout"],
    ["{PATH|replace(\\;/)}", "C:/logs/app"],
    ["{TICKET|replace(missing;x)}", "fix login timeout"],
    ["{REPEATED|replace(aa;b)}", "bb"],
    ["{TICKET|replace(login; auth)}", "fix  auth timeout"],
    ["{TICKET|replace( ;)}", "fixlogintimeout"],
    ["{TICKET|replace(;-)}", RAW],
    ["{TICKET|replace(login)}", RAW],
    ["{TICKET|replace()}", RAW],
    ["{TICKET|replace}", RAW],
    ["{TICKET|replace(login;a;b)}", "fix a;b timeout"],
  ],
});
