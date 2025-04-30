import {z} from 'zod';

export const categorySchema = z.object({
    title: z.string().trim(),
    parent_category: z.string().trim().optional()
}).strict()