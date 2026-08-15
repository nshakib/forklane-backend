import { Role, UserStatus } from '../../../../generated/prisma/enums'
import { prisma } from '../../lib/prisma.js'
import { IUpdateProfilePayload, IUserFilters } from './user.interface.js'

const getAllUsers = async (filters: IUserFilters, page = 1, limit = 10) => {
    const { role, status, search } = filters

    const where = {
        ...(role && { role }),
        ...(status && { status }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            omit: { password: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ])

    return {
        users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.max(Math.ceil(total / limit), 1),
        },
    }
}

const getSingleUser = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        omit: { password: true },
    })

    if (!user) {
        throw new Error('User not found')
    }

    return user
}

const updateProfile = async (userId: string, payload: IUpdateProfilePayload) => {
    const { name, avatarUrl } = payload

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(name && { name }),
            ...(avatarUrl && { avatarUrl }),
        },
        omit: { password: true },
    })

    return user
}

const changeUserStatus = async (id: string, status: UserStatus) => {
    const existingUser = await prisma.user.findUnique({ where: { id } })

    if (!existingUser) {
        throw new Error('User not found')
    }

    if (existingUser.role === Role.ADMIN) {
        throw new Error('Cannot change status of an admin account')
    }

    const user = await prisma.user.update({
        where: { id },
        data: { status },
        omit: { password: true },
    })

    return user
}

const deleteUser = async (id: string) => {
    const existingUser = await prisma.user.findUnique({ where: { id } })

    if (!existingUser) {
        throw new Error('User not found')
    }

    if (existingUser.role === Role.ADMIN) {
        throw new Error('Cannot delete an admin account')
    }

    const user = await prisma.user.update({
        where: { id },
        data: { status: UserStatus.DELETED },
        omit: { password: true },
    })

    return user
}

export const UserService = {
    getAllUsers,
    getSingleUser,
    updateProfile,
    changeUserStatus,
    deleteUser,
}