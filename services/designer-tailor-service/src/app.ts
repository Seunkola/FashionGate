import express from "express";
import { responseMiddleware } from "@shared/auth/middleware";
import portfolioRoutes from "./routes/portfolios.routes";

const app = express();

app.use(express.json());
app.use(responseMiddleware);

app.use("/portfolios", portfolioRoutes);

export default app;
