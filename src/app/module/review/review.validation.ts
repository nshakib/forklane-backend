import { z } from 'zod'

const upsertReviewSchema = z.object({
    body: z.object({
        restaurantId: z.uuid('Invalid restaurant id'),
        rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
        comment: z.string().max(1000, 'Comment is too long').optional(),
    }),
})

export const ReviewValidation = {
    upsertReviewSchema,
}