import { z } from 'zod'

const createRestaurantSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        tagline: z.string().optional(),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        cuisine: z.string().min(2, 'Cuisine is required'),
        priceLevel: z.number().int().min(1).max(4),
        deliveryMins: z.number().int().positive('Delivery estimate must be a positive number'),
        address: z.string().min(3, 'Address is required'),
        city: z.string().min(2, 'City is required'),
        heroImage: z.url('Hero image must be a valid URL'),
        gallery: z.array(z.url('Each gallery image must be a valid URL')).optional(),
        isFeatured: z.boolean().optional(),
    }),
})

const updateRestaurantSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        tagline: z.string().optional(),
        description: z.string().min(10).optional(),
        cuisine: z.string().min(2).optional(),
        priceLevel: z.number().int().min(1).max(4).optional(),
        deliveryMins: z.number().int().positive().optional(),
        address: z.string().min(3).optional(),
        city: z.string().min(2).optional(),
        heroImage: z.url().optional(),
        gallery: z.array(z.url()).optional(),
        isFeatured: z.boolean().optional(),
    }),
})

const getAllRestaurantsSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        cuisine: z.string().optional(),
        city: z.string().optional(),
        price: z.string().regex(/^[1-4]$/, 'Price must be a number between 1 and 4').optional(),
        sort: z.enum(['featured', 'rating', 'delivery', 'newest']).optional(),
        page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
        limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    }),
})

export const RestaurantValidation = {
    createRestaurantSchema,
    updateRestaurantSchema,
    getAllRestaurantsSchema,
}