import { z } from "zod";
import { SocialPostType, SocialPostStatus } from "@prisma/client";

export const POST_TYPES = Object.values(SocialPostType);
export const POST_STATUSES = Object.values(SocialPostStatus);

export const SOCIAL_CHANNELS = [
  "LinkedIn",
  "Facebook",
  "Instagram",
  "X",
  "Threads",
  "Telegram",
  "WhatsApp",
  "YouTube",
] as const;

export const postInputSchema = z.object({
  title: z.string().trim().max(160, "Title is too long").optional().transform((v) => (v ? v : null)),
  body: z.string().trim().min(5, "Content must be at least 5 characters").max(4000, "Content is too long"),
  type: z.nativeEnum(SocialPostType),
  channels: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : [])),
  hashtags: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(/[\s,]+/)
            .map((h) => h.replace(/^#/, "").trim())
            .filter(Boolean)
            .slice(0, 12)
        : []
    ),
});

export type PostFormValues = z.infer<typeof postInputSchema>;
