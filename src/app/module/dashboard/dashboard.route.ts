import { Router } from 'express'
import { Role } from '../../../../generated/prisma/enums'
import { DashboardController } from './dashboard.controller.js'
import { auth } from '../../middlewares/auth.js'

const router = Router()

router.get(
    '/me',
    auth(Role.USER, Role.MANAGER, Role.ADMIN),
    DashboardController.getUserOverview
)

router.get(
    '/overview',
    auth(Role.MANAGER, Role.ADMIN),
    DashboardController.getOverview
)

export const DashboardRoutes = router