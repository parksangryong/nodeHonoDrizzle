import { Hono } from "hono";

import { uploadFile } from "../controllers/uploads";
import { downloadFile, listFiles, deleteFile } from "../controllers/image";
const app = new Hono();

app.post("/", uploadFile);

app.get("/download/:id", downloadFile);

app.get("/list", listFiles);

app.delete("/:id", deleteFile);

export default app;
