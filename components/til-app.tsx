"use client";

import { useState, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TilEntry } from "@/lib/til";
import {
  addEntry,
  getAllEntries,
  getEntryBySlug,
  searchByTag,
  deleteEntry,
} from "@/lib/til";

type View = "list" | "edit" | "view";

export default function TilApp() {
  const [entries, setEntries] = useState<TilEntry[]>(() => getAllEntries());
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");

  const refreshEntries = useCallback(() => {
    setEntries(getAllEntries());
  }, []);

  const selectedEntry = selectedSlug ? getEntryBySlug(selectedSlug) ?? null : null;

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (activeTag) {
      result = searchByTag(activeTag);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, activeTag, search]);

  function handleSelect(slug: string) {
    setSelectedSlug(slug);
    setView("view");
  }

  function handleNew() {
    setEditId(null);
    setEditTitle("");
    setEditContent("");
    setEditTags("");
    setView("edit");
  }

  function handleEdit() {
    if (!selectedEntry) return;
    setEditId(selectedEntry.id);
    setEditTitle(selectedEntry.title);
    setEditContent(selectedEntry.content);
    setEditTags(selectedEntry.tags.join(", "));
    setView("edit");
  }

  function handleSave() {
    const tags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (editId) {
      deleteEntry(editId);
    }
    const entry = addEntry(editTitle, editContent, tags);
    refreshEntries();
    setSelectedSlug(entry.slug);
    setView("view");
  }

  function handleDelete() {
    if (!selectedEntry) return;
    if (!window.confirm(`Delete "${selectedEntry.title}"? This cannot be undone.`)) return;
    deleteEntry(selectedEntry.id);
    refreshEntries();
    setSelectedSlug(null);
    setView("list");
  }

  function handleCancel() {
    if (selectedEntry) {
      setView("view");
    } else {
      setView("list");
    }
  }

  function formatDate(d: Date): string {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <aside className="flex w-80 shrink-0 flex-col border-r border-stone-200 bg-stone-50/50">
        <div className="border-b border-stone-200 p-4">
          <h1 className="font-serif text-xl font-bold tracking-tight text-stone-800">
            TIL
          </h1>
          <p className="text-xs text-stone-500">Today I Learned</p>
        </div>

        <div className="border-b border-stone-200 p-3">
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-stone-200 p-3">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                activeTag === null
                  ? "bg-amber-100 text-amber-800"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  tag === activeTag
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-sm text-stone-400">
              {search || activeTag
                ? "No entries match your filter."
                : "No entries yet. Create your first TIL!"}
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleSelect(entry.slug)}
                className={`w-full border-b border-stone-100 px-4 py-3 text-left transition-colors hover:bg-stone-100 ${
                  selectedSlug === entry.slug ? "bg-amber-50" : ""
                }`}
              >
                <h3 className="truncate font-serif text-sm font-semibold text-stone-800">
                  {entry.title}
                </h3>
                <p className="mt-0.5 text-xs text-stone-400">
                  {formatDate(entry.date)}
                </p>
                {entry.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="border-t border-stone-200 p-3">
          <button
            onClick={handleNew}
            className="w-full rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            + New Entry
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden bg-stone-50/30">
        {view === "edit" ? (
          <div className="flex h-full flex-col overflow-y-auto p-6">
            <h2 className="font-serif text-lg font-bold text-stone-800">
              {editId ? "Edit Entry" : "New Entry"}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="What did you learn?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Content (Markdown)
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={12}
                  className="mt-1 w-full resize-y rounded-md border border-stone-200 bg-white px-3 py-2 font-mono text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Write in markdown..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="react, nextjs, typescript"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!editTitle.trim() || !editContent.trim()}
                  className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editId ? "Update" : "Create"}
                </button>
                <button
                  onClick={handleCancel}
                  className="rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selectedEntry ? (
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-3">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>{formatDate(selectedEntry.date)}</span>
                {selectedEntry.tags.length > 0 && (
                  <>
                    <span>&middot;</span>
                    {selectedEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <article className="prose prose-stone prose-sm max-w-none flex-1 p-6">
              <h1 className="font-serif text-2xl font-bold text-stone-800">
                {selectedEntry.title}
              </h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedEntry.content}
              </ReactMarkdown>
            </article>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-stone-300">
                Welcome to TIL
              </h2>
              <p className="mt-2 text-sm text-stone-400">
                Select an entry or create a new one.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
