import { Router } from 'express'
import { Role } from '../../../../generated/prisma/enums'
import { OrderController } from './order.controller'
import { OrderValidation } from './order.validation'
import { auth, validateRequest } from '../../middlewares/auth'

const router = Router()

router.post(
    '/',
    auth(Role.USER, Role.MANAGER, Role.ADMIN),
    validateRequest(OrderValidation.createOrderSchema),
    OrderController.createOrder
)

router.get(
    '/mine',
    auth(Role.USER, Role.MANAGER, Role.ADMIN),
    OrderController.getMyOrders
)

router.get(
    '/',
    auth(Role.MANAGER, Role.ADMIN),
    validateRequest(OrderValidation.getAllOrdersSchema),
    OrderController.getAllOrders
)

router.patch(
    '/:id/cancel',
    auth(Role.USER, Role.MANAGER, Role.ADMIN),
    OrderController.cancelOrder
)

router.patch(
    '/:id/status',
    auth(Role.MANAGER, Role.ADMIN),
    validateRequest(OrderValidation.updateOrderStatusSchema),
    OrderController.updateOrderStatus
)

export const OrderRoutes = router