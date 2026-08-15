import { Prisma } from '../../../../generated/prisma/client'
import { OrderStatus, Role } from '../../../../generated/prisma/enums'
import { prisma } from '../../lib/prisma'
import { IRequestUser } from '../auth/auth.interface'

const getUserOverview = async (userId: string) => {
    const orders = await prisma.order.findMany({
        where: { userId },
        include: { restaurant: { select: { name: true, heroImage: true } } },
        orderBy: { createdAt: 'desc' },
    })

    const totalSpent = orders.reduce(
        (sum, o) => sum.add(o.total),
        new Prisma.Decimal(0)
    )

    return {
        orderCount: orders.length,
        totalSpent,
        recentOrders: orders.slice(0, 5),
    }
}

const getOverview = async (requestUser: IRequestUser) => {
    const isAdmin = requestUser.role === Role.ADMIN

    const restaurantScope = isAdmin
        ? { deletedAt: null }
        : { deletedAt: null, ownerId: requestUser.userId }

    const restaurants = await prisma.restaurant.findMany({
        where: restaurantScope,
        select: { id: true, name: true },
    })
    const restaurantIds = restaurants.map((r) => r.id)

    const orderWhere = isAdmin ? {} : { restaurantId: { in: restaurantIds } }

    const [userCount, orders] = await Promise.all([
        isAdmin ? prisma.user.count({ where: { status: 'ACTIVE' } }) : Promise.resolve(undefined),
        prisma.order.findMany({
            where: orderWhere,
            select: { total: true, createdAt: true, status: true, restaurantId: true },
        }),
    ])

    const revenue = orders.reduce((sum, o) => sum.add(o.total), new Prisma.Decimal(0))

    const byDay: Record<string, number> = {}
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        byDay[d.toISOString().slice(0, 10)] = 0
    }
    orders.forEach((o) => {
        const key = o.createdAt.toISOString().slice(0, 10)
        if (key in byDay) byDay[key] += 1
    })
    const ordersOverTime = Object.entries(byDay).map(([date, count]) => ({ date, count }))

    const statusCounts: Partial<Record<OrderStatus, number>> = {}
    orders.forEach((o) => {
        statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
    })
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

    const topRestaurants = restaurants
        .map((r) => ({
            name: r.name,
            revenue: orders
                .filter((o) => o.restaurantId === r.id)
                .reduce((sum, o) => sum.add(o.total), new Prisma.Decimal(0)),
        }))
        .sort((a, b) => b.revenue.comparedTo(a.revenue))
        .slice(0, 5)

    return {
        ...(isAdmin && { userCount }),
        restaurantCount: restaurants.length,
        orderCount: orders.length,
        revenue,
        ordersOverTime,
        ordersByStatus,
        topRestaurants,
    }
}

export const DashboardService = {
    getUserOverview,
    getOverview,
}