import crypto from "crypto";
import crc from "crc";
import path from "path";

const unsignedCrc32 = (str: string) => {
  const signed = crc.crc32(str);
  return (signed >>> 0).toString();
};

export const generateStoredFileName = (originalFilename: string): string => {
  const ext = path.extname(originalFilename); // .jpeg
  const crc32 = unsignedCrc32(originalFilename);
  const rand = crypto
    .randomBytes(6)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 8);
  const sha1 = crypto.createHash("sha1").update(originalFilename).digest("hex");

  return `${crc32}_${rand}_${sha1}${ext}`;
};

export const randomString = () => {
  return crypto
    .randomBytes(15)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 20);
};

export const getFileUrl = (filename: string | null) => {
  const homePath = process.env.HOME_PATH;
  return filename ? `${homePath}${filename}` : null;
};
