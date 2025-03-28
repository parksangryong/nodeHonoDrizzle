import { db } from "../db";
import { users, uploads, boards, comments, tokens } from "../db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export const getUsers = async () => {
  return await db.select().from(users);
};

export const getUser = async (id: number) => {
  return await db.select().from(users).where(eq(users.id, id));
};

export const updateUser = async (
  id: number,
  name: string,
  age: number,
  password: string
) => {
  return await db
    .update(users)
    .set({ name, age, password })
    .where(eq(users.id, id));
};

export const deleteUser = async (id: number) => {
  return await db.transaction(async (tx) => {
    // 먼저 삭제할 업로드 파일들의 경로를 가져옵니다
    const userUploads = await tx
      .select({ fileUrl: uploads.fileUrl })
      .from(uploads)
      .where(eq(uploads.userId, id));

    // 실제 파일들을 삭제합니다
    for (const upload of userUploads) {
      try {
        await fs.unlink(path.join(process.cwd(), upload.fileUrl));
      } catch (error) {
        console.error(`파일 삭제 실패: ${upload.fileUrl}`, error);
      }
    }

    // 데이터베이스에서 관련 데이터를 삭제합니다
    await tx.delete(uploads).where(eq(uploads.userId, id));
    await tx.delete(comments).where(eq(comments.userId, id));
    await tx.delete(boards).where(eq(boards.userId, id));
    await tx.delete(users).where(eq(users.id, id));
    await tx.delete(tokens).where(eq(tokens.userId, id));
    return { message: "삭제 완료" };
  });
};
