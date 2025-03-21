import type { Context, Next } from "hono";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
} from "../utils/jwt";
import { db } from "../db";
import { tokens } from "../db/schema";
import { eq } from "drizzle-orm";

export const authenticateToken = async (c: Context, next: Next) => {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];
  const refreshToken = c.req.header("X-Refresh-Token");

  if (!accessToken) {
    return c.json({ message: "인증 토큰이 필요합니다." }, 401);
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    if (decoded) {
      // 토큰 테이블에서 유효성 검증
      const [storedToken] = await db
        .select()
        .from(tokens)
        .where(eq(tokens.accessToken, accessToken));

      if (!storedToken || new Date(storedToken.expiresAt) < new Date()) {
        return c.json(
          { message: "만료되었거나 유효하지 않은 토큰입니다." },
          401
        );
      }

      c.set("user", decoded);
      await next();
    }
  } catch (error) {
    if (refreshToken) {
      try {
        const refreshDecoded = verifyRefreshToken(refreshToken);
        if (refreshDecoded) {
          const { username, userId } = refreshDecoded as {
            username: string;
            userId: number;
          };

          // 새 토큰 생성
          const newTokens = generateTokens(username, userId);

          // DB에 새 토큰 정보 업데이트
          await db
            .update(tokens)
            .set({
              accessToken: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간
              updatedAt: new Date(),
            })
            .where(eq(tokens.userId, userId));

          c.header("New-Access-Token", newTokens.accessToken);
          c.header("New-Refresh-Token", newTokens.refreshToken);

          c.set("user", { username, userId });
          await next();
        }
      } catch (refreshError) {
        return c.json({ message: "유효하지 않은 리프레시 토큰입니다." }, 401);
      }
    } else {
      return c.json({ message: "리프레시 토큰이 필요합니다." }, 401);
    }
  }
};
