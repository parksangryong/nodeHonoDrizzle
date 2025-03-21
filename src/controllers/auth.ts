import { db } from "../db";
import { users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateTokens } from "../utils/jwt";

export const register = async (
  password: string,
  name: string,
  email: string,
  age: number
) => {
  const user = await db.insert(users).values({ password, name, email, age });

  if (!user) {
    throw new HTTPException(400, {
      message: "User not found",
    });
  }

  const tokens = generateTokens(name, password);

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

  const tokens = generateTokens(user.name, user.password);

  return tokens;
};
