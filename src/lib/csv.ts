import type { ContentItem } from "./analytics";

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!;

    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"' && cell.length === 0) {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export type FieldKey =
  | "title"
  | "hook"
  | "topic"
  | "duration_seconds"
  | "views"
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "average_watch_time_seconds"
  | "retention_percent"
  | "posted_at";

export const FIELDS: {
  key: FieldKey;
  label: string;
  required?: boolean;
  numeric?: boolean;
  aliases: string[];
}[] = [
  {
    key: "title",
    label: "Video title",
    required: true,
    aliases: ["title", "name", "video title", "post title", "content title"],
  },
  {
    key: "hook",
    label: "Hook",
    aliases: ["hook", "opening", "intro"],
  },
  {
    key: "topic",
    label: "Topic",
    aliases: ["topic", "category", "theme", "content category"],
  },
  {
    key: "duration_seconds",
    label: "Duration (s)",
    numeric: true,
    aliases: [
      "duration_seconds",
      "duration",
      "video duration",
      "video length",
      "length seconds",
      "duration seconds",
    ],
  },
  {
    key: "views",
    label: "Views",
    numeric: true,
    aliases: ["views", "view count", "video views", "total views", "plays"],
  },
  {
    key: "likes",
    label: "Likes",
    numeric: true,
    aliases: ["likes", "like count", "likes (lifetime)"],
  },
  {
    key: "comments",
    label: "Comments",
    numeric: true,
    aliases: ["comments", "comment count"],
  },
  {
    key: "shares",
    label: "Shares",
    numeric: true,
    aliases: ["shares", "share count", "reposts"],
  },
  {
    key: "saves",
    label: "Saves",
    numeric: true,
    aliases: ["saves", "save count", "bookmarks"],
  },
  {
    key: "average_watch_time_seconds",
    label: "Avg. watch time (s)",
    numeric: true,
    aliases: [
      "average_watch_time_seconds",
      "average view duration",
      "average view duration seconds",
      "avg view duration",
      "average watch time",
      "avg watch time",
      "avg watch duration",
    ],
  },
  {
    key: "retention_percent",
    label: "Retention %",
    numeric: true,
    aliases: [
      "retention_percent",
      "audience retention",
      "retention",
      "avg retention",
      "average percentage viewed",
    ],
  },
  {
    key: "posted_at",
    label: "Posted at",
    aliases: [
      "posted_at",
      "date",
      "published",
      "publish date",
      "publish time",
      "video publish time",
      "published at",
      "publication date",
      "posted date",
    ],
  },
];

export type Mapping = Partial<Record<FieldKey, number>>;

