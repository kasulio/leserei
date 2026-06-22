import type { LabelHTMLAttributes } from "react";

export function FieldLabel({
  htmlFor,
  className = "",
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { htmlFor: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-1.5 block font-semibold text-[0.6875rem] text-muted uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
