import { z } from 'zod'
import { Role } from '../../../../generated/prisma/enums'

const registerUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        role: z.enum([Role.USER, Role.MANAGER], {
            error: () => 'Role must be either USER or MANAGER',
        }).optional(),
    }),
})

const loginUserSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
})

export const AuthValidation = {
    registerUserSchema,
    loginUserSchema,
}