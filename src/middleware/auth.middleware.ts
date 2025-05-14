import type { Context, Next } from "hono";

// utils
import { getAccessToken, verifyAccessToken } from "../utils/jwt";

// constants
import { Errors } from "../constants/error";

interface JwtPayload {
  name: string;
  userId: number;
}

export const authenticateToken = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error(Errors.JWT.TOKEN_REQUIRED.code);
  }

  const accessToken = getAccessToken(authHeader);
  const decoded = verifyAccessToken(accessToken) as JwtPayload;

  if (!decoded) {
    throw new Error(Errors.JWT.ACCESS_EXPIRED.code);
  }

  await next();
};
