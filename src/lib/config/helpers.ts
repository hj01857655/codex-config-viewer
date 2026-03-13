import { TomlError } from "smol-toml";

import type {
  ConfigParseErrorShape,
  ConfigParseWarning,
  KeyValueItem,
  TomlObject,
} from "@/lib/config/types";

export function compactStringList(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

export function compactKeyValueList(items: KeyValueItem[]): KeyValueItem[] {
  return items
    .map((item) => ({
      key: item.key.trim(),
      value: item.value.trim(),
    }))
    .filter((item) => item.key.length > 0 && item.value.length > 0);
}

export function recordToKeyValueItems(record: unknown): KeyValueItem[] {
  if (!isPlainObject(record)) {
    return [];
  }

  return Object.entries(record).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : String(value),
  }));
}

export function keyValueItemsToRecord(items: KeyValueItem[]): Record<string, string> | undefined {
  const compacted = compactKeyValueList(items);

  if (compacted.length === 0) {
    return undefined;
  }

  return Object.fromEntries(compacted.map((item) => [item.key, item.value]));
}

export function keyValueItemsToBooleanRecord(
  items: KeyValueItem[],
  warnings: ConfigParseWarning[] = [],
  section = "features",
): Record<string, boolean> | undefined {
  const compacted = compactKeyValueList(items);

  if (compacted.length === 0) {
    return undefined;
  }

  const record: Record<string, boolean> = {};

  for (const item of compacted) {
    const normalized = item.value.trim().toLowerCase();
    if (normalized === "true") {
      record[item.key] = true;
      continue;
    }

    if (normalized === "false") {
      record[item.key] = false;
      continue;
    }

    warnings.push({
      message: `Ignored ${section} flag "${item.key}" because value is not a boolean.`,
    });
  }

  return Object.keys(record).length > 0 ? record : undefined;
}

export function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function parseString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

export function parseNumberLikeString(value: unknown): string {
  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return "";
}

export function isPlainObject(value: unknown): value is TomlObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function pruneEmptyObjects(value: unknown): unknown {
  if (Array.isArray(value)) {
    const next = value
      .map((entry) => pruneEmptyObjects(entry))
      .filter((entry) => {
        if (entry === undefined || entry === null) {
          return false;
        }

        if (typeof entry === "string") {
          return entry.length > 0;
        }

        if (Array.isArray(entry)) {
          return entry.length > 0;
        }

        if (isPlainObject(entry)) {
          return Object.keys(entry).length > 0;
        }

        return true;
      });

    return next.length > 0 ? next : undefined;
  }

  if (isPlainObject(value)) {
    const nextEntries = Object.entries(value)
      .map(([key, entry]) => [key, pruneEmptyObjects(entry)] as const)
      .filter(([, entry]) => {
        if (entry === undefined || entry === null) {
          return false;
        }

        if (typeof entry === "string") {
          return entry.length > 0;
        }

        if (Array.isArray(entry)) {
          return entry.length > 0;
        }

        if (isPlainObject(entry)) {
          return Object.keys(entry).length > 0;
        }

        return true;
      });

    return nextEntries.length > 0 ? Object.fromEntries(nextEntries) : undefined;
  }

  return value;
}

export function deepMerge(base: TomlObject, override: TomlObject): TomlObject {
  const output: TomlObject = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const existing = output[key];

    if (isPlainObject(existing) && isPlainObject(value)) {
      output[key] = deepMerge(existing, value);
      continue;
    }

    output[key] = value;
  }

  return output;
}

export function countFragmentNodes(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce<number>((total, entry) => total + countFragmentNodes(entry), 0);
  }

  if (isPlainObject(value)) {
    return Object.values(value).reduce<number>(
      (total, entry) => total + countFragmentNodes(entry),
      1,
    );
  }

  return 1;
}

export function normalizeNumberInput(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const normalized = Number(trimmed);

  return Number.isFinite(normalized) ? String(normalized) : "";
}

export function formatTomlError(error: unknown): ConfigParseErrorShape {
  if (error instanceof TomlError) {
    return {
      message: error.message,
      line: error.line,
      column: error.column,
      codeblock: error.codeblock,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "Unknown TOML error.",
  };
}
