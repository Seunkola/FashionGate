import express from "express";
import { responseMiddleware } from "@shared/auth/middleware";
import bookingRoutes from "./routes/booking.routes";

const app = express();

app.use(express.json());
app.use(responseMiddleware);
app.use("/bookings", bookingRoutes);

export default app;
