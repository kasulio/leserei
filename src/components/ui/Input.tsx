import type { InputHTMLAttributes } from "react";

const fieldClasses =
  "w-full rounded-[0.625rem] border border-border bg-surface-raised px-3 py-2.5 text-sm text-text transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:shadow-ring";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClasses} ${className}`} {...props} />;
}
