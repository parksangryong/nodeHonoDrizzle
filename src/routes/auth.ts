import { Hono } from "hono";
import { register, login } from "../controllers/auth";

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
export default app;
