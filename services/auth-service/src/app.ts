import express from "express";
import { responseMiddleware } from "@shared/auth/middleware";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());
app.use(responseMiddleware);

app.use("/auth", authRoutes);

export default app;
