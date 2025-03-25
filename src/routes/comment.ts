import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/comment";

const app = new Hono();

const commentSchema = z.object({
  userId: z.number().min(1),
  boardId: z.number().min(1),
  content: z.string().min(1),
});

app.get("/", async (c) => {
  const offset = c.req.query("offset") || 0;
  const count = c.req.query("count") || 10;
  const comments = await getComments(Number(offset), Number(count));
  return c.json(comments);
});

app.post("/", zValidator("json", commentSchema), async (c) => {
  const { userId, boardId, content } = c.req.valid("json");
  await createComment(userId, boardId, content);
  return c.json({ message: "Comment created successfully" });
});

app.patch("/:id", zValidator("json", commentSchema), async (c) => {
  const { id } = c.req.param();
  const { userId, boardId, content } = c.req.valid("json");
  await updateComment(Number(id), userId, boardId, content);
  return c.json({ message: "Comment updated successfully" });
});

app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await deleteComment(Number(id));
  return c.json({ message: "Comment deleted successfully" });
});
export default app;
