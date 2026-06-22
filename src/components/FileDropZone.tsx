export function FileDropZone({
  loading,
  hasBook,
  filename,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onInputChange,
}: {
  loading: boolean;
  hasBook: boolean;
  filename: string;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={`flex shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
        hasBook ? "px-4 py-4" : "px-4 py-12"
      } ${
        isDragging
          ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept=".epub"
        className="sr-only"
        onChange={onInputChange}
      />
      {loading ? (
        <span className="animate-pulse text-[var(--text-muted)] text-sm">
          Opening book…
        </span>
      ) : hasBook ? (
        <span className="text-center text-[var(--text-muted)] text-sm">
          <span className="font-medium text-[var(--text)]">
            {filename}.epub
          </span>
          {" · "}
          tap or drop to replace
        </span>
      ) : (
        <>
          <svg
            aria-hidden="true"
            className="mb-3 h-10 w-10 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <span className="font-medium text-sm">Drop an EPUB here</span>
          <span className="mt-1 text-[var(--text-muted)] text-xs">
            or tap to browse
          </span>
          <span className="mt-3 text-[var(--text-muted)] text-xs">
            Runs in your browser — nothing is uploaded
          </span>
        </>
      )}
    </label>
  );
}
