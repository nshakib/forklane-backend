import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { catchAsync } from '../../utils/catchAsync'
import { sendResponse } from '../../utils/sendResponse'
import { IRequestUser } from '../auth/auth.interface'
import { ICreateRestaurantPayload, IRestaurantFilters, IUpdateRestaurantPayload } from './restaurant.interface'
import { RestaurantService } from './restaurant.service'

const getAllRestaurants = catchAsync(async (req: Request, res: Response) => {
    const filters: IRestaurantFilters = {
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        cuisine: typeof req.query.cuisine === 'string' ? req.query.cuisine : undefined,
        city: typeof req.query.city === 'string' ? req.query.city : undefined,
        price: req.query.price ? Number(req.query.price) : undefined,
        sort: req.query.sort as IRestaurantFilters['sort'],
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 9

    const result = await RestaurantService.getAllRestaurants(filters, page, limit)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Restaurants fetched successfully',
        data: result.restaurants,
        meta: result.meta,
    })
})

const getSingleRestaurant = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug as string
    const result = await RestaurantService.getSingleRestaurant(slug)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Restaurant fetched successfully',
        data: result,
    })
})

const createRestaurant = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser
    const payload = req.body as ICreateRestaurantPayload

    const result = await RestaurantService.createRestaurant(payload, user.userId)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Restaurant created successfully',
        data: result,
    })
})

const updateRestaurant = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id as string
    const user = req.user as unknown as IRequestUser
    const payload = req.body as IUpdateRestaurantPayload

    const result = await RestaurantService.updateRestaurant(userId, payload, user)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Restaurant updated successfully',
        data: result,
    })
})


const deleteRestaurant = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.id as string
    const user = req.user as unknown as IRequestUser
    const result = await RestaurantService.deleteRestaurant(restaurantId, user)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Restaurant deleted successfully',
        data: result,
    })
})

export const RestaurantController = {
    getAllRestaurants,
    getSingleRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
}