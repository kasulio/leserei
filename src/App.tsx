import { useCallback, useEffect, useMemo, useState } from "react";

import { loadEpub, type SpineItem } from "./lib/epub";
import { extractBook } from "./lib/extract";
import { bookToText, defaultOptions, runPipeline } from "./lib/pipeline";
import { PRESETS } from "./lib/presets";
import { STEP_UI } from "./lib/steps";
import type { Book, Options, OutputFormat, StepId } from "./lib/types";
import { useTheme } from "./useTheme";

function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
    >
      {theme === "dark" ? (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
    </button>
  );
}

function StepToggle({
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
      className={`flex min-h-11 w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
        enabled
          ? "border-[var(--accent)]/40 bg-[var(--accent-subtle)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          enabled
            ? "border-[var(--accent)] bg-[var(--accent)]"
            : "border-[var(--border)]"
        }`}
      >
        {enabled && (
          <svg
            aria-hidden="true"
            className="h-2.5 w-2.5 text-[var(--on-accent)]"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
        )}
      </span>
      <span>
        <span className="block font-medium text-sm">{label}</span>
        <span className="mt-0.5 block text-[var(--text-muted)] text-xs">
          {description}
        </span>
      </span>
    </button>
  );
}

function ControlsPanel({
  outputFormat,
  onOutputFormatChange,
  presetId,
  onPresetChange,
  activePreset,
  opts,
  onToggleStep,
  customizeOpen,
  onCustomizeOpenChange,
  onDownload,
  compact,
}: {
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
  presetId: string;
  onPresetChange: (id: string) => void;
  activePreset: (typeof PRESETS)[number];
  opts: Options;
  onToggleStep: (id: StepId) => void;
  customizeOpen: boolean;
  onCustomizeOpenChange: (open: boolean) => void;
  onDownload: () => void;
  compact?: boolean;
}) {
  const selectablePresets = PRESETS.filter((p) => p.id !== "custom");

  return (
    <div className={`flex flex-col gap-4 ${compact ? "" : ""}`}>
      <div
        className={compact ? "grid grid-cols-2 gap-3" : "flex flex-col gap-4"}
      >
        <div>
          <label htmlFor="output-format" className="field-label">
            Format
          </label>
          <select
            id="output-format"
            value={outputFormat}
            onChange={(e) =>
              onOutputFormatChange(e.target.value as OutputFormat)
            }
            className="select-field"
          >
            <option value="markdown">Markdown</option>
            <option value="plain">Plain text</option>
          </select>
        </div>

        <div>
          <label htmlFor="preset" className="field-label">
            Cleanup
          </label>
          <select
            id="preset"
            value={presetId === "custom" ? "custom" : presetId}
            onChange={(e) => onPresetChange(e.target.value)}
            className="select-field"
          >
            {selectablePresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            {presetId === "custom" && <option value="custom">Custom</option>}
          </select>
          {!compact && <p className="field-hint">{activePreset.description}</p>}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => onCustomizeOpenChange(!customizeOpen)}
          aria-expanded={customizeOpen}
          className="flex min-h-11 w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 font-medium text-sm transition-colors hover:border-[var(--text-muted)]"
        >
          Customize
          <svg
            aria-hidden="true"
            className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${customizeOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {customizeOpen && (
          <div className="mt-2 flex flex-col gap-2">
            {STEP_UI.map((step) => (
              <StepToggle
                key={step.id}
                id={step.id}
                label={step.label}
                description={step.description}
                enabled={opts[step.id]}
                onToggle={onToggleStep}
              />
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={onDownload} className="btn-primary w-full">
        Download .{outputFormat === "markdown" ? "md" : "txt"}
      </button>
    </div>
  );
}

export function App() {
  const [book, setBook] = useState<Book | null>(null);
  const [filename, setFilename] = useState("");
  const [presetId, setPresetId] = useState("default");
  const [opts, setOpts] = useState<Options>(defaultOptions);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("markdown");
  const [error, setError] = useState<string | null>(null);
  const [spine, setSpine] = useState<SpineItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState<"output" | "html">("output");
  const [sourceIndex, setSourceIndex] = useState(0);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    if (!spine) return;
    setBook(extractBook(spine, filename, outputFormat));
  }, [spine, filename, outputFormat]);

  const processedText = useMemo(() => {
    if (!book) return null;
    const result = runPipeline(book, opts, outputFormat);
    return bookToText(result, outputFormat);
  }, [book, opts, outputFormat]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".epub")) {
      setError("Please choose an .epub file");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const loaded = await loadEpub(file);
      const bookTitle = file.name.replace(/\.epub$/i, "");
      setSpine(loaded);
      setFilename(bookTitle);
      setSourceIndex(0);
      setPreviewMode("output");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const applyPreset = useCallback((id: string) => {
    if (id === "custom") return;
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setOpts({ ...preset.options });
  }, []);

  const toggleStep = useCallback((id: StepId) => {
    setPresetId("custom");
    setOpts((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const download = useCallback(() => {
    if (!processedText) return;
    const ext = outputFormat === "markdown" ? "md" : "txt";
    const mime =
      outputFormat === "markdown"
        ? "text/markdown;charset=utf-8"
        : "text/plain;charset=utf-8";
    const blob = new Blob([processedText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename || "output"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processedText, filename, outputFormat]);

  const sourceHtml = spine?.[sourceIndex] ?? null;
  const activePreset =
    presetId === "custom"
      ? PRESETS.find((p) => p.id === "custom")!
      : (PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]!);

  const previewMeta =
    previewMode === "output"
      ? `${book?.chapters.length ?? 0} chapters · ${processedText?.length.toLocaleString() ?? 0} chars`
      : `${spine?.length ?? 0} files · ${sourceHtml?.content.length.toLocaleString() ?? 0} chars`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-150">
      <header className="sticky top-0 z-20 border-[var(--border)] border-b bg-[var(--bg)]/90 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
          <div>
            <h1 className="flex items-center gap-1.5 font-bold font-display text-2xl tracking-tight">
              Leserei
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
            </h1>
            <p className="mt-0.5 text-[var(--text-muted)] text-sm">
              Turn ebooks into clean text
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main
        className={`mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 ${book ? "pb-36 lg:pb-8" : ""}`}
      >
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
            book ? "px-4 py-4" : "px-4 py-12"
          } ${
            isDragging
              ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".epub"
            className="sr-only"
            onChange={handleInputChange}
          />
          {loading ? (
            <span className="animate-pulse text-[var(--text-muted)] text-sm">
              Opening book…
            </span>
          ) : book ? (
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

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[var(--error)]/30 bg-[var(--error-bg)] px-4 py-2.5 text-[var(--error)] text-sm"
          >
            {error}
          </p>
        )}

        {book && (
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
            <aside className="hidden lg:block">
              <ControlsPanel
                outputFormat={outputFormat}
                onOutputFormatChange={setOutputFormat}
                presetId={presetId}
                onPresetChange={applyPreset}
                activePreset={activePreset}
                opts={opts}
                onToggleStep={toggleStep}
                customizeOpen={customizeOpen}
                onCustomizeOpenChange={setCustomizeOpen}
                onDownload={download}
              />
            </aside>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-0.5 rounded-lg bg-[var(--bg)] p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("output")}
                    className={`btn-ghost min-h-9 ${previewMode === "output" ? "btn-ghost-active" : ""}`}
                  >
                    Output
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("html")}
                    className={`btn-ghost min-h-9 ${previewMode === "html" ? "btn-ghost-active" : ""}`}
                  >
                    Source
                  </button>
                </div>
                <span className="text-[var(--text-muted)] text-xs">
                  {previewMeta}
                </span>
              </div>

              {previewMode === "html" && spine && spine.length > 0 && (
                <div className="mb-3">
                  <label htmlFor="chapter-file" className="field-label">
                    Chapter file
                  </label>
                  <select
                    id="chapter-file"
                    value={sourceIndex}
                    onChange={(e) => setSourceIndex(Number(e.target.value))}
                    className="select-field text-xs"
                  >
                    {spine.map((item, i) => (
                      <option key={item.href} value={i}>
                        {item.href}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div
                className="min-h-[50vh] flex-1 overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed lg:max-h-[calc(100vh-14rem)] lg:min-h-[calc(100vh-14rem)]"
                style={{ boxShadow: "var(--shadow-inset)" }}
              >
                {previewMode === "output"
                  ? (processedText ?? "")
                  : (sourceHtml?.content ?? "")}
              </div>
            </div>
          </div>
        )}
      </main>

      {book && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-[var(--border)] border-t bg-[var(--bg)]/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <ControlsPanel
            outputFormat={outputFormat}
            onOutputFormatChange={setOutputFormat}
            presetId={presetId}
            onPresetChange={applyPreset}
            activePreset={activePreset}
            opts={opts}
            onToggleStep={toggleStep}
            customizeOpen={customizeOpen}
            onCustomizeOpenChange={setCustomizeOpen}
            onDownload={download}
            compact
          />
        </div>
      )}
    </div>
  );
}

export default App;
