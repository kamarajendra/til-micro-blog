import { describe, it, expect, beforeEach, vi } from "vitest";
import { addEntry, getAllEntries, getEntryBySlug, searchByTag, deleteEntry } from "@/lib/til";

function createMockStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
}

beforeEach(() => {
  const mock = createMockStorage();
  vi.stubGlobal("localStorage", mock);
});

describe("TIL Library", () => {
  describe("addEntry", () => {
    it("adds an entry and returns it with generated slug and date", () => {
      const entry = addEntry("My First TIL", "Some content", ["react", "nextjs"]);
      expect(entry.id).toBeDefined();
      expect(entry.slug).toBe("my-first-til");
      expect(entry.title).toBe("My First TIL");
      expect(entry.content).toBe("Some content");
      expect(entry.tags).toEqual(["react", "nextjs"]);
      expect(entry.date).toBeInstanceOf(Date);
    });

    it("generates unique slugs by appending a counter", () => {
      const e1 = addEntry("Same Title", "a");
      const e2 = addEntry("Same Title", "b");
      expect(e1.slug).toBe("same-title");
      expect(e2.slug).toBe("same-title-1");
    });
  });

  describe("getAllEntries", () => {
    it("returns entries sorted by date descending", () => {
      const old = addEntry("Old Entry", "content", [], new Date("2024-01-01"));
      const mid = addEntry("Mid Entry", "content", [], new Date("2025-01-01"));
      const recent = addEntry("Recent Entry", "content", [], new Date("2026-01-01"));
      const entries = getAllEntries();
      expect(entries.map((e) => e.id)).toEqual([recent.id, mid.id, old.id]);
    });

    it("returns an empty array when no entries exist", () => {
      expect(getAllEntries()).toEqual([]);
    });
  });

  describe("getEntryBySlug", () => {
    it("returns the entry matching the slug", () => {
      addEntry("First", "hello", []);
      const e = addEntry("Second", "world", ["tag1"]);
      expect(getEntryBySlug(e.slug)?.id).toBe(e.id);
    });

    it("returns undefined for nonexistent slug", () => {
      expect(getEntryBySlug("nonexistent")).toBeUndefined();
    });
  });

  describe("searchByTag", () => {
    it("returns entries that contain the given tag", () => {
      const e1 = addEntry("React tip", "content", ["react"], new Date("2025-01-01"));
      addEntry("CSS tip", "content", ["css"], new Date("2025-01-02"));
      const e2 = addEntry("React deep dive", "content", ["react", "advanced"], new Date("2025-01-03"));
      const results = searchByTag("react");
      expect(results.map((e) => e.id)).toEqual([e2.id, e1.id]);
    });

    it("returns empty array for tag with no matches", () => {
      addEntry("Something", "content", ["other"]);
      expect(searchByTag("nonexistent")).toEqual([]);
    });
  });

  describe("deleteEntry", () => {
    it("removes an entry by id", () => {
      const e1 = addEntry("First", "a");
      const e2 = addEntry("Second", "b");
      deleteEntry(e1.id);
      const entries = getAllEntries();
      expect(entries.map((e) => e.id)).toEqual([e2.id]);
    });

    it("does nothing if id does not exist", () => {
      addEntry("First", "a");
      deleteEntry("nonexistent-id");
      expect(getAllEntries()).toHaveLength(1);
    });
  });
});
