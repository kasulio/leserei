import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
// biome-ignore lint/suspicious/noAssignInExpressions: its from bun documentation, should be okay
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
