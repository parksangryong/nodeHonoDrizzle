import { Hono } from "hono";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/users";

const app = new Hono();

app.get("/", async (c) => {
  const users = await getUsers();

  return c.json({ users });
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await getUser(Number(id));

  return c.json({ user });
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const { name, age, password } = await c.req.json();
  const user = await updateUser(Number(id), name, age, password);

  return c.json({ user });
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await deleteUser(Number(id));

  return c.json({ user });
});

export default app;
