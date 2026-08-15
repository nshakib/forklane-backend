import { Prisma } from '../../../../generated/prisma/client'
import { OrderStatus, Role } from '../../../../generated/prisma/enums'
import { prisma } from '../../lib/prisma'
import { IRequestUser } from '../auth/auth.interface'
import { ICreateOrderPayload, IOrderFilters } from './order.interface'

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    CONFIRMED: [OrderStatus.PREPARING],
    PREPARING: [OrderStatus.OUT_FOR_DELIVERY],
    OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
    DELIVERED: [],
    CANCELLED: [],
}

const createOrder = async (payload: ICreateOrderPayload, userId: string) => {
    const { restaurantId, items } = payload

    if (!items.length) {
        throw new Error('An order must contain at least one item')
    }

    const menuItems = await prisma.menuItem.findMany({
        where: {
            id: { in: items.map((i) => i.menuItemId) },
            restaurantId,
            deletedAt: null,
            isAvailable: true,
        },
    })

    if (menuItems.length !== items.length) {
        throw new Error('One or more menu items are unavailable or do not belong to this restaurant')
    }

    let total = new Prisma.Decimal(0)
    const orderItemsData = items.map((i) => {
        const menuItem = menuItems.find((m) => m.id === i.menuItemId)!
        total = total.add(menuItem.price.mul(i.quantity))
        return {
            menuItemId: menuItem.id,
            quantity: i.quantity,
            priceAtOrder: menuItem.price,
        }
    })

    const order = await prisma.order.create({
        data: {
            userId,
            restaurantId,
            total,
            items: { create: orderItemsData },
        },
        include: { items: { include: { menuItem: true } }, restaurant: true },
    })

    return order
}

const getMyOrders = async (userId: string, page = 1, limit = 10) => {
    const where = { userId }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: { restaurant: true, items: { include: { menuItem: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.order.count({ where }),
    ])

    return { orders, meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } }
}

const getAllOrders = async (filters: IOrderFilters, requestUser: IRequestUser, page = 1, limit = 10) => {
    const { status, restaurantId } = filters

    const where: Record<string, unknown> = {
        ...(status && { status }),
        ...(restaurantId && { restaurantId }),
    }

    if (requestUser.role === Role.MANAGER) {
        const ownedRestaurants = await prisma.restaurant.findMany({
            where: { ownerId: requestUser.userId, deletedAt: null },
            select: { id: true },
        })
        where.restaurantId = { in: ownedRestaurants.map((r) => r.id) }
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: { user: { select: { name: true, email: true } }, restaurant: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.order.count({ where }),
    ])

    return { orders, meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) } }
}

const cancelOrder = async (id: string, userId: string) => {
    const order = await prisma.order.findUnique({ where: { id } })

    if (!order) {
        throw new Error('Order not found')
    }

    if (order.userId !== userId) {
        throw new Error('You do not have permission to cancel this order')
    }

    if (order.status !== OrderStatus.PENDING) {
        throw new Error('This order can no longer be cancelled')
    }

    const updated = await prisma.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
    })

    return updated
}

const updateOrderStatus = async (id: string, nextStatus: OrderStatus, requestUser: IRequestUser) => {
    const order = await prisma.order.findUnique({ include: { restaurant: true }, where: { id } })

    if (!order) {
        throw new Error('Order not found')
    }

    if (requestUser.role !== Role.ADMIN && order.restaurant.ownerId !== requestUser.userId) {
        throw new Error('You do not have permission to update this order')
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status]
    if (!allowedNext.includes(nextStatus)) {
        throw new Error(`Cannot move an order from ${order.status} to ${nextStatus}`)
    }

    const updated = await prisma.order.update({
        where: { id },
        data: { status: nextStatus },
    })

    return updated
}

export const OrderService = {
    createOrder,
    getMyOrders,
    getAllOrders,
    cancelOrder,
    updateOrderStatus,
}