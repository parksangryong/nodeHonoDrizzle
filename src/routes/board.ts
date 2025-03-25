import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../controllers/board";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

const boardSchema = z.object({
  userId: z.number().min(1),
  title: z.string().min(3),
  content: z.string().min(3),
});

app.get("/", async (c) => {
  const offset = c.req.query("offset") || 0;
  const count = c.req.query("count") || 10;
  const boards = await getBoards(Number(offset), Number(count));
  return c.json(boards);
});

app.post(
  "/",
  zValidator("json", boardSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "데이터 형식이 올바르지 않습니다.",
      });
    }
  }),
  async (c) => {
    const { userId, title, content } = c.req.valid("json");
    await createBoard(userId, title, content);
    return c.json({ message: "Board created successfully" });
  }
);

app.patch(
  "/:id",
  zValidator("json", boardSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "데이터 형식이 올바르지 않습니다.",
      });
    }
  }),
  async (c) => {
    const { id } = c.req.param();
    const { userId, title, content } = c.req.valid("json");
    await updateBoard(Number(id), userId, title, content);
    return c.json({ message: "Board updated successfully" });
  }
);

app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await deleteBoard(Number(id));
  return c.json({ message: "Board deleted successfully" });
});
export default app;
