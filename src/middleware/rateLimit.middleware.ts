import type { Context, Next } from "hono";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// 기본 설정
const WINDOW_SIZE_IN_SECONDS = 60; // 시간 윈도우 (1분)
const MAX_REQUESTS = 100; // 최대 요청 수

export const rateLimit = () => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header("x-forwarded-for") || "unknown";
    const now = Date.now();

    // store에서 현재 IP의 요청 정보 가져오기
    if (!store[ip]) {
      store[ip] = {
        count: 0,
        resetTime: now + WINDOW_SIZE_IN_SECONDS * 1000,
      };
    }

    // 시간 윈도우가 지났다면 초기화
    if (now > store[ip].resetTime) {
      store[ip] = {
        count: 0,
        resetTime: now + WINDOW_SIZE_IN_SECONDS * 1000,
      };
    }

    // 요청 수 증가
    store[ip].count++;

    // 헤더에 제한 정보 추가
    c.header("X-RateLimit-Limit", MAX_REQUESTS.toString());
    c.header(
      "X-RateLimit-Remaining",
      (MAX_REQUESTS - store[ip].count).toString()
    );
    c.header("X-RateLimit-Reset", store[ip].resetTime.toString());

    // 제한 초과 체크
    if (store[ip].count > MAX_REQUESTS) {
      return c.json(
        {
          message: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
        429
      );
    }

    await next();
  };
};
