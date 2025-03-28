import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/comment";
import { HTTPException } from "hono/http-exception";
const app = new Hono();

const commentSchema = z.object({
  userId: z.number().min(1),
  boardId: z.number().min(1),
  content: z.string().min(1),
});

app.get("/", async (c) => {
  const offset = c.req.query("offset") || 0;
  const count = c.req.query("count") || 10;
  const boardId = c.req.query("boardId");
  const comments = await getComments(
    Number(offset),
    Number(count),
    Number(boardId)
  );
  return c.json(comments);
});

app.post(
  "/",
  zValidator("json", commentSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "데이터 형식이 올바르지 않습니다.",
      });
    }
  }),
  async (c) => {
    const { userId, boardId, content } = c.req.valid("json");
    await createComment(userId, boardId, content);
    return c.json({ message: "댓글 생성에 성공했습니다." });
  }
);

app.patch(
  "/:id",
  zValidator("json", commentSchema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "데이터 형식이 올바르지 않습니다.",
      });
    }
  }),
  async (c) => {
    const { id } = c.req.param();
    const { userId, boardId, content } = c.req.valid("json");
    await updateComment(Number(id), userId, boardId, content);
    return c.json({ message: "댓글 수정에 성공했습니다." });
  }
);

app.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await deleteComment(Number(id));
  return c.json({ message: "댓글 삭제에 성공했습니다." });
});
export default app;
