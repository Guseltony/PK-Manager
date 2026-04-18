export type NoteContentType = "markdown" | "richtext";

export interface RichTextDocument {
  type: "doc";
  version: 1;
  html: string;
}

const fallbackRichDoc = (): RichTextDocument => ({
  type: "doc",
  version: 1,
  html: "<p></p>",
});

export const serializeRichTextDocument = (html: string) =>
  JSON.stringify({
    ...fallbackRichDoc(),
    html: html.trim() || "<p></p>",
  });

export const parseRichTextDocument = (content: string): RichTextDocument => {
  if (!content?.trim()) return fallbackRichDoc();

  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "doc" && typeof parsed.html === "string") {
      return {
        type: "doc",
        version: 1,
        html: parsed.html || "<p></p>",
      };
    }
  } catch {
    return {
      type: "doc",
      version: 1,
      html: `<p>${escapeHtml(content)}</p>`,
    };
  }

  return fallbackRichDoc();
};

export const getRichTextHtml = (content: string) => parseRichTextDocument(content).html;

export const getPlainTextFromNote = (content: string, contentType: NoteContentType) => {
  if (contentType === "markdown") {
    return content.replace(/[#>*_`-]/g, " ").replace(/\s+/g, " ").trim();
  }

  const html = getRichTextHtml(content);
  return html
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const getPreviewTextFromNote = (content: string, contentType: NoteContentType, limit = 60) =>
  getPlainTextFromNote(content, contentType).slice(0, limit);

export const insertMarkdownAtCursor = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insertion: string,
) => {
  const nextValue = `${value.slice(0, selectionStart)}${insertion}${value.slice(selectionEnd)}`;
  const nextCursor = selectionStart + insertion.length;

  return {
    value: nextValue,
    selectionStart: nextCursor,
    selectionEnd: nextCursor,
  };
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
