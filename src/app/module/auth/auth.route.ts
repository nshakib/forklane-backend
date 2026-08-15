import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import { AuthController } from "./auth.controller.js";
import { auth, validateRequest } from "../../middlewares/auth";
import { AuthValidation } from "./auth.validation.js";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerUserSchema),
  AuthController.registerUser,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginUserSchema),
  AuthController.loginUser,
);

router.get(
  "/me",
  auth(Role.ADMIN, Role.MANAGER, Role.USER),
  AuthController.getMe,
);

router.post("/refresh-token", AuthController.refreshToken);

export const AuthRoutes = router;
