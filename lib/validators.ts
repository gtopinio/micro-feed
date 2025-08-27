import { z } from 'zod';

// Post creation validation
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(280, 'Post must be 280 characters or less')
    .trim(),
});

// Post update validation
export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(280, 'Post must be 280 characters or less')
    .trim(),
});

// Search/filter validation
export const searchSchema = z.object({
  query: z.string().optional(),
  filter: z.enum(['all', 'mine']).default('all'),
  cursor: z.string().optional(), // For pagination
});

// User profile validation
export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .trim(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
