import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import config from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../utils/catchAsync.js";
import { jwtUtils } from "../utils/jwt";
import { z } from 'zod'

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                name: string;
                userId: string;
                role: Role;
            }
        }
    }
}

export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies.accessToken ?
            req.cookies.accessToken
            :
            req.headers.authorization?.startsWith("Bearer ") ?
                req.headers.authorization?.split(" ")[1]
                : req.headers.authorization;

        if (!token) {
            throw new Error("You are not logged in. Please log in to access this resource.");
        }

        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

        if (!verifiedToken.success) {
            throw new Error(verifiedToken.error);
        }

        const { email, name, userId, role } = verifiedToken.data as JwtPayload;

        if (requiredRoles.length && !requiredRoles.includes(role)) {
            throw new Error("Forbidden. You don't have permission to access this resource.");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.email !== email || user.name !== name || user.role !== role) {
            throw new Error("User not found. Please log in again.");
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new Error("Your account has been blocked. Please contact support.");
        }
        if (user.status === UserStatus.DELETED) {
            throw new Error("This account no longer exists.");
        }

        req.user = {
            email,
            name,
            userId,
            role
        }

        next();
    })
}

export const validateRequest = (schema: z.ZodType) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
            cookies: req.cookies,
        })
        next()
    })
