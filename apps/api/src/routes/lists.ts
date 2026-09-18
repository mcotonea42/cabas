import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { broadcastChange } from "../lib/broadcast.js";
import { requireUser } from "../lib/session.js";

export async function listsRoutes(fastify: FastifyInstance) {
  fastify.get("/lists", async (request, reply) => {
    const user = await requireUser(request, reply);

    if (!user) return;

    const lists = await prisma.list.findMany({
      where: { householdId: user.householdId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { select: { isChecked: true}},
      },
    });

    return lists.map((list) => ({
      id: list.id,
      name: list.name,
      createdAt: list.createdAt,
      itemsCount: list.items.length,
      checkedCount: list.items.filter((item) => item.isChecked).length,
    }));
  });

  fastify.post("/lists", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const { name } = request.body as { name: string };

    if (!name) {
      return reply
        .code(400)
        .send({ error: "name is required to create a list" });
    }

    const list = await prisma.list.create({
      data: { name, householdId: user.householdId },
    });
    broadcastChange();
    return reply.code(201).send(list);
  });

  fastify.get("/lists/:id", async (request, reply) => {
    const user = await requireUser(request, reply);

    if (!user) return;

    const { id } = request.params as { id: string };

    const list = await prisma.list.findUnique({ where: { id } });

    if (!list || list.householdId !== user.householdId) {
      return reply.code(404).send({ error: "list not found" });
    }

    return list;
  });

  fastify.delete("/lists/:id", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const { id } = request.params as { id: string };

    const list = await prisma.list.findUnique({ where: { id } });

    if (!list || list.householdId !== user.householdId) {
      return reply.code(404).send({ error: "list not found" });
    }

    await prisma.list.delete({ where: { id } });
    broadcastChange();
    return reply.code(204).send();
  });

  fastify.get("/lists/:listId/items", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const { listId } = request.params as { listId: string };

    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list || list.householdId !== user.householdId) {
      return reply.code(404).send({ error: "list not found " });
    }

    return prisma.item.findMany({
      where: { listId },
      orderBy: { createdAt: "desc" },
    });
  });

  fastify.post("/lists/:listId/items", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const { listId } = request.params as { listId: string };

    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list || list.householdId !== user.householdId) {
      return reply.code(404).send({ error: "list not found" });
    }

    const { name, quantity } = request.body as {
      name: string;
      quantity?: string;
    };

    if (!name) {
      return reply.code(400).send({ error: "name is required " });
    }
    const item = await prisma.item.create({
      data: { listId, name, quantity },
    });
    broadcastChange();
    return reply.code(201).send(item);
  });

  fastify.delete("/lists/:listId/items/checked", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;

    const { listId } = request.params as { listId: string };

    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list || list.householdId !== user.householdId) {
      return reply.code(404).send({ error: "list not found " });
    }

    await prisma.item.deleteMany({ where: { listId, isChecked: true } });
    broadcastChange();
    return { success: true };
  });
}
