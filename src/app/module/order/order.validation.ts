import { z } from 'zod'
import { OrderStatus } from '../../../../generated/prisma/enums'

const orderItemSchema = z.object({
    menuItemId: z.uuid('Invalid menu item id'),
    quantity: z.number().int().positive('Quantity must be at least 1'),
})

const createOrderSchema = z.object({
    body: z.object({
        restaurantId: z.uuid('Invalid restaurant id'),
        items: z.array(orderItemSchema).min(1, 'An order must contain at least one item'),
    }),
})

const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum(
            [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED],
            { error: 'Invalid order status' }
        ),
    }),
})

const getAllOrdersSchema = z.object({
    query: z.object({
        status: z.enum(Object.values(OrderStatus) as [string, ...string[]]).optional(),
        restaurantId: z.uuid().optional(),
        page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
        limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    }),
})

export const OrderValidation = {
    createOrderSchema,
    updateOrderStatusSchema,
    getAllOrdersSchema,
}