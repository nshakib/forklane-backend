import { z } from 'zod'
import { Role, UserStatus } from '../../../../generated/prisma/enums'

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        avatarUrl: z.string().url('Avatar must be a valid URL').optional(),
    }),
     query: z.object({}),
    params: z.object({}),
    cookies: z.object({}),
})

const changeUserStatusSchema = z.object({
    body: z.object({
        status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED], {
            error: () => 'Status must be either ACTIVE or BLOCKED',
        }),
    }),
    query: z.object({}),
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
  cookies: z.object({}),
})

const getAllUsersSchema = z.object({
    query: z.object({
        role: z.enum([Role.USER, Role.MANAGER, Role.ADMIN]).optional(),
        status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]).optional(),
        search: z.string().optional(),
        page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
        limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    }),
    params: z.object({}),
    cookies: z.object({}),
})



export const UserValidation = {
    updateProfileSchema,
    changeUserStatusSchema,
    getAllUsersSchema,
}