import Fastify from "fastify";
import cors from "@fastify/cors";
import sse from "@fastify/sse";
import cookie from "@fastify/cookie";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { eventsRoutes } from "./routes/events.js";
import { listsRoutes } from "./routes/lists.js";
import { itemsRoutes } from "./routes/items.js";

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
});
await server.register(sse);
await server.register(cookie);

await server.register(healthRoutes);
await server.register(authRoutes);
await server.register(eventsRoutes);
await server.register(listsRoutes);
await server.register(itemsRoutes);

server.listen({ port: 3001 }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
