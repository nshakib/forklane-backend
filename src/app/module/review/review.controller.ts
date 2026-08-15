import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'
import { IRequestUser } from '../auth/auth.interface.js'
import { ICreateReviewPayload } from './review.interface.js'
import { ReviewService } from './review.service.js'

const upsertReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser
    const payload = req.body as ICreateReviewPayload

    const result = await ReviewService.upsertReview(payload, user.userId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review submitted successfully',
        data: result,
    })
})

const getRestaurantReviews = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const restaurantId = req.params.id as string

    const result = await ReviewService.getRestaurantReviews(restaurantId, page, limit)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews fetched successfully',
        data: result.reviews,
        meta: result.meta,
    })
})

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const reviewId = req.params.id as string
    const user = req.user as unknown as IRequestUser

    const result = await ReviewService.deleteReview(reviewId, user.userId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review deleted successfully',
        data: result,
    })
})

export const ReviewController = {
    upsertReview,
    getRestaurantReviews,
    deleteReview,
}