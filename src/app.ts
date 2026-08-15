import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { UserRoutes } from "./app/module/user/user.route";
import { RestaurantRoutes } from "./app/module/restaurant/restaurant.route";
import { MenuItemRoutes } from "./app/module/menuItem/menuItem.route";
import { OrderRoutes } from "./app/module/order/order.route";
import { ReviewRoutes } from "./app/module/review/review.route";
import { DashboardRoutes } from "./app/module/dashboard/dashboard.route";

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