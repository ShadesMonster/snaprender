import { z } from 'zod';

export const pdfSchema = z.object({
  html: z.string().min(1, 'html is required'),
  format: z.enum(['A4', 'Letter', 'Legal']).default('A4'),
  landscape: z.boolean().default(false),
  margin: z
    .object({
      top: z.union([z.number().min(0), z.string()]).optional(),
      right: z.union([z.number().min(0), z.string()]).optional(),
      bottom: z.union([z.number().min(0), z.string()]).optional(),
      left: z.union([z.number().min(0), z.string()]).optional(),
    })
    .optional(),
  scale: z.number().min(0.1).max(2.0).default(1),
  printBackground: z.boolean().default(true),
});

export const screenshotSchema = z
  .object({
    url: z.string().url().optional(),
    html: z.string().min(1).optional(),
    width: z.number().int().min(1).max(3840).default(1280),
    height: z.number().int().min(1).max(2160).default(800),
    fullPage: z.boolean().default(false),
    format: z.enum(['png', 'jpeg']).default('png'),
    quality: z.number().int().min(1).max(100).default(80),
    delay: z.number().int().min(0).max(10000).default(0),
  })
  .refine((data) => data.url || data.html, {
    message: 'Either url or html is required',
  });
