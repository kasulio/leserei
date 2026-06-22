import type { SelectHTMLAttributes } from "react";

const fieldClasses =
  "w-full cursor-pointer appearance-none rounded-[0.625rem] border border-border bg-surface-raised py-2.5 pl-3 pr-9 text-sm text-text transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:shadow-ring";

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={`${fieldClasses} ${className}`} {...props}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
