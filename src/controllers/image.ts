import { Context } from "hono";
import { db } from "../db";
import { uploads } from "../db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";

export const listFiles = async (c: Context) => {
  const files = await db.select().from(uploads);

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024)
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  return c.json({
    files: files.map((file) => ({
      id: file.id,
      userId: file.userId,
      fileUrl: file.fileUrl,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: formatFileSize(file.fileSize),
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    })),
  });
};

export const deleteFile = async (c: Context) => {
  const id = c.req.param("id");
  const file = await db
    .select()
    .from(uploads)
    .where(eq(uploads.id, Number(id)))
    .then((res) => res[0]);

  if (!file) {
    return c.json({ error: "파일을 찾을 수 없습니다" }, 404);
  }

  // 파일 시스템에서 파일 삭제
  const filePath = `uploads/${file.fileUrl}`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await db.delete(uploads).where(eq(uploads.id, Number(id)));
  return c.json({ message: "파일이 삭제되었습니다" });
};
