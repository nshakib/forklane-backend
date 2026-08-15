import { prisma } from '../../lib/prisma'
import { ICreateReviewPayload } from './review.interface'

const recalculateRestaurantRating = async (restaurantId: string) => {
    const aggregate = await prisma.review.aggregate({
        where: { restaurantId },
        _avg: { rating: true },
        _count: true,
    })

    await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
            rating: aggregate._avg.rating ?? 0,
            reviewCount: aggregate._count,
        },
    })
}

const upsertReview = async (payload: ICreateReviewPayload, userId: string) => {
    const { restaurantId, rating, comment } = payload

    const restaurant = await prisma.restaurant.findFirst({
        where: { id: restaurantId, deletedAt: null },
    })

    if (!restaurant) {
        throw new Error('Restaurant not found')
    }

    const review = await prisma.review.upsert({
        where: { userId_restaurantId: { userId, restaurantId } },
        update: { rating, comment },
        create: { userId, restaurantId, rating, comment },
    })

    await recalculateRestaurantRating(restaurantId)

    return review
}

const getRestaurantReviews = async (restaurantId: string, page = 1, limit = 10) => {
    const where = { restaurantId }

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            include: { user: { select: { name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.review.count({ where }),
    ])

    return { reviews, meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } }
}

const deleteReview = async (id: string, userId: string) => {
    const review = await prisma.review.findUnique({ where: { id } })

    if (!review) {
        throw new Error('Review not found')
    }

    if (review.userId !== userId) {
        throw new Error('You do not have permission to delete this review')
    }

    await prisma.review.delete({ where: { id } })
    await recalculateRestaurantRating(review.restaurantId)

    return { id }
}

export const ReviewService = {
    upsertReview,
    getRestaurantReviews,
    deleteReview,
}