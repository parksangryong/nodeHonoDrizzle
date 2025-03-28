import type { Context } from "hono";
import * as fs from "fs/promises";
import * as path from "path";
import { HTTPException } from "hono/http-exception";
import { db } from "../db";
import { uploads } from "../db/schema";

export const uploadFile = async (c: Context) => {
  try {
    console.log("$$$$ uploadFile");
    // multipart/form-data 파싱
    const body = await c.req.formData();
    const file = body.get("file") as File;
    const userId = body.get("userId") as string;

    // 파일 존재 여부 상세 체크
    if (!file || !(file instanceof File)) {
      throw new HTTPException(400, {
        message: "파일이 없거나 올바른 형식이 아닙니다",
      });
    }

    // 파일 정보 로깅
    console.log("파일명:", file.name);
    console.log("파일 타입:", file.type);
    console.log("파일 크기:", file.size);

    // 파일을 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // uploads 폴더 생성 (없는 경우)
    const uploadsDir = "uploads";
    await fs.mkdir(uploadsDir, { recursive: true });

    // uploads 폴더에 파일 저장
    const uploadPath = path.join(uploadsDir, file.name);
    await fs.writeFile(uploadPath, buffer);

    // DB에 저장
    await db.insert(uploads).values({
      userId: parseInt(userId),
      fileUrl: uploadPath,
    });

    return c.json({
      message: "파일 업로드에 성공했습니다.",
      fileName: file.name,
      path: uploadPath,
    });
  } catch (error) {
    console.error("파일 업로드 에러:", error);
    throw new HTTPException(500, {
      message: "파일 업로드에 실패했습니다.",
    });
  }
};
