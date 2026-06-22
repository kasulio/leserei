import type { HTMLAttributes } from "react";

export function FieldHint({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`mt-1 text-muted text-xs ${className}`} {...props} />;
}
