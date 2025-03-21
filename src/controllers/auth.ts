import { db } from "../db";
import { users, tokens } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateTokens } from "../utils/jwt";

import { jwtDecode } from "jwt-decode";

export const register = async (
  password: string,
  name: string,
  email: string,
  age: number
) => {
  const [{ insertId }] = await db
    .insert(users)
    .values({ password, name, email, age });

  const generatedTokens = generateTokens(name, insertId);

  await db.insert(tokens).values({
    userId: insertId,
    accessToken: generatedTokens.accessToken,
    refreshToken: generatedTokens.refreshToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return generatedTokens;
};

export const login = async (email: string, password: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.password, password)));

  if (!user) {
    throw new HTTPException(400, {
      message: "User not found",
    });
  }

  const generatedTokens = generateTokens(user.name, user.id);

  await db.insert(tokens).values({
    userId: user.id,
    accessToken: generatedTokens.accessToken,
    refreshToken: generatedTokens.refreshToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return generatedTokens;
};

export const logout = async (accessToken: string) => {
  const decoded = jwtDecode(accessToken);
  const { userId } = decoded as { userId: number };

  await db.delete(tokens).where(eq(tokens.userId, userId));

  return { message: "로그아웃 성공" };
};
