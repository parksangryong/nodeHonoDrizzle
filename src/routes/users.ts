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

  return c.json({ users });
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
    const { name, age, email } = c.req.valid("json");
    await createUser(name, age, email);

    return c.json({
      success: true,
      message: "유저 생성에 성공했습니다.",
    });
  }
);

export default app;
