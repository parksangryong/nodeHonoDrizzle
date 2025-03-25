import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { serve } from "@hono/node-server";

// db
import { connectionResult } from "./db";

// middleware
import { errorHandler } from "./middleware/error.middleware";
import { authenticateToken } from "./middleware/auth.middleware";
import { rateLimit } from "./middleware/rateLimit.middleware";

//routes
import auth from "./routes/auth";
import uploads from "./routes/uploads";
import users from "./routes/users";
import board from "./routes/board";
import comment from "./routes/comment";

const app = new Hono();

// 미들웨어 설정
app.use("*", cors()); // CORS 활성화
app.use("*", logger()); // morgan과 유사한 로깅
app.use("*", timing()); // response time 측정
app.use("*", rateLimit()); // 요청 제한

connectionResult();
errorHandler(app);

// 먼저 로그인 라우트를 설정
app.route("/auth", auth);

// 그 다음 인증 미들웨어 적용 (로그인 이외의 모든 라우트에 대해)
app.use("/users/*", authenticateToken);
app.use("/uploads/*", authenticateToken);
app.use("/boards/*", authenticateToken);

// 보호된 라우트들
app.route("/users", users);
app.route("/uploads", uploads);
app.route("/boards", board);
app.route("/comments", comment);

const PORT = process.env.PORT || 3000;

serve(
  {
    port: Number(PORT),
    fetch: app.fetch,
  },
  (info) => {
    console.log(`서버가 포트 ${info.port}에서 실행 중입니다.`);
  }
);
