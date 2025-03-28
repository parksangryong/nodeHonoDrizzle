import { Hono } from "hono";
import { uploadFile } from "../controllers/uploads";
import { downloadFile, listFiles, deleteFile } from "../controllers/image";
import { authenticateToken } from "../middleware/auth.middleware";

const app = new Hono();

app.post("/upload", authenticateToken, uploadFile);

app.get("/download/:id", authenticateToken, downloadFile);

app.get("/list", authenticateToken, listFiles);

app.delete("/:id", authenticateToken, deleteFile);

export default app;
