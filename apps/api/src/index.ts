import Fastify from "fastify";
import cors from "@fastify/cors";
import sse from "@fastify/sse";
import cookie from "@fastify/cookie";
import rateLimit from '@fastify/rate-limit'
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { eventsRoutes } from "./routes/events.js";
import { listsRoutes } from "./routes/lists.js";
import { itemsRoutes } from "./routes/items.js";

const server = Fastify({ logger: true });

const LOCAL_NETWORK_ORIGIN =
  /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):3000$/;

await server.register(cors, {
  origin: (origin, cb) => {
    if (process.env.NODE_ENV === "production") {
      if (origin === process.env.CORS_ORIGIN) {
        cb(null, true);
        return;
      }
      cb(new Error("Not allowed by CORS"), false);
      return;
    }

    if (!origin || LOCAL_NETWORK_ORIGIN.test(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error("Not allowed by CORS"), false);

  },
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
});

await server.register(sse);
await server.register(cookie);
await server.register(rateLimit, { global: false });

await server.register(healthRoutes);
await server.register(authRoutes);
await server.register(eventsRoutes);
await server.register(listsRoutes);
await server.register(itemsRoutes);

server.listen({ port: 3001, host: "0.0.0.0" }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
