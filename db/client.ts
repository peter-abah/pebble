import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expoDb = openDatabaseSync("pebble.db", { enableChangeListener: true });

export const db = drizzle(expoDb, { casing: "snake_case" });
