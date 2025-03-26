import { Hono } from "hono";
import { getUsers } from "../controllers/users";

const app = new Hono();

app.get("/", async (c) => {
  const users = await getUsers();

  return c.json({ users });
});

export default app;
