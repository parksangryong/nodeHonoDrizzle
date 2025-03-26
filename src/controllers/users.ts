import { db } from "../db";
import { users } from "../db/schema";

export const getUsers = async () => {
  return await db.select().from(users);
};
