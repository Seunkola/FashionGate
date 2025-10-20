import express from "express";
import { responseMiddleware } from "@shared/auth/middleware";
import profileRoutes from "./routes/profile.routes";

const app = express();

app.use(express.json());
app.use(responseMiddleware);
app.use("/profile", profileRoutes);

export default app;
