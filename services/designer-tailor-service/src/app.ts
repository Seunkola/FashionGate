import express from "express";
import { responseMiddleware } from "@shared/auth/middleware";
import portfolioRoutes from "./routes/portfolios.routes";
import serviceRoutes from "./routes/services.routes";

const app = express();

app.use(express.json());
app.use(responseMiddleware);

app.use("/portfolios", portfolioRoutes);
app.use("/services", serviceRoutes);

export default app;
