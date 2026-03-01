import { prisma } from "@/lib/prisma";

interface RateLimitOptions {
  max: number;
  windowMs: number;
  prefix?: string;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: Date;
}

function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  return (forwarded?.split(",")[0] ?? real ?? "unknown").trim();
}

export async function rateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { max, windowMs, prefix = "rl" } = options;
  const ip = getIP(request);
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  const key = `${prefix}:${ip}`;
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const count = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM "RateLimitAttempt"
      WHERE key = ${key} AND "createdAt" > ${windowStart}
    `;
    const attempts = Number(count[0]?.count ?? 0);
    if (attempts >= max) return { ok: false, remaining: 0, resetAt };

    await prisma.$executeRaw`
      INSERT INTO "RateLimitAttempt" (id, key, "createdAt")
      VALUES (gen_random_uuid(), ${key}, ${now})
    `;

    if (Math.random() < 0.01) {
      const cutoff = new Date(now.getTime() - windowMs * 10);
      await prisma.$executeRaw`DELETE FROM "RateLimitAttempt" WHERE "createdAt" < ${cutoff}`;
    }

    return { ok: true, remaining: max - attempts - 1, resetAt };
  } catch {
    return { ok: true, remaining: max, resetAt };
  }
}
