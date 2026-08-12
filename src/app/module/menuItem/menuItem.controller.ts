import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { catchAsync } from '../../utils/catchAsync'
import { sendResponse } from '../../utils/sendResponse'
import { IRequestUser } from '../auth/auth.interface'
import { ICreateMenuItemPayload, IUpdateMenuItemPayload } from './menuItem.interface'
import { MenuItemService } from './menuItem.service'

const getMenuItems = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId as string
    const result = await MenuItemService.getMenuItems(restaurantId)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Menu items fetched successfully',
        data: result,
    })
})

const createMenuItem = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser
    const payload = req.body as ICreateMenuItemPayload

    const result = await MenuItemService.createMenuItem(payload, user)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Menu item created successfully',
        data: result,
    })
})

const updateMenuItem = catchAsync(async (req: Request, res: Response) => {
    const menuId = req.params.menuId as string
    const user = req.user as unknown as IRequestUser
    const payload = req.body as IUpdateMenuItemPayload

    const result = await MenuItemService.updateMenuItem(menuId, payload, user)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Menu item updated successfully',
        data: result,
    })
})

const deleteMenuItem = catchAsync(async (req: Request, res: Response) => {
    const menuId = req.params.menuId as string
    const user = req.user as unknown as IRequestUser

    const result = await MenuItemService.deleteMenuItem(menuId, user)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Menu item deleted successfully',
        data: result,
    })
})

export const MenuItemController = {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
}