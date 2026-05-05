import { z } from "zod";

export const createFaqArticleSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    content: z.string().min(20, "Content must be at least 20 characters long"),
    category: z.string().min(1, "Category is required"),
    subCategoryId: z.string().min(1, "Subcategory is required"),
});

export const editFaqArticleSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    content: z.string().min(20, "Content must be at least 20 characters long"),
    category: z.string().min(1, "Category is required"),
    subCategoryId: z.string().min(1, "Subcategory is required"),
});