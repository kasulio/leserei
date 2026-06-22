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
if (!import.meta.hot.data.root) {
  import.meta.hot.data.root = createRoot(elem);
}
import.meta.hot.data.root.render(app);
