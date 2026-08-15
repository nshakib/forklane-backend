import { OrderStatus } from '../../../../generated/prisma/enums'

export interface IOrderItemPayload {
    menuItemId: string
    quantity: number
}

export interface ICreateOrderPayload {
    restaurantId: string
    items: IOrderItemPayload[]
}

export interface IOrderFilters {
    status?: OrderStatus
    restaurantId?: string
}

export interface IUpdateOrderStatusPayload {
    status: OrderStatus
}