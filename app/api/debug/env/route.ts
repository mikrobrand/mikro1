export const runtime = "nodejs";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const host =
    url.includes("@") ? url.split("@")[1]?.split("/")[0] ?? null : null;

  return Response.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlHost: host,
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    hasSellerId: Boolean(process.env.MVP_SELLER_ID),
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}
