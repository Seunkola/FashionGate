import { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "../config/supabaseClient";

export async function authenticateRequest(
  req: FastifyRequest,
  res: FastifyReply
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.code(401).send({ error: "UnAuthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.code(401).send({ error: "Token missing" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.code(401).send({ error: "Invalid token" });
    }

    return;
  } catch (err) {
    return res.code(401).send({ error: "Invalid Token" });
  }
}
