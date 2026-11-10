import { invoke } from "@tauri-apps/api/core";

export type LogLevel = "info" | "warn" | "error";

export async function writeLog(level: LogLevel, message: string, context?: unknown): Promise<void> {
  const detail = context === undefined ? message : `${message} | ${formatContext(context)}`;
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${detail}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);

  try {
    await invoke("write_log", { level, message: detail });
  } catch (error) {
    const pending = JSON.parse(localStorage.getItem("lumen-desk.pending-logs") ?? "[]") as string[];
    pending.push(line);
    localStorage.setItem("lumen-desk.pending-logs", JSON.stringify(pending.slice(-100)));
    console.warn("Native log sink unavailable; retained log in browser storage.", error);
  }

}

export function reportError(message: string, context?: unknown): void {
  void writeLog("error", message, context);
  window.dispatchEvent(new CustomEvent("lumen-error", { detail: message }));
}

function formatContext(context: unknown): string {
  if (context instanceof Error) return `${context.name}: ${context.message}\n${context.stack ?? ""}`;
  if (typeof context === "string") return context;
  try {
    return JSON.stringify(context);
  } catch {
    return String(context);
  }
}
