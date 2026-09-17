import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { broadcastChange } from "../lib/broadcast.js";
import { requireUser } from "../lib/session.js";

export async function itemsRoutes(fastify: FastifyInstance) {
  fastify.patch("/items/:id", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const { id } = request.params as { id: string };

    const existingItem = await prisma.item.findUnique({
      where: { id },
      include: { list: true },
    });

    if (!existingItem || existingItem.list.householdId !== user.householdId) {
      return reply.code(404).send({ error: "item not found" });
    }

    const { isChecked, quantity } = request.body as {
      isChecked?: boolean;
      quantity?: string;
    };
    const item = await prisma.item.update({
      where: { id },
      data: { isChecked, quantity },
    });
    broadcastChange();
    return item;
  });

  fastify.delete("/items/:id", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const { id } = request.params as { id: string };

    const existingItem = await prisma.item.findUnique({
      where: { id },
      include: { list: true },
    });

    if (!existingItem || existingItem.list.householdId !== user.householdId) {
      return reply.code(404).send({ error: "item not found" });
    }

    await prisma.item.delete({ where: { id } });
    broadcastChange();
    return reply.code(204).send();
  });
}
