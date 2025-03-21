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

  const tokens = generateTokens(name, insertId);
  return tokens;
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

  const tokens = generateTokens(user.name, user.id);

  return tokens;
};

export const logout = async (accessToken: string) => {
  const decoded = jwtDecode(accessToken);
  const { userId } = decoded as { userId: number };

  await db.delete(tokens).where(eq(tokens.userId, userId));
};
