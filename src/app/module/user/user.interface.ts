import { Role, UserStatus } from '../../../../generated/prisma/enums'

export interface IUpdateProfilePayload {
    name?: string
    avatarUrl?: string
}

export interface IUserFilters {
    role?: Role
    status?: UserStatus
    search?: string
}

export interface IChangeUserStatusPayload {
    status: UserStatus
}