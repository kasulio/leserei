import type { SpineItem } from "../lib/epub";

export function PreviewPanel({
  previewMode,
  onPreviewModeChange,
  hasEdits,
  onResetEdits,
  previewMeta,
  displaySpine,
  sourceIndex,
  onSourceIndexChange,
  displayText,
  onDisplayTextChange,
  sourceContent,
}: {
  previewMode: "output" | "html";
  onPreviewModeChange: (mode: "output" | "html") => void;
  hasEdits: boolean;
  onResetEdits: () => void;
  previewMeta: string;
  displaySpine: SpineItem[] | null;
  sourceIndex: number;
  onSourceIndexChange: (index: number) => void;
  displayText: string;
  onDisplayTextChange: (text: string) => void;
  sourceContent: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 rounded-lg bg-[var(--bg)] p-1">
          <button
            type="button"
            onClick={() => onPreviewModeChange("output")}
            className={`btn-ghost min-h-9 ${previewMode === "output" ? "btn-ghost-active-output" : ""}`}
          >
            Output
          </button>
          <button
            type="button"
            onClick={() => onPreviewModeChange("html")}
            className={`btn-ghost min-h-9 ${previewMode === "html" ? "btn-ghost-active-source" : ""}`}
          >
            Source
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {previewMode === "output" && hasEdits && (
            <button
              type="button"
              onClick={onResetEdits}
              className="text-[var(--text-muted)] text-xs underline-offset-2 hover:text-[var(--text)] hover:underline"
            >
              Reset edits
            </button>
          )}
          <span className="text-[var(--text-muted)] text-xs">
            {previewMeta}
          </span>
        </div>
      </div>

      {previewMode === "html" && displaySpine && displaySpine.length > 0 && (
        <div className="mb-3 shrink-0">
          <label htmlFor="chapter-file" className="field-label">
            Chapter file
          </label>
          <select
            id="chapter-file"
            value={sourceIndex}
            onChange={(e) => onSourceIndexChange(Number(e.target.value))}
            className="select-field text-xs"
          >
            {displaySpine.map((item, i) => (
              <option key={item.href} value={i}>
                {item.href}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className="flex min-h-0 flex-1 flex-col overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed"
        style={{ boxShadow: "var(--shadow-inset)" }}
      >
        {previewMode === "output" ? (
          <textarea
            value={displayText}
            onChange={(e) => onDisplayTextChange(e.target.value)}
            spellCheck={false}
            className="editor-field min-h-0 flex-1 whitespace-pre-wrap"
            aria-label="Book text"
          />
        ) : (
          <div className="min-h-0 flex-1 whitespace-pre-wrap">
            {sourceContent}
          </div>
        )}
      </div>
    </div>
  );
}
