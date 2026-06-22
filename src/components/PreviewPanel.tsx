import type { SpineItem } from "../lib/epub";
import { Button } from "./ui/Button";
import { FieldLabel } from "./ui/FieldLabel";
import { Select } from "./ui/Select";

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
        <div className="flex items-center gap-0.5 rounded-lg bg-bg p-1">
          <Button
            variant="ghost"
            ghostActive={previewMode === "output" ? "output" : undefined}
            onClick={() => onPreviewModeChange("output")}
            className="min-h-9"
          >
            Output
          </Button>
          <Button
            variant="ghost"
            ghostActive={previewMode === "html" ? "source" : undefined}
            onClick={() => onPreviewModeChange("html")}
            className="min-h-9"
          >
            Source
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {previewMode === "output" && hasEdits && (
            <button
              type="button"
              onClick={onResetEdits}
              className="text-muted text-xs underline-offset-2 hover:text-text hover:underline"
            >
              Reset edits
            </button>
          )}
          <span className="text-muted text-xs">{previewMeta}</span>
        </div>
      </div>

      {previewMode === "html" && displaySpine && displaySpine.length > 0 && (
        <div className="mb-3 shrink-0">
          <FieldLabel htmlFor="chapter-file">Chapter file</FieldLabel>
          <Select
            id="chapter-file"
            value={sourceIndex}
            onChange={(e) => onSourceIndexChange(Number(e.target.value))}
            className="text-xs"
          >
            {displaySpine.map((item, i) => (
              <option key={item.href} value={i}>
                {item.href}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-auto rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
        {previewMode === "output" ? (
          <textarea
            value={displayText}
            onChange={(e) => onDisplayTextChange(e.target.value)}
            spellCheck={false}
            className="min-h-0 w-full flex-1 resize-none whitespace-pre-wrap border-none bg-transparent font-[inherit] text-sm text-text leading-relaxed focus:outline-none"
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
