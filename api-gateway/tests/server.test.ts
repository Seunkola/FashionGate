import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createAuthService, createPortfolioService } from "./mocks/upstreams";

// mock authenticateRequest
vi.mock("../src/middleware/jwt", () => {
  return {
    authenticateRequest: vi.fn(async (req, reply) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || authHeader !== "Bearer mock-valid-token") {
        return reply.status(401).send({ error: "UnAuthorized" });
      }
    }),
  };
});

//set env to point gateway at mocks
process.env.AUTH_SERVICE_URL = "http://127.0.0.1:4001";
process.env.DESIGNER_TAILOR_SERVICE_URL = "http://127.0.0.1:4002";

import { buildApp } from "../src/app";

describe("API Gateway with mocked data", () => {
  let authService: any;
  let portfolioService: any;
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    authService = await createAuthService();
    portfolioService = await createPortfolioService();
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await authService.close();
    await portfolioService.close();
  });

  it("should return health check", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty("status", "OK");
  });

  it("should proxy /auth/test to Auth Service", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ service: "auth", status: "ok" });
  });

  it("should reject unauthorized portfolio requests", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/portfolios",
    });

    expect(res.statusCode).toBe(401);
  });

  it("should forward authorized portfolio request", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/portfolios",
      headers: {
        authorization: "Bearer mock-valid-token",
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ service: "portfolio" });
  });
});
