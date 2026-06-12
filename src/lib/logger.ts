type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isDev = process.env.NODE_ENV === "development";

function formatEntry(entry: LogEntry): string {
  if (isDev) {
    const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
    const err = entry.error ? ` [${entry.error.name}: ${entry.error.message}]` : "";
    return `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.message}${ctx}${err}`;
  }
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  if (error instanceof Error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: isDev ? error.stack : undefined,
    };
  }

  const formatted = formatEntry(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
    log("error", message, context, error),
};
