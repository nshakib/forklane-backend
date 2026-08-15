import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'
import { IRequestUser } from '../auth/auth.interface.js'
import { DashboardService } from './dashboard.service.js'

const getUserOverview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser

    const result = await DashboardService.getUserOverview(user.userId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dashboard overview fetched successfully',
        data: result,
    })
})

const getOverview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser

    const result = await DashboardService.getOverview(user)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dashboard overview fetched successfully',
        data: result,
    })
})

export const DashboardController = {
    getUserOverview,
    getOverview,
}