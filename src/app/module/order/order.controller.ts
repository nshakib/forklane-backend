import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'
import { IRequestUser } from '../auth/auth.interface.js'
import { ICreateOrderPayload, IOrderFilters, IUpdateOrderStatusPayload } from './order.interface.js'
import { OrderService } from './order.service.js'

const createOrder = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser
    const payload = req.body as ICreateOrderPayload

    const result = await OrderService.createOrder(payload, user.userId)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Order placed successfully',
        data: result,
    })
})

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const result = await OrderService.getMyOrders(user.userId, page, limit)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your orders fetched successfully',
        data: result.orders,
        meta: result.meta,
    })
})

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser

    const filters: IOrderFilters = {
        status: req.query.status as IOrderFilters['status'],
        restaurantId: typeof req.query.restaurantId === 'string' ? req.query.restaurantId : undefined,
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const result = await OrderService.getAllOrders(filters, user, page, limit)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Orders fetched successfully',
        data: result.orders,
        meta: result.meta,
    })
})

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id as  string
    const user = req.user as unknown as IRequestUser

    const result = await OrderService.cancelOrder(orderId, user.userId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order cancelled successfully',
        data: result,
    })
})

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser
    const { status } = req.body as IUpdateOrderStatusPayload

    const orderId = req.params.id as string
    const result = await OrderService.updateOrderStatus(orderId, status, user)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order status updated successfully',
        data: result,
    })
})

export const OrderController = {
    createOrder,
    getMyOrders,
    getAllOrders,
    cancelOrder,
    updateOrderStatus,
}