import type { FastifyInstance } from "fastify";
import { addClient, removeClient } from "../lib/broadcast.js";

export async function eventsRoutes(fastify: FastifyInstance) {
  fastify.get("/events", { sse: true }, async (request, reply) => {
    reply.sse.keepAlive();
    await reply.sse.send({ event: "connected", data: "ok" });
    addClient(reply);
    request.raw.on("close", () => {
      removeClient(reply);
    });
  });
}
