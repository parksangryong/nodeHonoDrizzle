import { db } from "../db";
import { comments, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export const getComments = async (
  offset: number,
  count: number,
  boardId: number
) => {
  const comment = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userId: comments.userId,
      username: users.name,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .limit(count)
    .offset(offset)
    .orderBy(desc(comments.createdAt))
    .where(eq(comments.boardId, boardId));

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
