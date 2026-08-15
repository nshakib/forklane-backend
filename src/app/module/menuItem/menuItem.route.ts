import { Router } from 'express'
import { Role } from '../../../../generated/prisma/enums'
import { MenuItemController } from './menuItem.controller'
import { auth, validateRequest } from '../../middlewares/auth'
import { MenuItemValidation } from './menuItem.validation'


const router = Router()

router.get(
    '/restaurant/:restaurantId',
    MenuItemController.getMenuItems
)

router.post(
    '/',
    auth(Role.MANAGER, Role.ADMIN),
    validateRequest(MenuItemValidation.createMenuItemSchema),
    MenuItemController.createMenuItem
)

router.patch(
    '/:id',
    auth(Role.MANAGER, Role.ADMIN),
    validateRequest(MenuItemValidation.updateMenuItemSchema),
    MenuItemController.updateMenuItem
)

router.delete(
    '/:id',
    auth(Role.MANAGER, Role.ADMIN),
    MenuItemController.deleteMenuItem
)

export const MenuItemRoutes = router