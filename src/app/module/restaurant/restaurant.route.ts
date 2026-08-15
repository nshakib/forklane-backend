import { Router } from 'express'
import { Role } from '../../../../generated/prisma/enums'
import { auth, validateRequest } from '../../middlewares/auth.js'
import { RestaurantController } from './restaurant.controller.js'
import { RestaurantValidation } from './restaurant.validation.js'


const router = Router()

router.get(
    '/',
    validateRequest(RestaurantValidation.getAllRestaurantsSchema),
    RestaurantController.getAllRestaurants
)

router.get(
    '/:slug',
    RestaurantController.getSingleRestaurant
)

router.post(
    '/',
    auth(Role.MANAGER, Role.ADMIN),
    validateRequest(RestaurantValidation.createRestaurantSchema),
    RestaurantController.createRestaurant
)

router.patch(
    '/:id',
    auth(Role.MANAGER, Role.ADMIN),
    validateRequest(RestaurantValidation.updateRestaurantSchema),
    RestaurantController.updateRestaurant
)

router.delete(
    '/:id',
    auth(Role.MANAGER, Role.ADMIN),
    RestaurantController.deleteRestaurant
)

export const RestaurantRoutes = router