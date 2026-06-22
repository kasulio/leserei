import { AppHeader } from "./components/AppHeader";
import { ControlsPanel } from "./components/ControlsPanel";
import { FileDropZone } from "./components/FileDropZone";
import { PreviewPanel } from "./components/PreviewPanel";
import { useBookApp } from "./hooks/useBookApp";

export function App() {
  const {
    filename,
    error,
    spine,
    book,
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
    setEditedText,
    previewMeta,
    sourceContent,
    controlsProps,
    handleDrop,
    handleInputChange,
  } = useBookApp();

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-bg text-text">
      <AppHeader />

      <div className="flex min-h-0 flex-col">
        <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
          <FileDropZone
            loading={loading}
            hasBook={!!book}
            filename={filename}
            isDragging={isDragging}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onInputChange={handleInputChange}
          />

          {error && (
            <p
              role="alert"
              className="shrink-0 rounded-lg border border-error/30 bg-error-bg px-4 py-2.5 text-error text-sm"
            >
              {error}
            </p>
          )}

          {spine && (
            <div className="flex min-h-0 flex-1 flex-col gap-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
              <aside className="hidden lg:block">
                <ControlsPanel {...controlsProps} />
              </aside>

              <PreviewPanel
                previewMode={previewMode}
                onPreviewModeChange={setPreviewMode}
                hasEdits={hasEdits}
                onResetEdits={() => setEditedText(null)}
                previewMeta={previewMeta}
                displaySpine={displaySpine}
                sourceIndex={sourceIndex}
                onSourceIndexChange={setSourceIndex}
                displayText={displayText}
                onDisplayTextChange={setEditedText}
                sourceContent={sourceContent}
              />
            </div>
          )}
        </main>

        {book && (
          <div className="shrink-0 border-border border-t bg-bg/95 px-4 py-3 backdrop-blur-sm lg:hidden">
            <ControlsPanel {...controlsProps} compact />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
