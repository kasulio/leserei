import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-border border-b bg-bg/90 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
        <div>
          <h1 className="flex items-center gap-1.5 font-bold font-display text-2xl tracking-tight">
            Leserei
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          </h1>
          <p className="mt-0.5 text-muted text-sm">
            Turn ebooks into clean text
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
