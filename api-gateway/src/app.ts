import Fastify, { FastifyInstance } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyHttpProxy from "@fastify/http-proxy";
import { authenticateRequest } from "./middleware/jwt";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  /* Rate Limiting */
  app.register(fastifyRateLimit, {
    max: Number(process.env.RATE_LIMIT),
    timeWindow: process.env.RATE_LIMIT_WINDOW,
    cache: 10000,
    keyGenerator: (req) => req.ip,
  });

  /* Microservices Routes */

  // Auth Service
  app.register(fastifyHttpProxy, {
    upstream: process.env.AUTH_SERVICE_URL as string,
    prefix: "/auth",
    rewritePrefix: "/auth",
    http2: false,
  });

  //Portfolio Service
  app.register(fastifyHttpProxy, {
    upstream: process.env.DESIGNER_TAILOR_SERVICE_URL as string,
    prefix: "/portfolios",
    preHandler: authenticateRequest,
    rewritePrefix: "/portfolios",
    http2: false,
  });

  /* Health Check */

  app.get("/health", async () => {
    return { status: "OK", uptime: process.uptime() };
  });

  return app;
}
