import type { FastifyInstance } from "fastify";
import { Resend } from "resend";
import { prisma } from "../db.js";
import { getSessionUser } from "../lib/session.js";

const resend = new Resend(process.env.RESEND_API_KEY);

async function createSessionAndSetCookie(userId: string, reply: any) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });

  reply.setCookie("sessionId", session.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
  });
}

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function emailRateLimitKey(request: any): string {
  const email = (request.body as { email?: string } | undefined)?.email;
  return email?.trim().toLowerCase() || request.ip;
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/auth/otp/request",
  {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: "10 minutes",
        keyGenerator: emailRateLimitKey,
      },
    },
  },
  async (request, reply) => {
    const { email } = request.body as { email: string };
    if (!email) {
      return reply.code(400).send({ error: "email is required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.loginCode.create({ data: { email, code, expiresAt } });
    request.log.info(`[OTP] Code pour ${email} : ${code}`);
    await resend.emails.send({
      from: "Cabas <cabas@mail.nivlem.fr>",
      to: email,
      subject: "Ton code de connexion Cabas",
      html: `<p>Ton code de connexion est : <strong>${code}</strong></p><p>Il expire dans 10 minutes.</p>`,
    });

    return { success: true, isNewUser: !existingUser };
  });

  fastify.post("/auth/otp/verify",
  {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "10 minutes",
        keyGenerator: emailRateLimitKey,
      },
    },
  },
  async (request, reply) => {
    const { email, code, household } = request.body as {
      email: string;
      code: string;
      household?:
        { type: "create"; name: string } | { type: "join"; inviteCode: string };
    };
    if (!email || !code) {
      return reply.code(400).send({ error: "email and code are required" });
    }

    const loginCode = await prisma.loginCode.findFirst({
      where: { email, code },
      orderBy: { createdAt: "desc" },
    });

    if (!loginCode || loginCode.expiresAt < new Date()) {
      return reply.code(401).send({ error: "invalid or expired code" });
    }

    await prisma.loginCode.delete({ where: { id: loginCode.id } });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      if (!household) {
        return reply
          .code(400)
          .send({ error: "household choice is required for new accounts" });
      }

      let householdId: string;

      if (household.type === "create") {
        const newHouseholdId = await prisma.household.create({
          data: { name: household.name, inviteCode: generateInviteCode() },
        });
        householdId = newHouseholdId.id;
      } else {
        const existing = await prisma.household.findUnique({
          where: { inviteCode: household.inviteCode },
        });

        if (!existing) {
          return reply.code(400).send({ error: "invalid invite code " });
        }
        householdId = existing.id;
      }

      user = await prisma.user.create({ data: { email, householdId } });
    }

    await createSessionAndSetCookie(user.id, reply);
    return { success: true };
  });

  fastify.get("/auth/me", async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) {
      return reply.code(401).send({ error: "not logged in" });
    }

    const household = await prisma.household.findUnique({
      where: { id: user.householdId },
    });
    return { ...user, household };
  });

  fastify.post("/auth/logout", async (request, reply) => {
    const sessionId = request.cookies.sessionId;

    if (sessionId) {
      await prisma.session.deleteMany({ where: { id: sessionId } });
    }
    reply.clearCookie("sessionId", { path: "/" });
    return { success: true };
  })
}
