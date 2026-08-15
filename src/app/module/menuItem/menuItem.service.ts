import { Role } from '../../../../generated/prisma/enums'
import { prisma } from '../../lib/prisma.js'
import { IRequestUser } from '../auth/auth.interface.js'
import { ICreateMenuItemPayload, IUpdateMenuItemPayload } from './menuItem.interface.js'

const assertCanManage = async (restaurantId: string, requestUser: IRequestUser) => {
    const restaurant = await prisma.restaurant.findFirst({
        where: { id: restaurantId, deletedAt: null },
    })

    if (!restaurant) {
        throw new Error('Restaurant not found')
    }

    if (requestUser.role !== Role.ADMIN && restaurant.ownerId !== requestUser.userId) {
        throw new Error('You do not have permission to manage this restaurant\'s menu')
    }

    return restaurant
}

const getMenuItems = async (restaurantId: string) => {
    const items = await prisma.menuItem.findMany({
        where: { restaurantId, deletedAt: null },
        orderBy: { category: 'asc' },
    })

    return items
}

const createMenuItem = async (payload: ICreateMenuItemPayload, requestUser: IRequestUser) => {
    await assertCanManage(payload.restaurantId, requestUser)

    const item = await prisma.menuItem.create({
        data: payload,
    })

    return item
}

const updateMenuItem = async (id: string, payload: IUpdateMenuItemPayload, requestUser: IRequestUser) => {
    const existing = await prisma.menuItem.findFirst({ where: { id, deletedAt: null } })
    if (!existing) {
        throw new Error('Menu item not found')
    }

    await assertCanManage(existing.restaurantId, requestUser)

    const item = await prisma.menuItem.update({
        where: { id },
        data: payload,
    })

    return item
}

const deleteMenuItem = async (id: string, requestUser: IRequestUser) => {
    const existing = await prisma.menuItem.findFirst({ where: { id, deletedAt: null } })
    if (!existing) {
        throw new Error('Menu item not found')
    }

    await assertCanManage(existing.restaurantId, requestUser)

    const item = await prisma.menuItem.update({
        where: { id },
        data: { deletedAt: new Date() },
    })

    return item
}

export const MenuItemService = {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
}