import { Hono } from "hono";
import { register, login, logout } from "../controllers/auth";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const tokens = await login(email, password);

  return c.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

app.post("/register", async (c) => {
  const { password, name, email, age } = await c.req.json();
  const tokens = await register(password, name, email, age);

  return c.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

app.post("/logout", async (c) => {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];

  if (!accessToken) {
    throw new HTTPException(401, {
      message: "토큰이 존재하지 않습니다.",
    });
  }
  await logout(accessToken);

  return c.json({ message: "로그아웃에 성공했습니다." });
});

export default app;
