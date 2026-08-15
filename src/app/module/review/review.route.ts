import { Router } from 'express'
import { Role } from '../../../../generated/prisma/enums'
import { ReviewController } from './review.controller.js'
import { ReviewValidation } from './review.validation.js'
import { auth, validateRequest } from '../../middlewares/auth.js'

const router = Router()

router.get(
    '/restaurant/:restaurantId',
    ReviewController.getRestaurantReviews
)

router.post(
    '/',
    auth(Role.USER, Role.MANAGER, Role.ADMIN),
    validateRequest(ReviewValidation.upsertReviewSchema),
    ReviewController.upsertReview
)

router.delete(
    '/:id',
    auth(Role.USER, Role.MANAGER, Role.ADMIN),
    ReviewController.deleteReview
)

export const ReviewRoutes = router