export interface TilEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  date: Date;
  slug: string;
}

const STORAGE_KEY = "til_entries";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getEntries(): TilEntry[] {
  try {
    const raw =
      typeof localStorage !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    if (!raw) return [];
    return JSON.parse(raw, (key, value) => {
      if (key === "date") return new Date(value);
      return value;
    }) as TilEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: TilEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addEntry(
  title: string,
  content: string,
  tags: string[] = [],
  date?: Date
): TilEntry {
  const entries = getEntries();
  let slug = slugify(title);
  const existingSlugs = new Set(entries.map((e) => e.slug));
  if (existingSlugs.has(slug)) {
    let counter = 1;
    while (existingSlugs.has(`${slug}-${counter}`)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }
  const entry: TilEntry = {
    id: generateId(),
    title,
    content,
    tags,
    date: date ?? new Date(),
    slug,
  };
  entries.push(entry);
  saveEntries(entries);
  return entry;
}

export function getAllEntries(): TilEntry[] {
  const entries = getEntries();
  return entries.sort((a, b) => {
    const diff = b.date.getTime() - a.date.getTime();
    if (diff !== 0) return diff;
    return b.id.localeCompare(a.id);
  });
}

export function getEntryBySlug(slug: string): TilEntry | undefined {
  return getEntries().find((e) => e.slug === slug);
}

export function searchByTag(tag: string): TilEntry[] {
  return getEntries()
    .filter((e) => e.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
    .sort((a, b) => {
      const diff = b.date.getTime() - a.date.getTime();
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  saveEntries(entries);
}
