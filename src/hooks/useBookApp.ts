import { useCallback, useMemo, useState } from "react";

import { loadEpub, type SpineItem } from "../lib/epub";
import { extractDoc } from "../lib/extract";
import { filterSpine } from "../lib/frontMatter";
import { defaultOptions, runPipeline } from "../lib/pipeline";
import { PRESETS } from "../lib/presets";
import { serializeDoc } from "../lib/serialize";
import type { Options, OutputFormat, StepId } from "../lib/types";

export function useBookApp() {
  const [filename, setFilename] = useState("");
  const [presetId, setPresetId] = useState("reading");
  const [opts, setOpts] = useState<Options>(defaultOptions);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("markdown");
  const [error, setError] = useState<string | null>(null);
  const [spine, setSpine] = useState<SpineItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState<"output" | "html">("output");
  const [sourceIndex, setSourceIndex] = useState(0);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [editedText, setEditedText] = useState<string | null>(null);

  const displaySpine = useMemo(() => {
    if (!spine) return null;
    return filterSpine(spine, opts.removeFrontMatter);
  }, [spine, opts.removeFrontMatter]);

  const doc = useMemo(() => {
    if (!displaySpine) return null;
    return extractDoc(displaySpine, filename);
  }, [displaySpine, filename]);

  const processedText = useMemo(() => {
    if (!doc) return null;
    const result = runPipeline(doc, opts);
    return serializeDoc(result, outputFormat, opts);
  }, [doc, opts, outputFormat]);

  const displayText = editedText ?? processedText ?? "";
  const hasEdits = editedText !== null;

  const withEditGuard = useCallback(
    (action: () => void) => {
      if (hasEdits && !window.confirm("Your edits will be lost. Continue?")) {
        return;
      }
      action();
    },
    [hasEdits],
  );

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
      setEditedText(null);
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

  const applyPreset = useCallback(
    (id: string) => {
      if (id === "custom") return;
      const preset = PRESETS.find((p) => p.id === id);
      if (!preset) return;
      withEditGuard(() => {
        setEditedText(null);
        setPresetId(id);
        setOpts({ ...preset.options });
      });
    },
    [withEditGuard],
  );

  const toggleStep = useCallback(
    (id: StepId) => {
      withEditGuard(() => {
        setEditedText(null);
        setPresetId("custom");
        setOpts((prev) => ({ ...prev, [id]: !prev[id] }));
        if (id === "removeFrontMatter") setSourceIndex(0);
      });
    },
    [withEditGuard],
  );

  const handleMaxBlankLinesChange = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) return;
      const clamped = Math.min(10, Math.max(0, Math.round(value)));
      withEditGuard(() => {
        setEditedText(null);
        setPresetId("custom");
        setOpts((prev) => ({ ...prev, maxBlankLines: clamped }));
      });
    },
    [withEditGuard],
  );

  const handleOutputFormatChange = useCallback(
    (format: OutputFormat) => {
      if (format === outputFormat) return;
      withEditGuard(() => {
        setEditedText(null);
        setOutputFormat(format);
      });
    },
    [outputFormat, withEditGuard],
  );

  const download = useCallback(() => {
    if (!displayText) return;
    const blob = new Blob([displayText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename || "output"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [displayText, filename]);

  const sourceHtml = displaySpine?.[sourceIndex] ?? null;
  const activePreset =
    presetId === "custom"
      ? PRESETS.find((p) => p.id === "custom")!
      : (PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]!);

  const previewMeta =
    previewMode === "output"
      ? `${doc?.chapters.length ?? 0} chapters · ${displayText.length.toLocaleString()} chars${hasEdits ? " · edited" : ""}${opts.removeFrontMatter ? " · front matter skipped" : ""}`
      : `${displaySpine?.length ?? 0} files · ${sourceHtml?.content.length.toLocaleString() ?? 0} chars`;

  const controlsProps = {
    outputFormat,
    onOutputFormatChange: handleOutputFormatChange,
    presetId,
    onPresetChange: applyPreset,
    activePreset,
    opts,
    onToggleStep: toggleStep,
    onMaxBlankLinesChange: handleMaxBlankLinesChange,
    customizeOpen,
    onCustomizeOpenChange: setCustomizeOpen,
    onDownload: download,
  };

  return {
    filename,
    error,
    spine,
    doc,
    loading,
    isDragging,
    setIsDragging,
    displaySpine,
    displayText,
    hasEdits,
    previewMode,
    setPreviewMode,
    sourceIndex,
    setSourceIndex,
    editedText,
    setEditedText,
    previewMeta,
    sourceContent: sourceHtml?.content ?? "",
    controlsProps,
    handleDrop,
    handleInputChange,
  };
}
