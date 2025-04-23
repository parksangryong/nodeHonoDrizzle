import { db } from "../../db";
import { users, tokens } from "../../db/schema";
import { eq, and } from "drizzle-orm";

// utils
import { generateTokens } from "../../utils/jwt";
import { comparePassword, saveTokens } from "../../utils/auth.util";
import { jwtDecode } from "jwt-decode";

// schema
import type { LoginRequest, RegisterRequest } from "./auth.schema";

// middleware
import { AuthException } from "../../middleware/error.middleware";

// constants
import { Errors } from "../../constants/error";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const register = async ({
  password,
  name,
  email,
  age,
}: RegisterRequest): Promise<TokenPair> => {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length > 0) {
    throw new Error(Errors.AUTH.USER_EXISTS.code);
  }

  const [{ insertId }] = await db
    .insert(users)
    .values({ password, name, email, age });

  const generatedTokens = saveTokens(insertId, name);
  return generatedTokens;
};

export const login = async ({
  email,
  password,
}: LoginRequest): Promise<TokenPair> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new Error(Errors.AUTH.USER_NOT_FOUND.code);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error(Errors.AUTH.PASSWORD_NOT_MATCH.code);
  }

  const generatedTokens = saveTokens(user.id, user.name);
  return generatedTokens;
};

export const logout = async (
  accessToken: string
): Promise<{ message: string }> => {
  const decoded = jwtDecode(accessToken);
  const { userId } = decoded as { userId: number };

  await db.delete(tokens).where(eq(tokens.userId, userId));

  return { message: "로그아웃에 성공했습니다" };
};

export const refreshTokens = async (
  refreshToken: string
): Promise<TokenPair> => {
  const decoded = jwtDecode(refreshToken);
  const { userId, username, exp } = decoded as {
    userId: number;
    username: string;
    exp: number;
  };

  if (exp * 1000 < Date.now()) {
    throw new Error(Errors.JWT.REFRESH_EXPIRED.code);
  }

  const [storedToken] = await db
    .select()
    .from(tokens)
    .where(eq(tokens.userId, userId));

  if (!storedToken || storedToken.refreshToken !== refreshToken) {
    throw new Error(Errors.JWT.INVALID_REFRESH_TOKEN.code);
  }

  const newAccessToken = generateTokens(username, userId).accessToken;

  await db
    .update(tokens)
    .set({
      accessToken: newAccessToken,
    })
    .where(eq(tokens.userId, userId));

  return {
    accessToken: newAccessToken,
    refreshToken: refreshToken,
  };
};