function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/^\uFEFF/, "")
    .replace(/[_-]+/g, " ")
    .replace(/[()[\]%]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedHeader(value: string): string {
  return norm(value)
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const HEADER_ALIASES: Record<FieldKey, string[]> = {
  title: ["title", "name", "video title", "post title", "content title"],
  hook: ["hook", "opening", "intro"],
  topic: ["topic", "category", "theme", "content category"],
  duration_seconds: [
    "duration seconds",
    "duration second",
    "duration",
    "video duration",
    "video length",
    "length seconds",
  ],
  views: ["views", "view count", "video views", "total views", "plays"],
  likes: ["likes", "like count"],
  comments: ["comments", "comment count"],
  shares: ["shares", "share count", "reposts"],
  saves: ["saves", "save count", "bookmarks"],
  average_watch_time_seconds: [
    "average view duration",
    "average view duration seconds",
    "avg view duration",
    "average watch time",
    "avg watch time",
    "avg watch duration",
  ],
  retention_percent: [
    "audience retention",
    "retention",
    "avg retention",
    "average percentage viewed",
  ],
  posted_at: [
    "posted at",
    "date",
    "published",
    "publish date",
    "publish time",
    "video publish time",
    "published at",
    "publication date",
    "posted date",
  ],
};

const FIELD_PRIORITY: FieldKey[] = [
  "title",
  "posted_at",
  "duration_seconds",
  "average_watch_time_seconds",
  "views",
  "likes",
  "comments",
  "shares",
  "saves",
  "retention_percent",
  "topic",
  "hook",
];

function isTotalHeader(value: string): boolean {
  const header = normalizedHeader(value);

  return (
    header === "total" ||
    header === "totals" ||
    header === "grand total" ||
    header === "channel total"
  );
}

export function detectMapping(headers: string[]): Mapping {
  const normalized = headers.map(normalizedHeader);
  const mapping: Mapping = {};
  const usedColumns = new Set<number>();

  // Prefer exact matches before considering safe, field-specific alternatives.
  for (const fieldKey of FIELD_PRIORITY) {
    const aliases = HEADER_ALIASES[fieldKey].map(normalizedHeader);

    const index = normalized.findIndex(
      (header, i) => !usedColumns.has(i) && aliases.includes(header),
    );

    if (index >= 0) {
      mapping[fieldKey] = index;
      usedColumns.add(index);
    }
  }

  // Deliberately avoid broad substring matching.
  // For example, watch time in hours must not map to seconds,
  // and thumbnail CTR must never map to audience retention.

  return mapping;
}

export interface RowIssue {
  row: number;
  message: string;
}

function toNum(
  value: string | undefined,
  fieldKey: FieldKey,
): number | null | "invalid" {
  if (value === undefined || !value.trim()) return null;

  const raw = value.trim();

  // Accept time formats such as 0:00:14, 3:31, and 00:03:31.
  if (
    fieldKey === "duration_seconds" ||
    fieldKey === "average_watch_time_seconds"
  ) {
    const timeMatch = raw.match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);

    if (timeMatch) {
      const first = Number(timeMatch[1]);
      const second = Number(timeMatch[2]);
      const third =
        timeMatch[3] === undefined ? null : Number(timeMatch[3]);

      return third === null
        ? first * 60 + second
        : first * 3600 + second * 60 + third;
    }
  }

  const cleaned = raw.replace(/,/g, "").replace(/%/g, "").trim();
  if (!cleaned) return null;

  const number = Number(cleaned);

  return Number.isFinite(number) && number >= 0
    ? number
    : "invalid";
}

function toDate(value: string | undefined): string | null | "invalid" {
  if (!value?.trim()) return null;

  const raw = value.trim();

  // Preserve date-only values without timezone shifts.
  const dateOnly = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);

    const check = new Date(Date.UTC(year, month - 1, day));

    if (
      check.getUTCFullYear() === year &&
      check.getUTCMonth() === month - 1 &&
      check.getUTCDate() === day
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    return "invalid";
  }

  const date = new Date(raw);

  return Number.isNaN(date.getTime())
    ? "invalid"
    : date.toISOString().slice(0, 10);
}

export function buildItems(rows: string[][], mapping: Mapping) {
  const items: ContentItem[] = [];
  const errors: RowIssue[] = [];

  const get = (row: string[], key: FieldKey) =>
    mapping[key] === undefined ? undefined : row[mapping[key]!];

  rows.forEach((row, index) => {
    const rowNo = index + 2;
    const title = get(row, "title")?.trim();

    if (!title) {
      errors.push({ row: rowNo, message: "Missing title" });
      return;
    }

    // Skip YouTube Studio channel-level summary rows.
    if (isTotalHeader(title)) return;

    const numbers: Record<string, number | null> = {};
    let invalid = false;

    for (const field of FIELDS.filter((entry) => entry.numeric)) {
      const number = toNum(get(row, field.key), field.key);

      if (number === "invalid") {
        errors.push({
          row: rowNo,
          message: `${field.label} is not a valid non-negative number`,
        });
        invalid = true;
      } else {
        numbers[field.key] = number;
      }
    }

    const postedAt = toDate(get(row, "posted_at"));

    if (postedAt === "invalid") {
      errors.push({
        row: rowNo,
        message: "Posted at is not a recognisable date",
      });
      invalid = true;
    }

    if (invalid) return;

    const retention = numbers["retention_percent"] ?? null;

    if (retention !== null && retention > 100) {
      errors.push({
        row: rowNo,
        message: "Retention % above 100",
      });
      return;
    }

    const textValue = (key: FieldKey) =>
      get(row, key)?.trim() || null;

    items.push({
      id: `imp-${Date.now().toString(36)}-${index}`,
      title,
      hook: textValue("hook"),
      platform: "YouTube",
      topic: textValue("topic"),
      durationSec: numbers["duration_seconds"] ?? null,
      views: numbers["views"] ?? null,
      likes: numbers["likes"] ?? null,
      comments: numbers["comments"] ?? null,
      shares: numbers["shares"] ?? null,
      saves: numbers["saves"] ?? null,
      avgWatchSec: numbers["average_watch_time_seconds"] ?? null,
      retention,
      postedAt: postedAt as string | null,
    });
  });

  return { items, errors };
}

export const SAMPLE_CSV = `${FIELDS.map((field) => field.key).join(",")}
"My first video","Watch this first",Tutorials,480,12000,600,45,30,80,240,50,2026-01-15
`;