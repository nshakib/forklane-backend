import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'
import { IChangeUserStatusPayload, IUpdateProfilePayload, IUserFilters } from './user.interface.js'
import { UserService } from './user.service.js'
import { IRequestUser } from '../auth/auth.interface.js'

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const filters: IUserFilters = {
        role: req.query.role as IUserFilters['role'],
        status: req.query.status as IUserFilters['status'],
        search: req.query.search as string,
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const result = await UserService.getAllUsers(filters, page, limit)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users fetched successfully',
        data: result.users,
        meta: result.meta,
    })
})

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const result = await UserService.getSingleUser(userId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User fetched successfully',
        data: result,
    })
})

const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser
    const payload = req.body as IUpdateProfilePayload

    const result = await UserService.updateProfile(user.userId, payload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Profile updated successfully',
        data: result,
    })
})

const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { status } = req.body as IChangeUserStatusPayload

    const result = await UserService.changeUserStatus(userId, status)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User status updated successfully',
        data: result,
    })
})

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const result = await UserService.deleteUser(userId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User deleted successfully',
        data: result,
    })
})

export const UserController = {
    getAllUsers,
    getSingleUser,
    updateProfile,
    changeUserStatus,
    deleteUser
}