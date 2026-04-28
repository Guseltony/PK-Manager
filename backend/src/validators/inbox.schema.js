import { z } from "zod";

const captureAttachmentSchema = z.object({
  name: z.string().trim().min(1),
  kind: z.enum(["file", "image", "video", "audio"]),
  mimeType: z.string().trim().min(1).optional(),
  size: z.number().int().min(0).optional(),
  extension: z.string().trim().min(1).optional(),
  previewUrl: z.string().trim().url().optional(),
});

export const inboxCaptureSchema = z.object({
  rawInput: z.string().trim().optional().default(""),
  source: z.string().trim().min(1).max(50).optional(),
  captureMethod: z.enum(["text", "voice", "file", "image", "video"]).optional(),
  transcript: z.string().trim().optional(),
  extractedText: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
  context: z.string().trim().optional(),
  attachments: z.array(captureAttachmentSchema).max(8).optional(),
}).refine((value) => {
  return Boolean(
    value.rawInput?.trim() ||
      value.transcript?.trim() ||
      value.extractedText?.trim() ||
      value.videoUrl?.trim() ||
      value.context?.trim() ||
      value.attachments?.length,
  );
}, {
  message: "Inbox input is required",
  path: ["rawInput"],
});

export const inboxListSchema = z.object({
  status: z.enum(["queued", "processing", "routed", "failed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const inboxRerouteSchema = z.object({
  targetType: z.enum(["task", "idea", "note", "journal", "dream"]),
});
