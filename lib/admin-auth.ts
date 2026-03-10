import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const ADMIN_COOKIE_NAME = "tc_pilot_admin";

function getEnv(key: string): string | undefined {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

const ADMIN_EMAIL = getEnv("ADMIN_EMAIL");
const ADMIN_PASSWORD = getEnv("ADMIN_PASSWORD");
const ADMIN_PASSWORD_HASH = getEnv("ADMIN_PASSWORD_HASH");
const ADMIN_SECRET = getEnv("ADMIN_SECRET") ?? getEnv("NEXTAUTH_SECRET") ?? "tc_pilot_admin_secret";

if (!ADMIN_EMAIL) {
  // eslint-disable-next-line no-console
  console.warn("ADMIN_EMAIL is not set. Admin login will always fail.");
}

async function verifyPassword(plain: string, hash?: string): Promise<boolean> {
  if (hash) {
    try {
      return await bcrypt.compare(plain, hash);
    } catch {
      return false;
    }
  }
  if (!ADMIN_PASSWORD) return false;
  return plain === ADMIN_PASSWORD;
}

export async function validateAdminCredentials(email: string, password: string): Promise<boolean> {
  if (!ADMIN_EMAIL) return false;
  if (email !== ADMIN_EMAIL) return false;
  return verifyPassword(password, ADMIN_PASSWORD_HASH);
}

export function createAdminToken(email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: email,
      iat: Math.floor(Date.now() / 1000),
    })
  ).toString("base64url");
  const data = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", ADMIN_SECRET!).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;
  const expected = crypto.createHmac("sha256", ADMIN_SECRET!).update(data).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (decoded.sub !== ADMIN_EMAIL) return false;
    return true;
  } catch {
    return false;
  }
}

export function getAdminFromRequest(request: NextRequest): { isAdmin: boolean } {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return { isAdmin: verifyAdminToken(token) };
}

export function getAdminFromCookies(): { isAdmin: boolean } {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return { isAdmin: verifyAdminToken(token) };
}

