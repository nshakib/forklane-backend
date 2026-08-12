import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import { auth, validateRequest } from "../../middlewares/auth";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN),
  validateRequest(UserValidation.getAllUsersSchema),
  UserController.getAllUsers,
);

router.get("/:id", auth(Role.ADMIN), UserController.getSingleUser);

router.patch(
  "/profile",
  auth(Role.USER, Role.MANAGER, Role.ADMIN),
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateProfile,
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(UserValidation.changeUserStatusSchema),
  UserController.changeUserStatus,
);

router.delete("/:id", auth(Role.ADMIN), UserController.deleteUser);

export const UserRoutes = router;
