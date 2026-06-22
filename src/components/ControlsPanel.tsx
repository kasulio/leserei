import { PRESETS } from "../lib/presets";
import { STEP_UI } from "../lib/steps";
import type { Options, OutputFormat, StepId } from "../lib/types";
import { StepToggle } from "./StepToggle";
import { Button } from "./ui/Button";
import { FieldHint } from "./ui/FieldHint";
import { FieldLabel } from "./ui/FieldLabel";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

export function ControlsPanel({
  outputFormat,
  onOutputFormatChange,
  presetId,
  onPresetChange,
  activePreset,
  opts,
  onToggleStep,
  onMaxBlankLinesChange,
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
  onMaxBlankLinesChange: (value: number) => void;
  customizeOpen: boolean;
  onCustomizeOpenChange: (open: boolean) => void;
  onDownload: () => void;
  compact?: boolean;
}) {
  const selectablePresets = PRESETS.filter((p) => p.id !== "custom");

  return (
    <div className="flex flex-col gap-4">
      <div
        className={compact ? "grid grid-cols-2 gap-3" : "flex flex-col gap-4"}
      >
        <div>
          <FieldLabel htmlFor="output-format">Format</FieldLabel>
          <Select
            id="output-format"
            value={outputFormat}
            onChange={(e) =>
              onOutputFormatChange(e.target.value as OutputFormat)
            }
          >
            <option value="markdown">Markdown</option>
            <option value="plain">Plain text</option>
          </Select>
        </div>

        <div>
          <FieldLabel htmlFor="preset">Cleanup</FieldLabel>
          <Select
            id="preset"
            value={presetId === "custom" ? "custom" : presetId}
            onChange={(e) => onPresetChange(e.target.value)}
          >
            {selectablePresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            {presetId === "custom" && <option value="custom">Custom</option>}
          </Select>
          {!compact && <FieldHint>{activePreset.description}</FieldHint>}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => onCustomizeOpenChange(!customizeOpen)}
          aria-expanded={customizeOpen}
          className="flex min-h-11 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 font-medium text-sm transition-colors hover:border-muted"
        >
          Customize
          <svg
            aria-hidden="true"
            className={`h-4 w-4 text-muted transition-transform ${customizeOpen ? "rotate-180" : ""}`}
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
            {opts.normalize && (
              <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
                <FieldLabel htmlFor="max-blank-lines">
                  Max blank lines
                </FieldLabel>
                <Input
                  id="max-blank-lines"
                  type="number"
                  min={0}
                  max={10}
                  value={opts.maxBlankLines}
                  onChange={(e) =>
                    onMaxBlankLinesChange(Number(e.target.value))
                  }
                  className="mt-1"
                />
                <FieldHint>
                  Collapse longer runs of empty lines while cleaning
                </FieldHint>
              </div>
            )}
          </div>
        )}
      </div>

      <Button variant="primary" onClick={onDownload} className="w-full">
        Download .txt
      </Button>
    </div>
  );
}
