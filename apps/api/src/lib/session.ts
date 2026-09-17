import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../db.js";

export async function getSessionUser(request: FastifyRequest) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function requireUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const user = await getSessionUser(request);
  if (!user) {
    reply.code(401).send({ error: "not logged in" });
    return null;
  }

  return user;
}
