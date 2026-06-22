import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-[0.625rem] border border-border bg-surface-raised px-3 py-2.5 text-sm text-text transition-shadow focus:border-accent focus:shadow-ring focus:outline-none ${className}`}
      {...props}
    />
  );
}
