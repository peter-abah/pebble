import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";
const expoDb = openDatabaseSync("pebble.db", { enableChangeListener: true });

export const db = drizzle(expoDb, {
  schema: schema,
});
