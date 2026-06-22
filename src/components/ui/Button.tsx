import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost";
type GhostActive = "output" | "source";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "rounded-[0.625rem] bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-[background-color,transform] duration-150 hover:bg-accent-hover active:translate-y-px focus-visible:outline-none focus-visible:shadow-ring",
  ghost:
    "rounded-lg px-3 py-1.5 text-xs font-semibold text-muted transition-[color,background-color] duration-150 hover:text-text",
};

const ghostActiveClasses: Record<GhostActive, string> = {
  output: "bg-accent-subtle text-accent shadow-sm",
  source: "bg-source-subtle text-source shadow-sm",
};

export function Button({
  variant = "primary",
  ghostActive,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  ghostActive?: GhostActive;
}) {
  const classes = [
    variantClasses[variant],
    variant === "ghost" && ghostActive ? ghostActiveClasses[ghostActive] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type="button" className={classes} {...props} />;
}
