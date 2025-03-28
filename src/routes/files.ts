import { Hono } from "hono";
import { uploadFile } from "../controllers/uploads";
import { downloadFile } from "../controllers/download";
import { listFiles, deleteFile } from "../controllers/image";

const app = new Hono();

app.post("/upload", uploadFile);

app.get("/download/:id", downloadFile);

app.get("/list", listFiles);

app.delete("/:id", deleteFile);

export default app;
