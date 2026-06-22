import type { StepId } from "../lib/types";

export function StepToggle({
  id,
  label,
  description,
  enabled,
  onToggle,
}: {
  id: StepId;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (id: StepId) => void;
}) {
  return (
    <button
      type="button"
      id={`step-${id}`}
      onClick={() => onToggle(id)}
      className={`flex min-h-11 w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left ${
        enabled
          ? "border-accent/40 bg-accent-subtle"
          : "border-border bg-surface hover:border-muted"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          enabled ? "border-accent bg-accent" : "border-border"
        }`}
      >
        {enabled && (
          <svg
            aria-hidden="true"
            className="h-2.5 w-2.5 text-on-accent"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
        )}
      </span>
      <span>
        <span className="block font-medium text-sm">{label}</span>
        <span className="mt-0.5 block text-muted text-xs">{description}</span>
      </span>
    </button>
  );
}
