import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { RIDER_COOKIE, SESSION_SECONDS, getSecret } from "./authConfig";
import { db } from "./db";
import { ApiError } from "./http";
import type { Rider } from "@/lib/types";
import { riderApproved } from "@/lib/rider";

export function hashPassword(pw: string) { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`; }
export function verifyPassword(pw: string, stored?: string) {
  if (!stored) return false; const [salt, h] = stored.split(":"); if (!salt || !h) return false;
  const a = Buffer.from(h, "hex"), b = scryptSync(pw, salt, 32); return a.length === b.length && timingSafeEqual(a, b);
}

export async function createRiderSession(riderId: string) {
  const secret = getSecret(); if (!secret) throw new ApiError(503, "AUTH_SECRET is not configured.");
  const token = await new SignJWT({ role: "rider" }).setProtectedHeader({ alg: "HS256" }).setSubject(riderId).setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(secret);
  (await cookies()).set(RIDER_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_SECONDS });
}
export async function clearRiderSession() { (await cookies()).delete(RIDER_COOKIE); }

/** The signed-in rider (re-checked against the database so deactivated riders lose access at once). */
export async function getRider(): Promise<Rider | null> {
  const secret = getSecret(); const token = (await cookies()).get(RIDER_COOKIE)?.value;
  if (!secret || !token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "rider" || !payload.sub) return null;
    const r = await db.get<Rider>("riders", payload.sub);
    return r && r.active && riderApproved(r) ? r : null;
  } catch { return null; }
}
export async function requireRider() { const r = await getRider(); if (!r) throw new ApiError(401, "Please sign in as a rider"); return r; }
export const publicRider = (r: Rider) => ({ id: r.id, name: r.name, phone: r.phone, vehicle: r.vehicle, area: r.area });
