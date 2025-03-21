import { db } from "../db";
import { boards } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const getBoards = async (offset: number, count: number) => {
  console.log(offset, count);
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
  const board = await db.delete(boards).where(eq(boards.id, id));

  return board;
};
