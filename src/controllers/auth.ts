import { db } from "../db";
import { users, tokens } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { generateTokens } from "../utils/jwt";
import { jwtDecode } from "jwt-decode";

interface CustomHTTPException extends HTTPException {
  code?: string;
}

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

// ... existing code ...

// 리프레시 토큰으로 새 토큰 발급 함수 추가
export const refreshTokens = async (refreshToken: string) => {
  try {
    const decoded = jwtDecode(refreshToken);
    const { userId, username } = decoded as {
      userId: number;
      username: string;
    };

    // DB에서 저장된 리프레시 토큰 확인
    const [storedToken] = await db
      .select()
      .from(tokens)
      .where(eq(tokens.userId, userId));

    if (!storedToken || storedToken.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    // 새로운 토큰 쌍 생성
    const newTokens = generateTokens(username, userId);

    // DB 토큰 정보 업데이트
    await db
      .update(tokens)
      .set({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .where(eq(tokens.userId, userId));

    return newTokens;
  } catch (error) {
    throw new HTTPException(401, {
      message: "유효하지 않은 리프레시 토큰입니다.",
      code: "JWT-002",
    } as CustomHTTPException);
  }
};
