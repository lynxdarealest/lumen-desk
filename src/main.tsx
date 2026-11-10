import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { reportError } from "./logger";

window.addEventListener("error", (event) => {
  reportError("Ứng dụng gặp lỗi frontend", event.error ?? event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  reportError("Ứng dụng gặp lỗi promise", event.reason);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode><App /></StrictMode>
);
