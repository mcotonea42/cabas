import type { FastifyReply } from "fastify";

const clients = new Set<FastifyReply>();

export function addClient(reply: FastifyReply) {
  clients.add(reply);
}

export function removeClient(reply: FastifyReply) {
  clients.delete(reply);
}

export function broadcastChange() {
  for (const client of clients) {
    client.sse.send({ event: "items-changed", data: "refresh" });
  }
}
