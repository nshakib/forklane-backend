import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./app/config/index.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import { notFound } from "./app/middlewares/notFound.js";
import { AuthRoutes } from "./app/module/auth/auth.route.js";
import { UserRoutes } from "./app/module/user/user.route.js";
import { RestaurantRoutes } from "./app/module/restaurant/restaurant.route.js";
import { MenuItemRoutes } from "./app/module/menuItem/menuItem.route.js";
import { OrderRoutes } from "./app/module/order/order.route.js";
import { ReviewRoutes } from "./app/module/review/review.route.js";
import { DashboardRoutes } from "./app/module/dashboard/dashboard.route.js";

const app: Application = express();

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/restaurants", RestaurantRoutes);
app.use("/api/v1/menu-items", MenuItemRoutes);
app.use("/api/v1/orders", OrderRoutes);
app.use("/api/v1/reviews", ReviewRoutes);
app.use("/api/v1/dashboard", DashboardRoutes);

app.get("/", async (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to ForkLane order.uk Backend",
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;