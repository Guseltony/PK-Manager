import type { Note } from "../../types/note";
import { getPlainTextFromNote } from "./noteContent";

const WIKI_LINK_PATTERN = /\[\[([^[\]]+?)\]\]/g;

export function normalizeNoteTitle(title?: string | null) {
  return (title || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function extractWikiLinks(content: string) {
  return Array.from(content.matchAll(WIKI_LINK_PATTERN))
    .map((match) => match[1]?.trim())
    .filter(Boolean) as string[];
}

export function resolveWikiTarget(label: string, notes: Note[]) {
  const normalizedLabel = normalizeNoteTitle(label);
  return notes.find((note) => normalizeNoteTitle(note.title) === normalizedLabel);
}

export function replaceWikiLinksWithMarkdown(content: string, notes: Note[]) {
  return content.replace(WIKI_LINK_PATTERN, (_, rawLabel: string) => {
    const [targetLabel, alias] = rawLabel.split("|").map((value) => value.trim());
    const resolved = resolveWikiTarget(targetLabel, notes);
    const displayLabel = alias || targetLabel;

    if (!resolved) {
      return `**${displayLabel}**`;
    }

    return `[${displayLabel}](note:${resolved.id})`;
  });
}

export function getBacklinkedNotes(currentNote: Note, notes: Note[]) {
  const normalizedCurrentTitle = normalizeNoteTitle(currentNote.title);

  return notes.filter((note) => {
    if (note.id === currentNote.id || !normalizedCurrentTitle) {
      return false;
    }

    return extractWikiLinks(note.content).some(
      (label) => normalizeNoteTitle(label.split("|")[0]) === normalizedCurrentTitle,
    );
  });
}

export function getSearchSnippet(note: Note, query: string, maxLength = 120) {
  const normalizedQuery = query.trim().toLowerCase();
  const plainText = getPlainTextFromNote(note.content, note.contentType || "markdown");

  if (!normalizedQuery) {
    return plainText.slice(0, maxLength);
  }

  const matchIndex = plainText.toLowerCase().indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return plainText.slice(0, maxLength);
  }

  const snippetStart = Math.max(0, matchIndex - Math.floor((maxLength - normalizedQuery.length) / 2));
  const snippetEnd = Math.min(plainText.length, snippetStart + maxLength);
  const snippet = plainText.slice(snippetStart, snippetEnd).trim();

  return {
    text: snippet,
    highlight: plainText.slice(matchIndex, matchIndex + normalizedQuery.length),
    startsTrimmed: snippetStart > 0,
    endsTrimmed: snippetEnd < plainText.length,
  };
}
