import Fastify from "fastify";

export async function createAuthService() {
  const app = Fastify();

  app.post("/auth", async () => {
    return { service: "auth", status: "ok" };
  });

  await app.listen({ port: 4001, host: "127.0.0.1" });
  return app;
}

export async function createPortfolioService() {
  const app = Fastify();

  app.get("/portfolios", async (req) => {
    return {
      service: "portfolio",
    };
  });

  await app.listen({ port: 4002, host: "127.0.0.1" });
  return app;
}
