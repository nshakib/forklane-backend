import { Role } from '../../../../generated/prisma/enums'
import { prisma } from '../../lib/prisma.js'
import { IRequestUser } from '../auth/auth.interface.js'
import { ICreateRestaurantPayload, IRestaurantFilters, IUpdateRestaurantPayload } from './restaurant.interface.js'

const slugify = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const getAllRestaurants = async (filters: IRestaurantFilters, page = 1, limit = 9) => {
    const { search, cuisine, price, city, sort } = filters

    const where = {
        deletedAt: null,
        ...(cuisine && { cuisine }),
        ...(price && { priceLevel: price }),
        ...(city && { city }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { cuisine: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    }

    const orderBy =
        sort === 'rating' ? { rating: 'desc' as const }
        : sort === 'delivery' ? { deliveryMins: 'asc' as const }
        : sort === 'newest' ? { createdAt: 'desc' as const }
        : [{ isFeatured: 'desc' as const }, { rating: 'desc' as const }]

    const [restaurants, total] = await Promise.all([
        prisma.restaurant.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.restaurant.count({ where }),
    ])

    return {
        restaurants,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.max(Math.ceil(total / limit), 1),
        },
    }
}

const getSingleRestaurant = async (slug: string) => {
    const restaurant = await prisma.restaurant.findFirst({
        where: { slug, deletedAt: null },
        include: {
            menuItems: { where: { deletedAt: null } },
            reviews: { include: { user: { select: { name: true, avatarUrl: true } } } },
        },
    })

    if (!restaurant) {
        throw new Error('Restaurant not found')
    }

    const related = await prisma.restaurant.findMany({
        where: { cuisine: restaurant.cuisine, id: { not: restaurant.id }, deletedAt: null },
        take: 3,
    })

    return { restaurant, related }
}

const createRestaurant = async (payload: ICreateRestaurantPayload, ownerId: string) => {
    const slug = slugify(payload.name)

    const existingSlug = await prisma.restaurant.findUnique({ where: { slug } })
    if (existingSlug) {
        throw new Error('A restaurant with a similar name already exists')
    }

    const restaurant = await prisma.restaurant.create({
        data: {
            ...payload,
            slug,
            ownerId,
        },
    })

    return restaurant
}

const assertCanManage = (restaurant: { ownerId: string }, requestUser: IRequestUser) => {
    if (requestUser.role !== Role.ADMIN && restaurant.ownerId !== requestUser.userId) {
        throw new Error('You do not have permission to manage this restaurant')
    }
}

const updateRestaurant = async (id: string, payload: IUpdateRestaurantPayload, requestUser: IRequestUser) => {
    const existing = await prisma.restaurant.findFirst({ where: { id, deletedAt: null } })
    if (!existing) {
        throw new Error('Restaurant not found')
    }

    assertCanManage(existing, requestUser)

    const restaurant = await prisma.restaurant.update({
        where: { id },
        data: payload,
    })

    return restaurant
}

const deleteRestaurant = async (id: string, requestUser: IRequestUser) => {
    const existing = await prisma.restaurant.findFirst({ where: { id, deletedAt: null } })
    if (!existing) {
        throw new Error('Restaurant not found')
    }

    assertCanManage(existing, requestUser)

    const now = new Date()

    await prisma.$transaction([
        prisma.restaurant.update({ where: { id }, data: { deletedAt: now } }),
        prisma.menuItem.updateMany({ where: { restaurantId: id }, data: { deletedAt: now } }),
    ])

    return { id, deletedAt: now }
}

export const RestaurantService = {
    getAllRestaurants,
    getSingleRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
}