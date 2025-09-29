import { buildApp } from "./app";

/* Start Gateway */
const PORT = Number(process.env.PORT);

const start = async () => {
  const app = buildApp();
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    app.log.info(`API gateway running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
