import { db } from "../db";
import { comments } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const getComments = async (offset: number, count: number) => {
  const comment = await db.select().from(comments).limit(count).offset(offset);

  return {
    commentList: comment,
    metadata: {
      totalCount: comment.length,
      offset: offset,
      count: count,
    },
  };
};

export const createComment = async (
  userId: number,
  boardId: number,
  content: string
) => {
  const comment = await db
    .insert(comments)
    .values({ userId, boardId, content });

  return comment;
};

export const updateComment = async (
  id: number,
  userId: number,
  boardId: number,
  content: string
) => {
  const comment = await db
    .update(comments)
    .set({ content })
    .where(
      and(
        eq(comments.id, id),
        eq(comments.userId, userId),
        eq(comments.boardId, boardId)
      )
    );

  return comment;
};

export const deleteComment = async (id: number) => {
  const comment = await db.delete(comments).where(eq(comments.id, id));

  return comment;
};
