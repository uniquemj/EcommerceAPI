import {z} from 'zod';

export const categorySchema = z.object({
    title: z.string(),
    parent_category: z.string().optional()
})