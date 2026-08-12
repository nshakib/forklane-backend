import { z } from 'zod'

const createMenuItemSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        description: z.string().optional(),
        price: z.number().positive('Price must be greater than 0'),
        category: z.string().min(2, 'Category is required'),
        image: z.url('Image must be a valid URL').optional(),
        isAvailable: z.boolean().optional(),
        restaurantId: z.uuid('Invalid restaurant id'),
    }),
})

const updateMenuItemSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        category: z.string().min(2).optional(),
        image: z.url().optional(),
        isAvailable: z.boolean().optional(),
    }),
})

export const MenuItemValidation = {
    createMenuItemSchema,
    updateMenuItemSchema,
}