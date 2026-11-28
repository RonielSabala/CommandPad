import { VariableSyntax } from "@/common/variableSyntax";
import { sourceKey, sourceParam } from "@/utils/resolution";

import "./VariableSourceName.css";

/**
 * A span's `source`, with a blank's separator and name told apart from the
 * key.
 */
export function VariableSourceName({ source }: { source: string }) {
  const param = sourceParam(source);
  if (param === undefined) {
    return source;
  }

  return (
    <>
      {sourceKey(source)}

      <span className="variable-source-separator">
        {VariableSyntax.PARAM_SEPARATOR}
      </span>
      <span className="variable-source-param">{param}</span>
    </>
  );
}
