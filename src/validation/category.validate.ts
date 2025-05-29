import {z} from 'zod';

export const categorySchema = z.object({
    title: z.string().trim(),
    parent_category: z.string().trim().optional()
}).strict()

export const updateCategorySchema = z.object({
    title: z.string().trim().optional(),
    parent_category: z.string().trim().optional()
}).strict().refine((data)=>Object.keys(data).length > 0, {
    message: "At least on field must be provided for update: title, parent_category."
})