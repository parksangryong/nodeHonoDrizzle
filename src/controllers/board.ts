import { db } from "../db";
import { boards, comments } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const getBoards = async (offset: number, count: number) => {
  const board = await db.select().from(boards).limit(count).offset(offset);

  return {
    boardList: board,
    metadata: {
      totalCount: board.length,
      offset: offset,
      count: count,
    },
  };
};

export const createBoard = async (
  userId: number,
  title: string,
  content: string
) => {
  const board = await db.insert(boards).values({ userId, title, content });

  return board;
};

export const updateBoard = async (
  id: number,
  userId: number,
  title: string,
  content: string
) => {
  const board = await db
    .update(boards)
    .set({ title, content })
    .where(and(eq(boards.id, id), eq(boards.userId, userId)));

  return board;
};

export const deleteBoard = async (id: number) => {
  return await db.transaction(async (tx) => {
    // 먼저 해당 게시물의 모든 댓글 삭제
    await tx.delete(comments).where(eq(comments.boardId, id));

    // 그 다음 게시물 삭제
    const board = await tx.delete(boards).where(eq(boards.id, id));

    return board;
  });
};
