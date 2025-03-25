import { Hono } from "hono";
import { createUser, getUsers } from "../controllers/users";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

const userSchema = z.object({
  name: z.string().min(2),
  age: z.number().min(1),
  email: z.string().email(),
});

app.get("/", async (c) => {
  const users = await getUsers();

  return c.json({
    success: true,
    message: "유저 조회 성공",
    data: users,
  });
});

app.post(
  "/",
  zValidator("json", userSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "데이터 형식이 올바르지 않습니다.",
      });
    }
  }),
  async (c) => {
    return c.json({
      success: true,
      message: "유저 생성 성공",
    });
  }
);

export default app;
